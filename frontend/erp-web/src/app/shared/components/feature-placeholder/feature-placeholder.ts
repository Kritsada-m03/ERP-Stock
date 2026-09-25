import { Component, input } from '@angular/core';

@Component({
  selector: 'app-feature-placeholder',
  template: `
    <section class="page">
      <p class="eyebrow">ERP BACKOFFICE</p>
      <h1>{{ title() }}</h1>
      <p>{{ description() }}</p>
      <div class="notice" role="status">หน้าจอนี้อยู่ระหว่างพัฒนา ยังไม่เปิดให้ทำรายการ</div>
    </section>
  `,
})
export class FeaturePlaceholder {
  readonly title = input.required<string>();
  readonly description = input.required<string>();
}
