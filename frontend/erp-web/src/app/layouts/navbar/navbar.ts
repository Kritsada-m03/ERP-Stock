import { Component, signal } from '@angular/core';
import { ActionPage } from '../../shared/components/action-page';
import { ConfirmDialog } from '../../shared/components/confirm-dialog/confirm-dialog';
import { Feedback } from '../../shared/components/feedback/feedback';
@Component({
  selector: 'app-navbar', imports: [ConfirmDialog, Feedback],
  template: `
    <header class="navbar"><div class="breadcrumb"><span>ERP BACKOFFICE</span><span class="breadcrumb-divider">/</span><strong>ระบบจัดการหลังบ้าน</strong></div><div class="actions"><button class="btn small reset-button" (click)="confirming.set(true)">เริ่มข้อมูลทดลองใหม่</button><span class="avatar" aria-hidden="true">DE</span><div class="user-label"><strong>เจ้าหน้าที่ทดลอง</strong><small>Demo workspace</small></div></div></header>
    <app-feedback [error]="error()" [success]="success()" />
    @if (confirming()) { <app-confirm-dialog title="เริ่มข้อมูลทดลองใหม่?" message="สินค้า ออเดอร์ และเอกสารทดลองทั้งหมดในเบราว์เซอร์นี้จะถูกแทนด้วยข้อมูลเริ่มต้น" (dismissed)="confirming.set(false)" (confirmed)="reset()" /> }
  `,
})
export class Navbar extends ActionPage {
  confirming = signal(false);
  reset() { this.perform(() => this.store.reset(), 'เริ่มข้อมูลทดลองใหม่แล้ว'); this.confirming.set(false); }
}
