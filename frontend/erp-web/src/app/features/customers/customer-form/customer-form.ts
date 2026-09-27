import { Component, ElementRef, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, ValidatorFn } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ActionPage } from '../../../shared/components/action-page';
import { Feedback } from '../../../shared/components/feedback/feedback';
import { CustomerField, customerFieldError, customerFields } from '../../../shared/validators/customer-validation';

@Component({
  selector: 'app-customer-form', imports: [ReactiveFormsModule, RouterLink, Feedback],
  template: `
    <header class="page-heading"><div><a class="back-link" routerLink="/customers">← รายการลูกค้า</a><h1>{{ id ? 'แก้ไขลูกค้า' : 'เพิ่มลูกค้า' }}</h1><p class="subtitle">ข้อมูลลูกค้าสำหรับติดต่อและจัดส่งสินค้า</p></div></header>
    <app-feedback [error]="error()" [success]="success()" />
    @if (missing) { <section class="card empty"><h2>ไม่พบลูกค้า</h2><a routerLink="/customers">กลับรายการลูกค้า</a></section> }
    @else { <form class="card form-card" [formGroup]="form" (ngSubmit)="save()"><h2>ข้อมูลทั่วไป</h2><div class="form-grid">
      @for (field of fields; track field.key) {
        <label [class.span-two]="field.key === 'address' || field.key === 'notes'">{{ field.label }}{{ field.required ? ' *' : '' }}
          @if (field.key === 'address' || field.key === 'notes') {
            <textarea [id]="field.key" [formControlName]="field.key" [rows]="field.key === 'address' ? 4 : 2" [attr.maxlength]="field.max" [attr.aria-required]="field.required" [attr.aria-invalid]="!!fieldError(field.key)" [attr.aria-describedby]="fieldError(field.key) ? field.key + '-error' : null" [placeholder]="field.key === 'address' ? 'บ้านเลขที่ ถนน ตำบล/แขวง อำเภอ/เขต จังหวัด รหัสไปรษณีย์' : 'คำแนะนำการติดต่อหรือจัดส่ง'" [attr.autocomplete]="field.key === 'address' ? 'street-address' : 'off'"></textarea>
          } @else {
            <input [id]="field.key" [formControlName]="field.key" [type]="field.key === 'phone' ? 'tel' : field.key === 'email' ? 'email' : 'text'" [attr.maxlength]="field.max" [attr.inputmode]="field.key === 'taxId' ? 'numeric' : null" [attr.aria-required]="field.required" [attr.aria-invalid]="!!fieldError(field.key)" [attr.aria-describedby]="field.key + '-hint' + (fieldError(field.key) ? ' ' + field.key + '-error' : '')" [attr.autocomplete]="autocomplete(field.key)" />
            <small class="muted" [id]="field.key + '-hint'">{{ hint(field.key) }}</small>
          }
          @if (fieldError(field.key); as message) { <small class="field-error" [id]="field.key + '-error'" aria-live="polite">{{ message }}</small> }
        </label>
      }
    </div><label class="check-label"><input type="checkbox" formControlName="active" /> เปิดใช้งานลูกค้า</label><p class="muted">ลูกค้าที่ปิดใช้งานจะเลือกสร้างออเดอร์ใหม่ไม่ได้ ข้อมูลในออเดอร์และเอกสารเดิมจะคงเดิม</p>
    @if (submitted && form.invalid) { <p class="field-error" role="alert">ยังบันทึกไม่ได้ กรุณาแก้ไขช่องที่มีข้อความสีแดง</p> }
    <div class="form-actions"><a class="btn" routerLink="/customers">ยกเลิก</a><button class="btn primary" type="submit">บันทึกลูกค้า</button></div></form> }
  `,
})
export class CustomerForm extends ActionPage {
  private fb = inject(FormBuilder); private route = inject(ActivatedRoute); private router = inject(Router);
  private element = inject<ElementRef<HTMLElement>>(ElementRef);
  id = this.route.snapshot.paramMap.get('id'); missing = false; submitted = false;
  fields = (Object.keys(customerFields) as CustomerField[]).map(key => ({ key, ...customerFields[key] }));
  private validate(field: CustomerField): ValidatorFn {
    return control => {
      let message = customerFieldError(field, control.value);
      if (!message && field === 'code' && this.store.customers().some(c => c.id !== this.id && c.code.toUpperCase() === String(control.value).trim().toUpperCase())) message = 'รหัสลูกค้านี้มีอยู่แล้ว';
      return message ? { customer: message } : null;
    };
  }
  form = this.fb.nonNullable.group({
    code: ['', this.validate('code')], name: ['', this.validate('name')],
    contactName: ['', this.validate('contactName')], phone: ['', this.validate('phone')],
    email: ['', this.validate('email')], taxId: ['', this.validate('taxId')],
    address: ['', this.validate('address')], notes: ['', this.validate('notes')], active: true,
  });
  fieldError(field: CustomerField): string { const control = this.form.controls[field]; return (this.submitted || control.touched) ? (control.errors?.['customer'] ?? '') : ''; }
  hint(field: CustomerField): string {
    return ({ code: 'เช่น CUS-001 · รหัสต้องไม่ซ้ำ', phone: 'เช่น 081-234-5678, 02-123-4567 หรือ +66 81 234 5678', email: 'เช่น name@example.com', taxId: 'ตัวเลข 13 หลัก (ถ้ามี)' } as Partial<Record<CustomerField, string>>)[field] ?? '';
  }
  autocomplete(field: CustomerField): string { return ({ name: 'organization', contactName: 'name', phone: 'tel', email: 'email' } as Partial<Record<CustomerField, string>>)[field] ?? 'off'; }
  constructor() { super(); if (this.id) { const customer = this.store.customer(this.id); if (customer) this.form.patchValue(customer); else this.missing = true; } }
  save() {
    this.submitted = true; this.form.markAllAsTouched();
    this.form.controls.code.updateValueAndValidity();
    if (this.form.invalid || this.missing) { this.element.nativeElement.querySelector<HTMLElement>('input.ng-invalid, textarea.ng-invalid')?.focus(); return; }
    this.perform(() => { const id = this.store.saveCustomer(this.form.getRawValue(), this.id ?? undefined); void this.router.navigate(['/customers', id]); });
  }
}

