import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActionPage } from '../../shared/components/action-page';
import { DocumentPreview } from '../../shared/components/document-preview/document-preview';
@Component({
  selector: 'app-receipts', imports: [CommonModule, FormsModule, RouterLink, DocumentPreview],
  template: `
    <header class="page-heading"><div><p class="eyebrow">DOCUMENTS / เอกสาร</p><h1>ใบเสร็จรับเงิน</h1><p class="subtitle">เอกสารที่ออกหลังยืนยันรับเงินทดลองแล้ว</p></div><span class="count-pill">{{ store.state().receipts.length }} เอกสาร</span></header>
    <section class="card"><div class="toolbar"><input class="search" aria-label="ค้นหาใบเสร็จ" placeholder="ค้นหาเลขใบเสร็จ หรือชื่อลูกค้า…" [ngModel]="search()" (ngModelChange)="search.set($event)" /></div><div class="table-wrap"><table><thead><tr><th>เลขใบเสร็จ / วันที่</th><th>ลูกค้า</th><th class="numeric">ยอดรับเงิน</th><th>ออเดอร์</th><th></th></tr></thead><tbody>
    @for (r of filtered(); track r.id) { <tr [class.selected-row]="selected()?.id === r.id"><td><strong class="mono">{{ r.number }}</strong><div class="muted">{{ r.issuedAt | date:'dd/MM/yyyy':'+0700' }}</div></td><td>{{ r.customer.name }}</td><td class="numeric">{{ r.total | currency:'THB':'symbol-narrow' }}</td><td><a [routerLink]="['/orders', r.orderId]">{{ store.order(r.orderId)?.number }}</a></td><td><button class="btn small" (click)="selectedId.set(r.id)">ดูเอกสาร</button></td></tr> } @empty { <tr><td colspan="5" class="empty"><h2>ยังไม่มีใบเสร็จ</h2><p>ไปที่ออเดอร์ที่รับเงินแล้วเพื่อออกใบเสร็จ</p><a routerLink="/orders">ดูออเดอร์ →</a></td></tr> }</tbody></table></div></section>
    @if (selected(); as document) { <app-document-preview [document]="document" kind="receipt" [orderNumber]="store.order(document.orderId)?.number ?? ''" /> }
  `,
})
export class Receipts extends ActionPage {
  private query = toSignal(inject(ActivatedRoute).queryParamMap); selectedId = signal(''); search = signal('');
  filtered = computed(() => [...this.store.state().receipts].reverse().filter(r => (r.number+r.customer.name).toLowerCase().includes(this.search().toLowerCase())));
  selected = computed(() => this.store.state().receipts.find(r => r.id === (this.selectedId() || this.query()?.get('id'))) ?? null);
}
