import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ActionPage } from '../../../shared/components/action-page';
import { StatusBadge } from '../../../shared/components/status-badge/status-badge';
import { STATUS_LABELS } from '../../../shared/models/erp.models';
@Component({
  selector: 'app-order-list', imports: [CommonModule, FormsModule, RouterLink, StatusBadge],
  template: `
    <header class="page-heading"><div><p class="eyebrow">SALES / ออเดอร์</p><h1>Sales Order</h1><p class="subtitle">ติดตามทุกออเดอร์ตั้งแต่ร่างจนถึงส่งสินค้า</p></div><a class="btn primary" routerLink="/orders/new">＋ สร้างออเดอร์</a></header>
    <div class="stat-grid three"><div class="stat"><span>ออเดอร์ทั้งหมด</span><strong>{{ store.orders().length }} <small>รายการ</small></strong></div><div class="stat"><span>กำลังดำเนินการ</span><strong>{{ openCount() }} <small>รายการ</small></strong></div><div class="stat"><span>ยอดออเดอร์ที่ไม่ยกเลิก</span><strong class="compact">{{ total() | currency:'THB':'symbol-narrow' }}</strong></div></div>
    <section class="card"><div class="toolbar"><input class="search" aria-label="ค้นหาออเดอร์" placeholder="ค้นหาเลขออเดอร์ หรือชื่อลูกค้า…" [ngModel]="search()" (ngModelChange)="search.set($event); page.set(1)" /><select aria-label="สถานะออเดอร์" [ngModel]="status()" (ngModelChange)="status.set($event); page.set(1)"><option value="">ทุกสถานะ</option>@for (s of statuses; track s.key) { <option [value]="s.key">{{ s.label }}</option> }</select></div><div class="table-wrap"><table><thead><tr><th>ออเดอร์ / วันที่</th><th>ลูกค้า</th><th>คลัง</th><th class="numeric">ยอดสุทธิ</th><th>สถานะ</th><th></th></tr></thead><tbody>
    @for (o of paged(); track o.id) { <tr><td><a class="item-title mono" [routerLink]="['/orders', o.id]">{{ o.number }}</a><div class="muted">{{ o.createdAt | date:'dd/MM/yyyy HH:mm':'+0700' }}</div></td><td>{{ o.customer.name }}<div class="muted">{{ o.items.length }} รายการสินค้า</div></td><td>{{ store.warehouseName(o.warehouseId) }}</td><td class="numeric">{{ o.total | currency:'THB':'symbol-narrow' }}</td><td><app-status-badge [status]="o.status" /></td><td><a class="btn small" [routerLink]="['/orders', o.id]">ดูรายละเอียด →</a></td></tr> }
    @empty { <tr><td colspan="6"><div class="empty"><div class="empty-icon">▤</div><h2>ยังไม่มีออเดอร์ที่ตรงกับเงื่อนไข</h2><p>เริ่มต้นด้วยการเลือกสินค้าและกรอกข้อมูลลูกค้า</p><a class="btn primary" routerLink="/orders/new">สร้างออเดอร์แรก</a></div></td></tr> }</tbody></table></div><footer class="table-footer"><span>{{ filtered().length }} รายการ</span><div class="actions"><button class="btn small" [disabled]="page() <= 1" (click)="page.set(page()-1)">ก่อนหน้า</button><span>หน้า {{ page() }}</span><button class="btn small" [disabled]="page()*10 >= filtered().length" (click)="page.set(page()+1)">ถัดไป</button></div></footer></section>
  `,
})
export class OrderList extends ActionPage {
  search = signal(''); status = signal(''); page = signal(1);
  statuses = Object.entries(STATUS_LABELS).map(([key, label]) => ({ key, label }));
  filtered = computed(() => this.store.orders().filter(o => (!this.status() || o.status === this.status()) && (o.number + o.customer.name).toLowerCase().includes(this.search().toLowerCase())));
  paged = computed(() => this.filtered().slice((this.page()-1)*10, this.page()*10));
  openCount = computed(() => this.store.orders().filter(o => !['Completed', 'Cancelled'].includes(o.status)).length);
  total = computed(() => this.store.orders().filter(o => o.status !== 'Cancelled').reduce((sum, o) => sum + o.total, 0));
}
