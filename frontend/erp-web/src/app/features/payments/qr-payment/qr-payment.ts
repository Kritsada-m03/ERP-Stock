import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActionPage } from '../../../shared/components/action-page';
import { Feedback } from '../../../shared/components/feedback/feedback';
import { StatusBadge } from '../../../shared/components/status-badge/status-badge';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';
@Component({
  selector: 'app-qr-payment', imports: [CommonModule, FormsModule, RouterLink, Feedback, StatusBadge, ConfirmDialog],
  template: `
    <app-feedback [error]="error()" [success]="success()" />
    @if (payment(); as p) {
    <header class="page-heading"><div><a class="back-link" routerLink="/payments">← การชำระเงิน</a><h1>ใบแจ้งชำระเงิน</h1><p class="subtitle mono">{{ p.number }}</p></div><app-status-badge [status]="p.status" /></header>
    <div class="detail-grid"><section class="card padded payment-preview"><p class="eyebrow">PAYMENT REQUEST · ข้อมูลทดลอง</p><h2>{{ store.order(p.orderId)?.customer?.name }}</h2><p>ยอดชำระทั้งหมด</p><strong class="payment-amount">{{ p.amount | currency:'THB':'symbol-narrow' }}</strong><div class="qr-unavailable"><div class="qr-outline" aria-hidden="true">⌗</div><strong>ยังไม่มี QR สำหรับชำระเงินจริง</strong><p>ต้องเชื่อมต่อบัญชีรับเงินและผู้ให้บริการก่อน<br />หน้านี้ใช้ทดลองขั้นตอนรับเงินเท่านั้น</p></div><a [routerLink]="['/orders', p.orderId]">{{ store.order(p.orderId)?.number }} →</a></section>
    <aside><section class="card padded"><h2>ตรวจรับเงินทดลอง</h2>@if (p.status === 'Pending') { <p class="muted">การยืนยันด้านล่างเปลี่ยนเฉพาะสถานะข้อมูลในเบราว์เซอร์ ไม่ได้ตรวจรายการธนาคาร</p><form (ngSubmit)="askVerify()"><label>เลขอ้างอิงทดลอง *<input name="reference" [(ngModel)]="reference" maxlength="200" required placeholder="เช่น DEMO-TRANSFER-001" /></label><label class="check-label"><input name="acknowledged" type="checkbox" [(ngModel)]="acknowledged" required /> เข้าใจว่านี่เป็นการจำลองรับเงิน</label><button class="btn primary full" type="submit">จำลองยืนยันรับเงิน</button></form> } @else if (p.status === 'Verified') { <div class="completion">✓ ยืนยันรับเงินทดลองแล้ว</div><dl class="info-list"><dt>เลขอ้างอิง</dt><dd class="mono">{{ p.bankReference }}</dd><dt>เวลายืนยัน</dt><dd>{{ p.verifiedAt | date:'dd/MM/yyyy HH:mm':'+0700' }}</dd></dl><a class="btn primary full" [routerLink]="['/orders', p.orderId]">กลับออเดอร์ / ออกใบเสร็จ →</a> } @else { <p>รายการนี้ยกเลิกแล้ว ไม่สามารถรับเงินได้</p> }</section></aside></div>
    @if (confirming()) { <app-confirm-dialog title="จำลองยืนยันรับเงิน?" message="ออเดอร์จะเปลี่ยนเป็นรับเงินแล้ว และสามารถออกใบเสร็จทดลองได้" (dismissed)="confirming.set(false)" (confirmed)="verify()" /> }
    } @else { <section class="card empty"><h1>ไม่พบรายการชำระ</h1><a routerLink="/payments">กลับรายการชำระเงิน</a></section> }
  `,
})
export class QrPayment extends ActionPage {
  private params = toSignal(inject(ActivatedRoute).paramMap);
  payment = computed(() => this.store.state().payments.find(p => p.id === this.params()?.get('id')));
  reference = ''; acknowledged = false; confirming = signal(false);
  askVerify() { if (this.reference.trim() && this.acknowledged) this.confirming.set(true); else this.error.set('กรอกเลขอ้างอิงและยืนยันว่าเป็นการทดลอง'); }
  verify() { const id = this.payment()?.id; if (id && this.acknowledged) this.perform(() => this.store.verifyPayment(id, this.reference), 'ยืนยันรับเงินทดลองแล้ว'); this.confirming.set(false); }
}
