import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from '../navbar/navbar';
import { Sidebar } from '../sidebar/sidebar';
import { DemoStore } from '../../core/services/demo-store';
@Component({
  selector: 'app-main-layout', imports: [RouterOutlet, Navbar, Sidebar],
  template: `
    <a class="skip-link" href="#main-content">ข้ามไปเนื้อหา</a>
    <div class="app-shell"><app-sidebar /><div class="main-column"><app-navbar />
      <div class="demo-banner"><span class="demo-label">DEMO</span><span>ข้อมูลทดลองในเบราว์เซอร์ · ยังไม่เชื่อม SQL Server และไม่รับชำระเงินจริง</span></div>
      @if (store.storageWarning()) { <div class="alert error" role="alert">{{ store.storageWarning() }}</div> }
      <main id="main-content" tabindex="-1"><router-outlet /></main>
      <footer class="app-footer">ERP Backoffice <span>พื้นที่ทดลองสำหรับเจ้าหน้าที่</span></footer>
    </div></div>
  `,
})
export class MainLayout { readonly store = inject(DemoStore); }
