import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ActionPage } from '../../../shared/components/action-page';
import { Feedback } from '../../../shared/components/feedback/feedback';
@Component({
  selector: 'app-stock-receive', imports: [FormsModule, RouterLink, Feedback],
  template: `
    <header class="page-heading"><div><a class="back-link" routerLink="/inventory">← สต็อกสินค้า</a><h1>รับสินค้าเข้าคลัง</h1><p class="subtitle">บันทึกจำนวนรับเข้าและเก็บประวัติทุกครั้ง</p></div></header>
    <app-feedback [error]="error()" [success]="success()" />
    <form class="card form-card" (ngSubmit)="save()"><h2>รายละเอียดการรับเข้า</h2><div class="form-grid"><label>คลังสินค้า *<select name="warehouseId" [(ngModel)]="warehouseId" required>@for (w of store.warehouses(); track w.id) { <option [value]="w.id">{{ w.name }}</option> }</select></label><label>สินค้า *<select name="productId" [(ngModel)]="productId" required><option value="">เลือกสินค้า</option>@for (p of store.products(); track p.id) { @if (p.active) { <option [value]="p.id">{{ p.sku }} · {{ p.name }}</option> } }</select></label><label>จำนวนรับเข้า *<input name="quantity" type="number" [(ngModel)]="quantity" min="0.001" max="1000000" step="0.001" required /><small>{{ store.product(productId)?.unit ?? 'หน่วย' }}</small></label><label>เอกสารอ้างอิง / เหตุผล *<input name="note" [(ngModel)]="note" maxlength="500" required placeholder="เช่น รับสินค้าตามใบส่งของ IN-001" /></label></div><div class="form-actions"><a class="btn" routerLink="/inventory/history">ดูประวัติ</a><button type="submit" class="btn primary">บันทึกรับเข้า</button></div></form>
  `,
})
export class StockReceive extends ActionPage {
  productId = inject(ActivatedRoute).snapshot.queryParamMap.get('productId') ?? '';
  warehouseId = this.store.warehouses()[0]?.id ?? ''; quantity = 1; note = '';
  save() { if (this.perform(() => this.store.receive(this.productId, this.warehouseId, this.quantity, this.note), 'รับสินค้าเข้าและบันทึกประวัติแล้ว')) { this.quantity = 1; this.note = ''; } }
}
