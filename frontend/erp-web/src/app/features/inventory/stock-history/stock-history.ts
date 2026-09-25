import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ActionPage } from '../../../shared/components/action-page';
import { StatusBadge } from '../../../shared/components/status-badge/status-badge';
@Component({
  selector: 'app-stock-history', imports: [CommonModule, FormsModule, RouterLink, StatusBadge],
  template: `
    <header class="page-heading"><div><a class="back-link" routerLink="/inventory">← สต็อกสินค้า</a><h1>ประวัติสต็อก</h1><p class="subtitle">รายการเปลี่ยนแปลงยอดสินค้า เรียงจากรายการล่าสุด</p></div></header>
    <section class="card"><div class="toolbar"><input class="search" aria-label="ค้นหาประวัติ" placeholder="ค้นหาสินค้า เลขเอกสาร หรือหมายเหตุ…" [ngModel]="search()" (ngModelChange)="search.set($event); page.set(1)" /><select aria-label="คลังสินค้า" [ngModel]="warehouse()" (ngModelChange)="warehouse.set($event); page.set(1)"><option value="">ทุกคลัง</option>@for (w of store.warehouses(); track w.id) { <option [value]="w.id">{{ w.name }}</option> }</select><select aria-label="ประเภท" [ngModel]="type()" (ngModelChange)="type.set($event); page.set(1)"><option value="">ทุกประเภท</option><option value="Receive">รับเข้า</option><option value="Dispatch">ส่งออก</option></select></div><div class="table-wrap"><table><thead><tr><th>วันเวลา</th><th>สินค้า / คลัง</th><th>ประเภท</th><th class="numeric">จำนวนเปลี่ยนแปลง</th><th>เอกสาร / หมายเหตุ</th></tr></thead><tbody>
    @for (t of paged(); track t.id) { <tr><td>{{ t.date | date:'dd/MM/yyyy HH:mm':'+0700' }}</td><td><strong>{{ store.product(t.productId)?.name }}</strong><div class="muted">{{ store.warehouseName(t.warehouseId) }}</div></td><td><app-status-badge [status]="t.type" /></td><td class="numeric" [class.text-success]="t.quantity > 0" [class.text-warning]="t.quantity < 0">{{ t.quantity > 0 ? '+' : '' }}{{ t.quantity | number:'1.0-3' }}</td><td><span class="mono">{{ t.reference }}</span><div class="muted">{{ t.note }}</div></td></tr> }
    @empty { <tr><td colspan="5" class="empty">ไม่พบรายการสต็อก</td></tr> }</tbody></table></div><footer class="table-footer"><span>{{ filtered().length }} รายการ</span><div class="actions"><button class="btn small" [disabled]="page() <= 1" (click)="page.set(page()-1)">ก่อนหน้า</button><span>หน้า {{ page() }}</span><button class="btn small" [disabled]="page()*15 >= filtered().length" (click)="page.set(page()+1)">ถัดไป</button></div></footer></section>
  `,
})
export class StockHistory extends ActionPage {
  search = signal(''); warehouse = signal(''); type = signal(''); page = signal(1);
  filtered = computed(() => [...this.store.state().transactions].reverse().filter(t => (!this.warehouse() || t.warehouseId === this.warehouse()) && (!this.type() || t.type === this.type()) && ((this.store.product(t.productId)?.name ?? '') + t.reference + t.note).toLowerCase().includes(this.search().toLowerCase())));
  paged = computed(() => this.filtered().slice((this.page()-1)*15, this.page()*15));
}
