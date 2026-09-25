import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ActionPage } from '../../../shared/components/action-page';
import { Feedback } from '../../../shared/components/feedback/feedback';

@Component({
  selector: 'app-product-form', imports: [ReactiveFormsModule, RouterLink, Feedback],
  template: `
    <header class="page-heading"><div><a class="back-link" routerLink="/products">← รายการสินค้า</a><h1>{{ id ? 'แก้ไขสินค้า' : 'เพิ่มสินค้า' }}</h1><p class="subtitle">ข้อมูลหลักสำหรับการรับเข้าและสร้างออเดอร์</p></div></header>
    <app-feedback [error]="error()" [success]="success()" />
    @if (missing) { <section class="card empty"><h2>ไม่พบสินค้า</h2><a routerLink="/products">กลับรายการสินค้า</a></section> }
    @else { <form class="card form-card" [formGroup]="form" (ngSubmit)="save()"><h2>ข้อมูลสินค้า</h2><div class="form-grid">
      <label>รหัสสินค้า (SKU) *<input formControlName="sku" maxlength="50" placeholder="เช่น OFF-007" /></label>
      <label>ชื่อสินค้า *<input formControlName="name" maxlength="200" placeholder="ชื่อที่ใช้ในเอกสาร" /></label>
      <label>หมวดหมู่ *<select formControlName="categoryId"><option value="">เลือกหมวดหมู่</option>@for (c of store.state().categories; track c.id) { <option [value]="c.id">{{ c.name }}</option> }</select></label>
      <label>หน่วยนับ *<input formControlName="unit" maxlength="50" placeholder="เช่น ชิ้น กล่อง รีม" /></label>
      <label>ราคาขาย (บาท) *<input type="number" formControlName="price" min="0" max="100000000" step="0.01" /></label>
      <label>แจ้งเตือนเมื่อพร้อมขายไม่เกิน<input type="number" formControlName="reorderPoint" min="0" max="100000000" step="0.001" /></label>
    </div><label class="check-label"><input type="checkbox" formControlName="active" /> เปิดใช้งานสินค้า</label><p class="muted">จำนวนสต็อกบันทึกผ่านเมนูรับสินค้าเข้า เอกสารเดิมจะเก็บชื่อและราคาตอนสร้างออเดอร์ไว้</p>
    @if (submitted && form.invalid) { <p class="field-error" role="alert">กรอกข้อมูลที่มี * ให้ครบ และตรวจสอบราคา/จำนวนให้ถูกต้อง</p> }
    <div class="form-actions"><a class="btn" routerLink="/products">ยกเลิก</a><button class="btn primary" type="submit">บันทึกสินค้า</button></div></form> }
  `,
})
export class ProductForm extends ActionPage {
  private fb = inject(FormBuilder); private route = inject(ActivatedRoute); private router = inject(Router);
  id = this.route.snapshot.paramMap.get('id'); missing = false; submitted = false;
  form = this.fb.nonNullable.group({
    sku: ['', [Validators.required, Validators.maxLength(50)]], name: ['', [Validators.required, Validators.maxLength(200)]],
    categoryId: ['', Validators.required], unit: ['', [Validators.required, Validators.maxLength(50)]],
    price: [0, [Validators.required, Validators.min(0), Validators.max(100000000)]],
    reorderPoint: [0, [Validators.required, Validators.min(0), Validators.max(100000000)]], active: true,
  });
  constructor() { super(); if (this.id) { const p = this.store.product(this.id); if (p) this.form.patchValue(p); else this.missing = true; } }
  save() {
    this.submitted = true; this.form.markAllAsTouched();
    if (this.form.invalid || this.missing) return;
    this.perform(() => { const id = this.store.saveProduct(this.form.getRawValue(), this.id ?? undefined); void this.router.navigate(['/products', id]); });
  }
}
