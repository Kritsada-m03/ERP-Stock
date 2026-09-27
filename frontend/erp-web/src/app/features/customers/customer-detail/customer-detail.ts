import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DemoStore } from '../../../core/services/demo-store';

@Component({
  selector: 'app-customer-detail', imports: [CommonModule, RouterLink],
  template: `
    @if (customer(); as c) {
      <header class="page-heading"><div><a class="back-link" routerLink="/customers">← รายการลูกค้า</a><p class="eyebrow">{{ c.code }}</p><h1>{{ c.name }}</h1><p class="subtitle">รายละเอียดลูกค้าและข้อมูลติดต่อ</p></div><div class="actions">@if (c.active) { <a class="btn primary" routerLink="/orders/new" [queryParams]="{ customerId: c.id }">สร้างออเดอร์</a> }<a class="btn" [routerLink]="['/customers', c.id, 'edit']">แก้ไขลูกค้า</a></div></header>
      <section class="card form-card"><h2>ข้อมูลลูกค้า <span class="badge" [attr.data-status]="c.active ? 'Completed' : 'Cancelled'">{{ c.active ? 'เปิดใช้งาน' : 'ปิดใช้งาน' }}</span></h2><dl class="form-grid customer-details">
      <div><dt>ชื่อผู้ติดต่อ</dt><dd>{{ c.contactName || '—' }}</dd></div><div><dt>โทรศัพท์</dt><dd>{{ c.phone || '—' }}</dd></div>
      <div><dt>อีเมล</dt><dd>{{ c.email || '—' }}</dd></div><div><dt>เลขประจำตัวผู้เสียภาษี</dt><dd>{{ c.taxId || '—' }}</dd></div>
      <div class="span-two"><dt>ที่อยู่</dt><dd>{{ c.address }}</dd></div><div class="span-two"><dt>หมายเหตุ</dt><dd>{{ c.notes || '—' }}</dd></div>
      <div><dt>วันที่สร้าง</dt><dd>{{ c.createdAt | date:'dd/MM/yyyy HH:mm' }}</dd></div><div><dt>แก้ไขล่าสุด</dt><dd>{{ (c.updatedAt || c.createdAt) | date:'dd/MM/yyyy HH:mm' }}</dd></div>
      </dl></section>
    } @else { <section class="card empty"><h1>ไม่พบลูกค้า</h1><a routerLink="/customers">กลับรายการลูกค้า</a></section> }
  `,
  styles: `.customer-details dt { color: var(--muted); font-size: .85rem; } .customer-details dd { margin: .4rem 0 0; white-space: pre-wrap; overflow-wrap: anywhere; }`,
})
export class CustomerDetail {
  readonly store = inject(DemoStore); private route = inject(ActivatedRoute);
  readonly customer = computed(() => this.store.customer(this.route.snapshot.paramMap.get('id') ?? ''));
}
