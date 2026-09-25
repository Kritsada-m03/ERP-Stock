import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ActionPage } from '../../../shared/components/action-page';
import { Feedback } from '../../../shared/components/feedback/feedback';
@Component({
  selector: 'app-stock-list', imports: [CommonModule, FormsModule, RouterLink, Feedback],
  template: `
    <header class="page-heading"><div><p class="eyebrow">INVENTORY / คลังสินค้า</p><h1>สต็อกสินค้า</h1><p class="subtitle">คงเหลือ จองแล้ว และพร้อมขาย แยกตามคลัง</p></div><div class="actions"><a class="btn" routerLink="/inventory/history">ประวัติสต็อก</a><a class="btn primary" routerLink="/inventory/receive">＋ รับสินค้าเข้า</a></div></header>
    <app-feedback [error]="error()" [success]="success()" />
    <div class="stat-grid three"><div class="stat"><span>คลังสินค้า</span><strong>{{ store.warehouses().length }} <small>คลัง</small></strong></div><div class="stat"><span>สินค้าในคลังที่เลือก</span><strong>{{ rows().length }} <small>รายการ</small></strong></div><div class="stat warning"><span>พร้อมขายต่ำกว่าจุดเตือน</span><strong>{{ lowCount() }} <small>รายการ</small></strong></div></div>
    <section class="card"><div class="toolbar"><input aria-label="ค้นหาสต็อก" class="search" placeholder="ค้นหาชื่อสินค้า หรือ SKU…" [ngModel]="search()" (ngModelChange)="search.set($event)" /><select aria-label="คลังสินค้า" [ngModel]="warehouse()" (ngModelChange)="warehouse.set($event)">@for (w of store.warehouses(); track w.id) { <option [value]="w.id">{{ w.name }} ({{ w.code }})</option> }</select><label class="check-label"><input type="checkbox" [ngModel]="lowOnly()" (ngModelChange)="lowOnly.set($event)" /> ใกล้หมดเท่านั้น</label></div>
    <div class="table-wrap"><table><thead><tr><th>สินค้า</th><th class="numeric">คงเหลือ</th><th class="numeric">จองแล้ว</th><th class="numeric">พร้อมขาย</th><th>สถานะ</th></tr></thead><tbody>
    @for (row of filtered(); track row.product.id) { <tr><td><a class="item-title" [routerLink]="['/products', row.product.id]">{{ row.product.name }}</a><div class="muted mono">{{ row.product.sku }}</div></td><td class="numeric">{{ row.onHand | number:'1.0-3' }}</td><td class="numeric">{{ row.reserved | number:'1.0-3' }}</td><td class="numeric"><strong>{{ row.available | number:'1.0-3' }}</strong> {{ row.product.unit }}</td><td><span class="badge" [attr.data-status]="row.available <= row.product.reorderPoint ? 'AwaitingPayment' : 'Completed'">{{ row.available <= row.product.reorderPoint ? 'ควรเติมสินค้า' : 'ปกติ' }}</span></td></tr> }
    @empty { <tr><td colspan="5" class="empty">ไม่พบสินค้าตามเงื่อนไข</td></tr> }
    </tbody></table></div><footer class="table-footer">{{ filtered().length }} รายการ · พร้อมขาย = คงเหลือ − จองแล้ว</footer></section>
    <details class="card settings"><summary>เพิ่มคลังสินค้า</summary><form class="inline-form" (ngSubmit)="addWarehouse()"><label>รหัสคลัง<input name="code" [(ngModel)]="code" maxlength="30" required placeholder="เช่น WH-03" /></label><label>ชื่อคลัง<input name="name" [(ngModel)]="name" maxlength="150" required /></label><button class="btn" type="submit">เพิ่มคลัง</button></form></details>
  `,
})
export class StockList extends ActionPage {
  search = signal(''); warehouse = signal(this.store.warehouses()[0]?.id ?? ''); lowOnly = signal(false); code = ''; name = '';
  rows = computed(() => this.store.products().map(product => { const stock = this.store.state().stocks.find(s => s.productId === product.id && s.warehouseId === this.warehouse()); return { product, onHand: stock?.onHand ?? 0, reserved: stock?.reserved ?? 0, available: this.store.available(product.id, this.warehouse()) }; }));
  lowCount = computed(() => this.rows().filter(r => r.available <= r.product.reorderPoint).length);
  filtered = computed(() => this.rows().filter(r => (r.product.name + r.product.sku).toLowerCase().includes(this.search().toLowerCase()) && (!this.lowOnly() || r.available <= r.product.reorderPoint)));
  addWarehouse() { if (this.perform(() => this.store.addWarehouse(this.code, this.name))) { this.code = ''; this.name = ''; } }
}
