import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ActionPage } from '../../../shared/components/action-page';

@Component({
  selector: 'app-customer-list', imports: [FormsModule, RouterLink],
  template: `
    <header class="page-heading"><div><p class="eyebrow">CUSTOMERS / ลูกค้า</p><h1>ข้อมูลลูกค้า</h1><p class="subtitle">รายชื่อลูกค้า ข้อมูลติดต่อ และที่อยู่สำหรับสร้างออเดอร์</p></div><a class="btn primary" routerLink="/customers/new">＋ เพิ่มลูกค้า</a></header>
    <div class="stat-grid three"><div class="stat"><span>ลูกค้าทั้งหมด</span><strong>{{ store.customers().length }} <small>ราย</small></strong></div><div class="stat"><span>เปิดใช้งาน</span><strong>{{ activeCount() }} <small>ราย</small></strong></div><div class="stat"><span>ปิดใช้งาน</span><strong>{{ store.customers().length - activeCount() }} <small>ราย</small></strong></div></div>
    <section class="card"><div class="toolbar"><label class="search"><span class="sr-only">ค้นหาลูกค้า</span><input placeholder="ค้นหารหัส ชื่อ โทรศัพท์ หรืออีเมล…" [ngModel]="search()" (ngModelChange)="search.set($event); page.set(1)" /></label><select aria-label="สถานะลูกค้า" [ngModel]="status()" (ngModelChange)="status.set($event); page.set(1)"><option value="">ทุกสถานะ</option><option value="active">เปิดใช้งาน</option><option value="inactive">ปิดใช้งาน</option></select></div>
    <div class="table-wrap"><table><thead><tr><th>ลูกค้า / รหัส</th><th>ข้อมูลติดต่อ</th><th>ที่อยู่</th><th>สถานะ</th><th></th></tr></thead><tbody>
    @for (c of paged(); track c.id) { <tr><td><a class="item-title" [routerLink]="['/customers', c.id]">{{ c.name }}</a><div class="muted mono">{{ c.code }}</div>@if (c.contactName) { <small class="block muted">ผู้ติดต่อ: {{ c.contactName }}</small> }</td><td>{{ c.phone || '—' }}<small class="block muted">{{ c.email || '—' }}</small></td><td class="customer-address">{{ c.address }}</td><td><span class="badge" [attr.data-status]="c.active ? 'Completed' : 'Cancelled'">{{ c.active ? 'เปิดใช้งาน' : 'ปิดใช้งาน' }}</span></td><td><a class="btn small" [routerLink]="['/customers', c.id, 'edit']">แก้ไข</a></td></tr> }
    @empty { <tr><td colspan="5"><div class="empty"><strong>ไม่พบลูกค้า</strong><p>เพิ่มลูกค้าใหม่ หรือลองเปลี่ยนคำค้นหา</p></div></td></tr> }
    </tbody></table></div><footer class="table-footer"><span>{{ filtered().length }} รายการ</span><div class="actions"><button class="btn small" [disabled]="currentPage() <= 1" (click)="page.set(currentPage()-1)">ก่อนหน้า</button><span>{{ currentPage() }} / {{ pages() }}</span><button class="btn small" [disabled]="currentPage() >= pages()" (click)="page.set(currentPage()+1)">ถัดไป</button></div></footer></section>
  `,
  styles: `.customer-address { max-width: 320px; white-space: normal; overflow-wrap: anywhere; }`,
})
export class CustomerList extends ActionPage {
  search = signal(''); status = signal(''); page = signal(1);
  activeCount = computed(() => this.store.customers().filter(c => c.active).length);
  filtered = computed(() => {
    const term = this.search().trim().toLowerCase();
    return this.store.customers().filter(c => [c.code, c.name, c.contactName, c.phone, c.email].join(' ').toLowerCase().includes(term)
      && (!this.status() || c.active === (this.status() === 'active'))).sort((a, b) => a.code.localeCompare(b.code));
  });
  pages = computed(() => Math.max(1, Math.ceil(this.filtered().length / 10)));
  currentPage = computed(() => Math.min(this.page(), this.pages()));
  paged = computed(() => this.filtered().slice((this.currentPage()-1)*10, this.currentPage()*10));
}
