import { AfterViewInit, Component, ElementRef, input, output, viewChild } from '@angular/core';
@Component({
  selector: 'app-confirm-dialog',
  template: `<dialog #dialog (cancel)="dismissed.emit()"><h2>{{ title() }}</h2><p>{{ message() }}</p><p class="muted">รายการนี้เป็นข้อมูลทดลองในเบราว์เซอร์</p><div class="form-actions"><button class="btn" autofocus (click)="dismissed.emit()">ย้อนกลับ</button><button class="btn primary" (click)="confirmed.emit()">ยืนยัน</button></div></dialog>`,
})
export class ConfirmDialog implements AfterViewInit {
  readonly title = input.required<string>(); readonly message = input.required<string>();
  readonly confirmed = output<void>(); readonly dismissed = output<void>();
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');
  ngAfterViewInit() { this.dialog().nativeElement.showModal(); }
}
