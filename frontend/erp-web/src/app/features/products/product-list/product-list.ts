import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ActionPage } from '../../../shared/components/action-page';
import { Feedback } from '../../../shared/components/feedback/feedback';

@Component({
  selector: 'app-product-list', imports: [CommonModule, FormsModule, RouterLink, Feedback],
  template: `
    <header class="page-heading"><div><p class="eyebrow">CATALOG / สินค้า</p><h1>รายการสินค้า</h1><p class="subtitle">จัดการข้อมูลสินค้าและติดตามจำนวนพร้อมขาย</p></div><a class="btn primary" routerLink="/products/new">＋ เพิ่มสินค้า</a></header>
    <app-feedback [error]="error()" [success]="success()" />
    <div class="stat-grid three"><div class="stat"><span>สินค้าทั้งหมด</span><strong>{{ store.products().length }} <small>รายการ</small></strong></div><div class="stat"><span>เปิดใช้งาน</span><strong>{{ activeCount() }} <small>รายการ</small></strong></div><div class="stat"><span>หมวดหมู่สินค้า</span><strong>{{ store.state().categories.length }} <small>หมวดหมู่</small></strong></div></div>
    <section class="card"><div class="toolbar"><label class="search"><span class="sr-only">ค้นหาสินค้า</span><input placeholder="ค้นหาชื่อสินค้า หรือ SKU…" [ngModel]="search()" (ngModelChange)="search.set($event); page.set(1)" /></label><select aria-label="หมวดหมู่" [ngModel]="category()" (ngModelChange)="category.set($event); page.set(1)"><option value="">ทุกหมวดหมู่</option>@for (c of store.state().categories; track c.id) { <option [value]="c.id">{{ c.name }}</option> }</select><select aria-label="สถานะสินค้า" [ngModel]="status()" (ngModelChange)="status.set($event); page.set(1)"><option value="">ทุกสถานะ</option><option value="active">เปิดใช้งาน</option><option value="inactive">ปิดใช้งาน</option></select></div>
    <div class="table-wrap"><table><thead><tr><th>สินค้า / SKU</th><th>หมวดหมู่</th><th class="numeric">ราคาขาย</th><th class="numeric">พร้อมขายรวม</th><th>สถานะ</th><th></th></tr></thead><tbody>
    @for (p of paged(); track p.id) { <tr><td><a class="item-title" [routerLink]="['/products', p.id]">{{ p.name }}</a><div class="muted mono">{{ p.sku }}</div></td><td>{{ store.categoryName(p.categoryId) }}</td><td class="numeric">{{ p.price | currency:'THB':'symbol-narrow' }}<small class="block muted">/ {{ p.unit }}</small></td><td class="numeric" [class.text-warning]="store.totalAvailable(p.id) <= p.reorderPoint">{{ store.totalAvailable(p.id) | number:'1.0-3' }} {{ p.unit }}</td><td><span class="badge" [attr.data-status]="p.active ? 'Completed' : 'Cancelled'">{{ p.active ? 'เปิดใช้งาน' : 'ปิดใช้งาน' }}</span></td><td><a class="btn small" [routerLink]="['/products', p.id, 'edit']">แก้ไข</a></td></tr> }
    @empty { <tr><td colspan="6"><div class="empty"><strong>ไม่พบสินค้า</strong><p>ลองเปลี่ยนคำค้นหา หรือเพิ่มสินค้าใหม่</p></div></td></tr> }
    </tbody></table></div><footer class="table-footer"><span>{{ filtered().length }} รายการ</span><div class="actions"><button class="btn small" [disabled]="page() <= 1" (click)="page.set(page()-1)">ก่อนหน้า</button><span>{{ page() }} / {{ pages() }}</span><button class="btn small" [disabled]="page() >= pages()" (click)="page.set(page()+1)">ถัดไป</button></div></footer></section>
    <details class="card settings"><summary>จัดการหมวดหมู่สินค้า</summary><div class="chips">@for (c of store.state().categories; track c.id) { <span class="badge">{{ c.name }}</span> }</div><form class="inline-form" (ngSubmit)="addCategory()"><label>ชื่อหมวดหมู่ใหม่<input name="categoryName" [(ngModel)]="categoryName" maxlength="150" required /></label><button class="btn" type="submit">เพิ่มหมวดหมู่</button></form></details>
  `,
})
export class ProductList extends ActionPage {
  search = signal(''); category = signal(''); status = signal(''); page = signal(1); categoryName = '';
  activeCount = computed(() => this.store.products().filter(p => p.active).length);
  filtered = computed(() => this.store.products().filter(p => (!this.search() || (p.name + p.sku).toLowerCase().includes(this.search().toLowerCase())) && (!this.category() || p.categoryId === this.category()) && (!this.status() || p.active === (this.status() === 'active'))));
  pages = computed(() => Math.max(1, Math.ceil(this.filtered().length / 10)));
  paged = computed(() => this.filtered().slice((this.page()-1)*10, this.page()*10));
  addCategory() { if (this.perform(() => this.store.addCategory(this.categoryName))) this.categoryName = ''; }
}
