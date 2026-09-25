import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ActionPage } from '../../shared/components/action-page';
import { StatusBadge } from '../../shared/components/status-badge/status-badge';
@Component({
  selector: 'app-dashboard', imports: [CommonModule, RouterLink, StatusBadge],
  template: `
    <header class="page-heading"><div><p class="eyebrow">OVERVIEW / ภาพรวม</p><h1>ภาพรวมการดำเนินงาน</h1><p class="subtitle">งานขาย สต็อก และการจัดส่ง ในพื้นที่เดียว</p></div><a class="btn primary" routerLink="/orders/new">＋ สร้างออเดอร์</a></header>
    <div class="stat-grid"><div class="stat accent"><span>ยอดรับเงินทดลองสะสม</span><strong class="compact">{{ paidTotal() | currency:'THB':'symbol-narrow' }}</strong><small>{{ paidCount() }} รายการที่ยืนยันแล้ว</small></div><a class="stat stat-link" routerLink="/orders"><span>ออเดอร์กำลังดำเนินการ</span><strong>{{ openCount() }} <small>รายการ</small></strong><small>ดูออเดอร์ทั้งหมด →</small></a><a class="stat stat-link" routerLink="/payments"><span>รอตรวจรับเงิน</span><strong>{{ pendingCount() }} <small>รายการ</small></strong><small>ไปหน้าการชำระเงิน →</small></a><a class="stat stat-link" routerLink="/deliveries"><span>งานรอจัดส่ง</span><strong>{{ deliveryCount() }} <small>รายการ</small></strong><small>ดูงานจัดส่ง →</small></a></div>
    <div class="dashboard-grid"><section class="card"><div class="card-heading"><div><h2>ออเดอร์ล่าสุด</h2><p class="muted">รายการจากข้อมูลทดลองที่คุณบันทึก</p></div><a routerLink="/orders">ดูทั้งหมด →</a></div><div class="table-wrap"><table><thead><tr><th>ออเดอร์ / ลูกค้า</th><th class="numeric">ยอดสุทธิ</th><th>สถานะ</th></tr></thead><tbody>@for (o of store.orders().slice(0, 5); track o.id) { <tr><td><a class="item-title mono" [routerLink]="['/orders', o.id]">{{ o.number }}</a><div class="muted">{{ o.customer.name }}</div></td><td class="numeric">{{ o.total | currency:'THB':'symbol-narrow' }}</td><td><app-status-badge [status]="o.status" /></td></tr> } @empty { <tr><td colspan="3"><div class="empty"><div class="empty-icon">▤</div><h2>พร้อมเริ่มออเดอร์แรก</h2><p>มีสินค้าตัวอย่างและยอดเริ่มต้นให้ทดลองแล้ว</p><a class="btn primary" routerLink="/orders/new">สร้าง Sales Order</a></div></td></tr> }</tbody></table></div></section>
    <section class="card"><div class="card-heading"><h2>สินค้าควรเติม</h2><span class="count-pill warning">{{ lowProducts().length }}</span></div><div class="compact-list">@for (p of lowProducts().slice(0, 5); track p.id) { <a class="stock-alert-row" [routerLink]="['/products', p.id]"><div class="product-avatar">{{ p.sku.slice(0, 3) }}</div><div><strong>{{ p.name }}</strong><small>{{ p.sku }}</small></div><span class="text-warning">{{ store.totalAvailable(p.id) | number:'1.0-3' }}<small>{{ p.unit }}</small></span></a> } @empty { <div class="empty">สินค้าพร้อมขายอยู่เหนือจุดเตือนทุกรายการ</div> }</div><footer class="table-footer"><span>พิจารณายอดพร้อมขายรวมทุกคลัง</span><a routerLink="/inventory/receive">รับสินค้าเข้า →</a></footer></section></div>
    <section class="card padded"><div class="card-heading flat"><h2>เริ่มทำงาน</h2><span class="muted">ขั้นตอนหลักของระบบ</span></div><div class="quick-grid"><a routerLink="/products"><span>01</span><strong>จัดการสินค้า</strong><small>ข้อมูลสินค้าและราคาขาย →</small></a><a routerLink="/inventory/receive"><span>02</span><strong>รับสินค้าเข้าคลัง</strong><small>เพิ่มยอดพร้อมขาย →</small></a><a routerLink="/orders/new"><span>03</span><strong>สร้างออเดอร์</strong><small>ตรวจและจองสินค้า →</small></a><a routerLink="/deliveries"><span>04</span><strong>ติดตามจัดส่ง</strong><small>ออกเอกสารและตัดสต็อก →</small></a></div></section>
  `,
})
export class Dashboard extends ActionPage {
  paidTotal = computed(() => this.store.state().payments.filter(p => p.status === 'Verified').reduce((sum, p) => sum + p.amount, 0));
  paidCount = computed(() => this.store.state().payments.filter(p => p.status === 'Verified').length);
  pendingCount = computed(() => this.store.state().payments.filter(p => p.status === 'Pending').length);
  openCount = computed(() => this.store.orders().filter(o => !['Completed', 'Cancelled'].includes(o.status)).length);
  deliveryCount = computed(() => this.store.state().deliveries.filter(d => d.status !== 'Completed').length);
  lowProducts = computed(() => this.store.products().filter(p => p.active && this.store.totalAvailable(p.id) <= p.reorderPoint));
}
