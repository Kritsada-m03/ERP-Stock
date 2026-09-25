import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActionPage } from '../../../shared/components/action-page';
import { Feedback } from '../../../shared/components/feedback/feedback';
@Component({
  selector: 'app-product-detail', imports: [CommonModule, RouterLink, Feedback],
  template: `
    <app-feedback [error]="error()" [success]="success()" />
    @if (product(); as p) {
    <header class="page-heading"><div><a class="back-link" routerLink="/products">← รายการสินค้า</a><h1>{{ p.name }}</h1><p class="subtitle mono">{{ p.sku }} · {{ store.categoryName(p.categoryId) }}</p></div><div class="actions"><button class="btn" (click)="performToggle(p.id, !p.active)">{{ p.active ? 'ปิดใช้งาน' : 'เปิดใช้งาน' }}</button><a class="btn primary" [routerLink]="['/products', p.id, 'edit']">แก้ไขสินค้า</a></div></header>
    <div class="stat-grid three"><div class="stat"><span>ราคาขาย / {{ p.unit }}</span><strong>{{ p.price | currency:'THB':'symbol-narrow' }}</strong></div><div class="stat"><span>พร้อมขายทุกคลัง</span><strong>{{ store.totalAvailable(p.id) | number:'1.0-3' }} <small>{{ p.unit }}</small></strong></div><div class="stat"><span>สถานะ</span><strong class="compact">{{ p.active ? 'เปิดใช้งาน' : 'ปิดใช้งาน' }}</strong></div></div>
    <section class="card"><div class="card-heading"><h2>สต็อกแยกตามคลัง</h2><a class="btn small" routerLink="/inventory/receive" [queryParams]="{productId:p.id}">＋ รับสินค้าเข้า</a></div><div class="table-wrap"><table><thead><tr><th>คลังสินค้า</th><th class="numeric">คงเหลือ</th><th class="numeric">จองแล้ว</th><th class="numeric">พร้อมขาย</th></tr></thead><tbody>@for (w of store.warehouses(); track w.id) { <tr><td>{{ w.name }}</td><td class="numeric">{{ balance(p.id, w.id).onHand | number:'1.0-3' }}</td><td class="numeric">{{ balance(p.id, w.id).reserved | number:'1.0-3' }}</td><td class="numeric">{{ store.available(p.id, w.id) | number:'1.0-3' }} {{ p.unit }}</td></tr> }</tbody></table></div></section>
    } @else { <section class="card empty"><h1>ไม่พบสินค้า</h1><a routerLink="/products">กลับรายการสินค้า</a></section> }
  `,
})
export class ProductDetail extends ActionPage {
  private params = toSignal(inject(ActivatedRoute).paramMap);
  product = computed(() => this.store.product(this.params()?.get('id') ?? ''));
  balance(productId: string, warehouseId: string) { return this.store.state().stocks.find(s => s.productId === productId && s.warehouseId === warehouseId) ?? { onHand: 0, reserved: 0 }; }
  performToggle(id: string, active: boolean) { this.perform(() => this.store.setProductActive(id, active)); }
}
