import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActionPage } from '../../../shared/components/action-page';
import { StatusBadge } from '../../../shared/components/status-badge/status-badge';
import { Feedback } from '../../../shared/components/feedback/feedback';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { FLOW, OrderAction } from '../../../shared/models/erp.models';
@Component({
  selector: 'app-order-detail', imports: [CommonModule, FormsModule, RouterLink, StatusBadge, Feedback, ConfirmDialog],
  template: `
    <app-feedback [error]="error()" [success]="success()" />
    @if (order(); as o) {
    <header class="page-heading"><div><a class="back-link" routerLink="/orders">← Sales Order</a><h1 class="mono">{{ o.number }}</h1><p class="subtitle">สร้าง {{ o.createdAt | date:'dd/MM/yyyy HH:mm':'+0700' }} · {{ store.warehouseName(o.warehouseId) }}</p></div><app-status-badge [status]="o.status" /></header>
    @if (o.status !== 'Cancelled') { <ol class="flow-steps">@for (step of flow; track step.status; let index = $index) { <li [class.done]="index < stepIndex()" [class.current]="index === stepIndex()"><span>{{ index < stepIndex() ? '✓' : index + 1 }}</span>{{ step.label }}</li> }</ol> }
    <div class="detail-grid"><div><section class="card padded"><h2>ลูกค้าและผู้รับสินค้า</h2><strong>{{ o.customer.name }}</strong><p class="address">{{ o.customer.address }}</p><span class="muted">{{ o.customer.phone || 'ไม่ระบุโทรศัพท์' }}</span></section>
    <section class="card"><div class="card-heading"><h2>รายการสินค้า</h2><span class="muted">{{ o.items.length }} รายการ</span></div><div class="table-wrap"><table><thead><tr><th>สินค้า</th><th class="numeric">จำนวน</th><th class="numeric">ราคา</th><th class="numeric">รวม</th></tr></thead><tbody>@for (item of o.items; track item.productId) { <tr><td><strong>{{ item.name }}</strong><div class="muted mono">{{ item.sku }}</div></td><td class="numeric">{{ item.quantity | number:'1.0-3' }} {{ item.unit }}</td><td class="numeric">{{ item.price | currency:'THB':'symbol-narrow' }}</td><td class="numeric">{{ item.total | currency:'THB':'symbol-narrow' }}</td></tr> }</tbody></table></div><div class="order-totals"><div><span>ยอดสินค้า</span><strong>{{ o.subtotal | currency:'THB':'symbol-narrow' }}</strong></div><div><span>ส่วนลด</span><span>−{{ o.discount | currency:'THB':'symbol-narrow' }}</span></div><div class="grand-total"><span>ยอดสุทธิ</span><strong>{{ o.total | currency:'THB':'symbol-narrow' }}</strong></div></div></section></div>
    <aside><section class="card padded"><h2>ขั้นตอนถัดไป</h2>
      @switch (o.status) {
        @case ('Draft') { <p>ตรวจจำนวนพร้อมขายก่อนยืนยันออเดอร์</p><button class="btn primary full" (click)="run('check')">ตรวจสอบสินค้า</button> }
        @case ('StockChecked') { <p>ยืนยันเพื่อจองสินค้าไว้สำหรับออเดอร์นี้</p><button class="btn primary full" (click)="pending.set('confirm')">ยืนยันออเดอร์</button> }
        @case ('Confirmed') { <p>สร้างรายการแจ้งชำระเงินสำหรับยอดออเดอร์</p><button class="btn primary full" (click)="run('payment')">สร้างใบแจ้งชำระ / QR</button> }
        @case ('AwaitingPayment') { <p>รอจำลองตรวจรับเงินจากหน้าการชำระเงิน</p>@if (payment(); as p) { <a class="btn primary full" [routerLink]="['/payments', p.id, 'qr']">ไปหน้าชำระเงิน →</a> } }
        @case ('Paid') { <p>รับเงินแล้ว สามารถออกใบเสร็จทดลองได้</p><button class="btn primary full" (click)="run('receipt')">ออกใบเสร็จ</button> }
        @case ('Receipted') { <p>เริ่มเตรียมสินค้าตามรายการในออเดอร์</p><button class="btn primary full" (click)="run('prepare')">เตรียมสินค้า</button> }
        @case ('Preparing') { <p>เมื่อเตรียมครบ ให้ออกใบส่งของ</p><button class="btn primary full" (click)="run('document')">ออกใบส่งของ</button> }
        @case ('ReadyToShip') { <label>เลขติดตามพัสดุ (ถ้ามี)<input [(ngModel)]="tracking" maxlength="100" /></label><p>ยืนยันส่งแล้วระบบจะตัดสต็อกและคืนยอดจอง</p><button class="btn primary full" (click)="pending.set('ship')">ยืนยันส่งสินค้าและตัดสต็อก</button> }
        @case ('Completed') { <div class="completion">✓ ส่งสินค้าครบแล้ว</div><p>บันทึกประวัติการตัดสต็อกเรียบร้อย</p> }
        @case ('Cancelled') { <p>ออเดอร์นี้ถูกยกเลิกแล้ว</p> }
      }
      @if (canCancel()) { <button class="btn danger full spaced" (click)="pending.set('cancel')">ยกเลิกออเดอร์</button> }
      <div class="document-links">@if (payment(); as p) { <a [routerLink]="['/payments', p.id, 'qr']">ใบแจ้งชำระ →</a> } @if (receiptId(); as id) { <a routerLink="/receipts" [queryParams]="{id}">ดู / พิมพ์ใบเสร็จ →</a> } @if (deliveryId(); as id) { <a routerLink="/deliveries" [queryParams]="{id}">ดูใบส่งของ →</a> }</div>
    </section><section class="card padded"><h2>ประวัติออเดอร์</h2><ol class="timeline">@for (event of o.timeline; track $index) { <li><strong>{{ event.label }}</strong><small>{{ event.date | date:'dd/MM/yyyy HH:mm':'+0700' }}</small></li> }</ol></section></aside></div>
    @if (pending(); as action) { <app-confirm-dialog [title]="confirmTitle(action)" [message]="confirmMessage(action)" (dismissed)="pending.set(null)" (confirmed)="run(action); pending.set(null)" /> }
    } @else { <section class="card empty"><h1>ไม่พบออเดอร์</h1><a routerLink="/orders">กลับรายการออเดอร์</a></section> }
  `,
})
export class OrderDetail extends ActionPage {
  private params = toSignal(inject(ActivatedRoute).paramMap);
  order = computed(() => this.store.order(this.params()?.get('id') ?? ''));
  flow = FLOW; tracking = ''; pending = signal<OrderAction | null>(null);
  stepIndex = computed(() => this.flow.findIndex(s => s.status === this.order()?.status));
  payment = computed(() => this.store.state().payments.find(p => p.orderId === this.order()?.id));
  receiptId = computed(() => this.store.state().receipts.find(r => r.orderId === this.order()?.id)?.id);
  deliveryId = computed(() => this.store.state().deliveries.find(d => d.orderId === this.order()?.id)?.id);
  canCancel = computed(() => ['Draft', 'StockChecked', 'Confirmed', 'AwaitingPayment'].includes(this.order()?.status ?? ''));
  run(action: OrderAction) { const id = this.order()?.id; if (id) this.perform(() => this.store.orderAction(id, action, this.tracking), 'อัปเดตออเดอร์ทดลองแล้ว'); }
  confirmTitle(action: OrderAction) { return action === 'ship' ? 'ยืนยันส่งสินค้า?' : action === 'cancel' ? 'ยกเลิกออเดอร์?' : 'ยืนยันออเดอร์?'; }
  confirmMessage(action: OrderAction) { return action === 'ship' ? 'ระบบจะตัดยอดคงเหลือและยอดจองของออเดอร์นี้พร้อมบันทึกประวัติ' : action === 'cancel' ? 'รายการชำระที่ยังค้างจะถูกยกเลิก และสินค้าที่จองไว้จะกลับมาพร้อมขาย' : 'ระบบจะตรวจยอดอีกครั้งและจองสินค้าทุกรายการ'; }
}
