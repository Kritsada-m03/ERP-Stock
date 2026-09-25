import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ActionPage } from '../../../shared/components/action-page';
import { StatusBadge } from '../../../shared/components/status-badge/status-badge';
@Component({
  selector: 'app-payment-list', imports: [CommonModule, FormsModule, RouterLink, StatusBadge],
  template: `
    <header class="page-heading"><div><p class="eyebrow">FINANCE / การรับเงิน</p><h1>การชำระเงิน</h1><p class="subtitle">ใบแจ้งชำระและรายการตรวจรับเงินของออเดอร์</p></div><a class="btn" routerLink="/orders">ไปที่ออเดอร์ →</a></header>
    <div class="stat-grid three"><div class="stat"><span>รอตรวจรับเงิน</span><strong>{{ pendingCount() }} <small>รายการ</small></strong></div><div class="stat warning"><span>ยอดรอรับ</span><strong class="compact">{{ pendingTotal() | currency:'THB':'symbol-narrow' }}</strong></div><div class="stat"><span>รับเงินทดลองแล้ว</span><strong class="compact">{{ verifiedTotal() | currency:'THB':'symbol-narrow' }}</strong></div></div>
    <section class="card"><div class="toolbar"><input class="search" aria-label="ค้นหาการชำระเงิน" placeholder="ค้นหาเลขชำระ ออเดอร์ หรือชื่อลูกค้า…" [ngModel]="search()" (ngModelChange)="search.set($event)" /><select aria-label="สถานะชำระเงิน" [ngModel]="status()" (ngModelChange)="status.set($event)"><option value="">ทุกสถานะ</option><option value="Pending">รอตรวจรับเงิน</option><option value="Verified">รับเงินแล้ว</option><option value="Cancelled">ยกเลิก</option></select></div><div class="table-wrap"><table><thead><tr><th>เลขแจ้งชำระ</th><th>ออเดอร์ / ลูกค้า</th><th class="numeric">ยอดชำระ</th><th>สถานะ</th><th></th></tr></thead><tbody>@for (p of filtered(); track p.id) { <tr><td><strong class="mono">{{ p.number }}</strong><div class="muted">{{ p.createdAt | date:'dd/MM/yyyy HH:mm':'+0700' }}</div></td><td><a [routerLink]="['/orders', p.orderId]">{{ store.order(p.orderId)?.number }}</a><div class="muted">{{ store.order(p.orderId)?.customer?.name }}</div></td><td class="numeric">{{ p.amount | currency:'THB':'symbol-narrow' }}</td><td><app-status-badge [status]="p.status" /></td><td><a class="btn small" [routerLink]="['/payments', p.id, 'qr']">{{ p.status === 'Pending' ? 'ตรวจรับเงิน' : 'ดูรายละเอียด' }} →</a></td></tr> } @empty { <tr><td colspan="5" class="empty"><h2>ยังไม่มีรายการชำระ</h2><p>สร้างใบแจ้งชำระจากออเดอร์ที่ยืนยันแล้ว</p></td></tr> }</tbody></table></div><footer class="table-footer">{{ filtered().length }} รายการ</footer></section>
  `,
})
export class PaymentList extends ActionPage {
  search = signal(''); status = signal('');
  filtered = computed(() => [...this.store.state().payments].reverse().filter(p => (!this.status() || p.status === this.status()) && (p.number + this.store.order(p.orderId)?.number + this.store.order(p.orderId)?.customer.name).toLowerCase().includes(this.search().toLowerCase())));
  pendingCount = computed(() => this.store.state().payments.filter(p => p.status === 'Pending').length);
  pendingTotal = computed(() => this.store.state().payments.filter(p => p.status === 'Pending').reduce((sum, p) => sum + p.amount, 0));
  verifiedTotal = computed(() => this.store.state().payments.filter(p => p.status === 'Verified').reduce((sum, p) => sum + p.amount, 0));
}
