import { Component, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ActionPage } from '../../../shared/components/action-page';
import { Feedback } from '../../../shared/components/feedback/feedback';
import { CustomerFieldDirective } from '../../../shared/validators/customer-field.directive';
@Component({
  selector: 'app-order-create', imports: [CommonModule, FormsModule, RouterLink, Feedback, CustomerFieldDirective],
  template: `
    <header class="page-heading"><div><a class="back-link" routerLink="/orders">← รายการออเดอร์</a><h1>สร้าง Sales Order</h1><p class="subtitle">บันทึกร่างก่อนตรวจสอบสินค้าและยืนยันจองสต็อก</p></div></header>
    <app-feedback [error]="error()" [success]="success()" />
    <form #orderForm="ngForm" (ngSubmit)="save(orderForm)"><section class="card form-card wide"><h2><span class="section-number">01</span> ลูกค้าและการจัดส่ง</h2><div class="form-grid">
    <label class="span-two">เลือกลูกค้าที่บันทึกไว้<select name="customerId" [ngModel]="customerId" (ngModelChange)="selectCustomer($event)"><option value="">กรอกข้อมูลเฉพาะออเดอร์นี้</option>@for (c of store.customers(); track c.id) { @if (c.active) { <option [value]="c.id">{{ c.code }} · {{ c.name }}</option> } }</select><span class="muted">แก้ข้อมูลจัดส่งด้านล่างได้โดยไม่เปลี่ยนทะเบียนลูกค้า · <a routerLink="/customers/new">เพิ่มลูกค้าในทะเบียน</a></span></label>
    <label>ชื่อลูกค้า / บริษัท *<input name="customerName" [(ngModel)]="customer.name" #nameControl="ngModel" appCustomerField="name" maxlength="200" aria-required="true" [attr.aria-invalid]="nameControl.touched && nameControl.invalid" aria-describedby="order-name-error" placeholder="ชื่อผู้ซื้อ" />@if (nameControl.touched && nameControl.errors?.['customer']) { <small id="order-name-error" class="field-error">{{ nameControl.errors?.['customer'] }}</small> }</label>
    <label>เบอร์โทรศัพท์<input name="phone" [(ngModel)]="customer.phone" #phoneControl="ngModel" appCustomerField="phone" maxlength="30" type="tel" [attr.aria-invalid]="phoneControl.touched && phoneControl.invalid" aria-describedby="order-phone-hint order-phone-error" /><small id="order-phone-hint" class="muted">เช่น 081-234-5678 หรือ +66 81 234 5678</small>@if (phoneControl.touched && phoneControl.errors?.['customer']) { <small id="order-phone-error" class="field-error">{{ phoneControl.errors?.['customer'] }}</small> }</label>
    <label class="span-two">ที่อยู่จัดส่ง *<textarea name="address" [(ngModel)]="customer.address" #addressControl="ngModel" appCustomerField="address" rows="2" maxlength="1000" aria-required="true" [attr.aria-invalid]="addressControl.touched && addressControl.invalid" aria-describedby="order-address-error"></textarea>@if (addressControl.touched && addressControl.errors?.['customer']) { <small id="order-address-error" class="field-error">{{ addressControl.errors?.['customer'] }}</small> }</label><label>คลังที่ใช้จัดส่ง *<select name="warehouse" [(ngModel)]="warehouseId" required>@for (w of store.warehouses(); track w.id) { <option [value]="w.id">{{ w.name }}</option> }</select></label></div></section>
    <section class="card"><div class="card-heading"><h2><span class="section-number">02</span> รายการสินค้า</h2><button class="btn small" type="button" [disabled]="items.length >= 100" (click)="addItem()">＋ เพิ่มรายการ</button></div><div class="table-wrap"><table class="order-editor"><thead><tr><th>สินค้า</th><th class="numeric">พร้อมขาย</th><th>จำนวน</th><th class="numeric">ราคา / หน่วย</th><th class="numeric">รวม</th><th></th></tr></thead><tbody>
    @for (item of items; track item.key; let index = $index) { <tr><td><select [name]="'product-'+item.key" [(ngModel)]="item.productId" required aria-label="เลือกสินค้า"><option value="">เลือกสินค้า</option>@for (p of store.products(); track p.id) { @if (p.active) { <option [value]="p.id">{{ p.sku }} · {{ p.name }}</option> } }</select></td><td class="numeric">{{ store.available(item.productId, warehouseId) | number:'1.0-3' }}</td><td><input class="quantity-input" type="number" [name]="'qty-'+item.key" [(ngModel)]="item.quantity" min="0.001" max="1000000" step="0.001" required aria-label="จำนวนสินค้า" /></td><td class="numeric">{{ store.product(item.productId)?.price ?? 0 | currency:'THB':'symbol-narrow' }}</td><td class="numeric">{{ lineTotal(item) | currency:'THB':'symbol-narrow' }}</td><td><button class="icon-button danger" type="button" [disabled]="items.length === 1" (click)="items.splice(index, 1)" aria-label="ลบรายการ">×</button></td></tr> }</tbody></table></div>
    <div class="order-totals"><div><span>ยอดสินค้า</span><strong>{{ subtotal | currency:'THB':'symbol-narrow' }}</strong></div><div><label for="discount">ส่วนลดท้ายออเดอร์</label><input id="discount" name="discount" type="number" [(ngModel)]="discount" min="0" [max]="subtotal" step="0.01" /></div><div class="grand-total"><span>ยอดสุทธิ</span><strong>{{ total | currency:'THB':'symbol-narrow' }}</strong></div><p class="muted">ยังไม่รวมระบบภาษีและค่าขนส่ง</p></div></section>
    <div class="form-actions"><a class="btn" routerLink="/orders">ยกเลิก</a><button class="btn primary" type="submit">บันทึกออเดอร์ร่าง →</button></div></form>
  `,
})
export class OrderCreate extends ActionPage {
  private router = inject(Router);
  private element = inject<ElementRef<HTMLElement>>(ElementRef);
  private route = inject(ActivatedRoute);
  customerId = '';
  warehouseId = this.store.warehouses()[0]?.id ?? ''; customer = { name: '', phone: '', address: '' }; discount = 0;
  private nextKey = 1; items = [{ key: 0, productId: '', quantity: 1 }];
  constructor() { super(); const id = this.route.snapshot.queryParamMap.get('customerId'); if (id) this.selectCustomer(id); }
  selectCustomer(id: string) {
    this.customerId = id;
    const c = this.store.customer(id);
    this.customer = c ? { name: c.name, phone: c.phone, address: c.address } : { name: '', phone: '', address: '' };
  }
  addItem() { this.items.push({ key: this.nextKey++, productId: '', quantity: 1 }); }
  lineTotal(item: { productId: string; quantity: number }) { return Math.round(((this.store.product(item.productId)?.price ?? 0) * (Number(item.quantity) || 0) + Number.EPSILON) * 100) / 100; }
  get subtotal() { return Math.round(this.items.reduce((sum, item) => sum + this.lineTotal(item), 0) * 100) / 100; }
  get total() { return Math.round((this.subtotal - (Number(this.discount) || 0)) * 100) / 100; }
  save(form: NgForm) {
    form.form.markAllAsTouched();
    if (form.invalid) {
      this.error.set('กรุณาตรวจข้อมูลลูกค้าและรายการสินค้าให้ถูกต้องก่อนบันทึก');
      this.element.nativeElement.querySelector<HTMLElement>('input.ng-invalid, textarea.ng-invalid, select.ng-invalid')?.focus();
      return;
    }
    this.perform(() => { const id = this.store.createOrder({ warehouseId: this.warehouseId, customerId: this.customerId, customer: this.customer, items: this.items, discount: this.discount }); void this.router.navigate(['/orders', id]); });
  }
}
