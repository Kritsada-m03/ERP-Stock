import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActionPage } from '../../shared/components/action-page';
import { StatusBadge } from '../../shared/components/status-badge/status-badge';
import { DocumentPreview } from '../../shared/components/document-preview/document-preview';
@Component({
  selector: 'app-deliveries', imports: [CommonModule, FormsModule, RouterLink, StatusBadge, DocumentPreview],
  template: `
    <header class="page-heading"><div><p class="eyebrow">FULFILLMENT / จัดส่ง</p><h1>การจัดส่งสินค้า</h1><p class="subtitle">เตรียมสินค้า ออกใบส่งของ และติดตามการจัดส่ง</p></div><a class="btn" routerLink="/orders">ดูออเดอร์ →</a></header>
    <div class="stat-grid three"><div class="stat"><span>กำลังเตรียม</span><strong>{{ count('Preparing') }} <small>รายการ</small></strong></div><div class="stat"><span>พร้อมส่ง</span><strong>{{ count('ReadyToShip') }} <small>รายการ</small></strong></div><div class="stat"><span>จัดส่งสำเร็จ</span><strong>{{ count('Completed') }} <small>รายการ</small></strong></div></div>
    <section class="card"><div class="toolbar"><input class="search" aria-label="ค้นหาการจัดส่ง" placeholder="ค้นหาเลขใบส่งของ ชื่อลูกค้า หรือเลขติดตาม…" [ngModel]="search()" (ngModelChange)="search.set($event)" /><select aria-label="สถานะจัดส่ง" [ngModel]="status()" (ngModelChange)="status.set($event)"><option value="">ทุกสถานะ</option><option value="Preparing">กำลังเตรียม</option><option value="ReadyToShip">พร้อมส่ง</option><option value="Completed">จัดส่งสำเร็จ</option></select></div><div class="table-wrap"><table><thead><tr><th>เลขใบส่งของ / ออเดอร์</th><th>ผู้รับสินค้า</th><th>สถานะ</th><th>เลขติดตาม</th><th></th></tr></thead><tbody>
    @for (d of filtered(); track d.id) { <tr><td><strong class="mono">{{ d.number }}</strong><div><a [routerLink]="['/orders', d.orderId]">{{ store.order(d.orderId)?.number }}</a></div></td><td>{{ d.customer.name }}</td><td><app-status-badge [status]="d.status" /></td><td>{{ d.tracking || '—' }}</td><td><div class="actions">@if (d.issuedAt) { <button class="btn small" (click)="selectedId.set(d.id)">ใบส่งของ</button> } @if (d.status !== 'Completed') { <a class="btn small primary" [routerLink]="['/orders', d.orderId]">{{ d.status === 'Preparing' ? 'เตรียม / ออกใบส่งของ' : 'ยืนยันส่ง' }}</a> }</div></td></tr> } @empty { <tr><td colspan="5" class="empty"><h2>ยังไม่มีงานจัดส่ง</h2><p>เริ่มเตรียมสินค้าจากออเดอร์ที่ออกใบเสร็จแล้ว</p></td></tr> }</tbody></table></div></section>
    @if (selected(); as document) { @if (document.issuedAt) { <app-document-preview [document]="document" kind="delivery" [orderNumber]="store.order(document.orderId)?.number ?? ''" /> } }
  `,
})
export class Deliveries extends ActionPage {
  private query = toSignal(inject(ActivatedRoute).queryParamMap); selectedId = signal(''); search = signal(''); status = signal('');
  filtered = computed(() => [...this.store.state().deliveries].reverse().filter(d => (!this.status() || d.status === this.status()) && (d.number+d.customer.name+(d.tracking ?? '')).toLowerCase().includes(this.search().toLowerCase())));
  selected = computed(() => this.store.state().deliveries.find(d => d.id === (this.selectedId() || this.query()?.get('id'))) ?? null);
  count(status: string) { return this.store.state().deliveries.filter(d => d.status === status).length; }
}
