import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
@Component({
  selector: 'app-sidebar', imports: [RouterLink, RouterLinkActive],
  template: `
    <aside class="sidebar"><a class="brand" routerLink="/dashboard"><span class="brand-mark">E</span><span>ERP<span class="brand-light"> Backoffice</span><small>WORKSPACE</small></span></a><p class="nav-section">จัดการธุรกิจ</p>
    <nav aria-label="เมนูหลัก">@for (item of items; track item.path; let i = $index) { <a [routerLink]="item.path" routerLinkActive="active" ariaCurrentWhenActive="page"><span class="nav-icon">{{ item.icon }}</span><span>{{ item.label }}</span><span class="nav-arrow">›</span></a> }</nav>
    <div class="sidebar-bottom"><span class="connection-dot"></span><div><strong>พื้นที่ทดลองส่วนตัว</strong><small>ข้อมูลเก็บในเบราว์เซอร์นี้</small></div></div></aside>
  `,
})
export class Sidebar {
  readonly items = [
    { path: '/dashboard', label: 'ภาพรวม', icon: '◫' }, { path: '/products', label: 'สินค้า', icon: '▦' },
    { path: '/inventory', label: 'สต็อก / คลังสินค้า', icon: '▥' }, { path: '/orders', label: 'Sales Order', icon: '▤' },
    { path: '/payments', label: 'การชำระเงิน', icon: '฿' }, { path: '/receipts', label: 'ใบเสร็จ', icon: '▧' },
    { path: '/deliveries', label: 'การจัดส่ง', icon: '⇢' },
  ];
}
