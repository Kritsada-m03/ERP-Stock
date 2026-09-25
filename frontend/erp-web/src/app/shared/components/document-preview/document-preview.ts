import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Delivery, Receipt } from '../../models/erp.models';
@Component({
  selector: 'app-document-preview', imports: [CommonModule],
  template: `
    <div class="document-toolbar"><span class="muted">ตัวอย่างเอกสาร · ใช้ Print / Save as PDF ของเบราว์เซอร์</span><button class="btn primary" (click)="print()">พิมพ์เอกสาร / PDF</button></div>
    <article class="print-document">
      <div class="document-top"><div><span class="document-brand">ERP<span> / </span>BACKOFFICE</span><p>บริษัทตัวอย่างสำหรับทดลองระบบ</p></div><div class="text-right"><h2>{{ kind() === 'receipt' ? 'ใบเสร็จรับเงิน' : 'ใบส่งของ' }}</h2><strong class="mono">{{ document().number }}</strong><p>{{ document().issuedAt | date:'dd/MM/yyyy HH:mm':'+0700' }}</p></div></div>
      <div class="document-demo">เอกสารทดลอง — ไม่ใช่หลักฐานรับเงินหรือส่งสินค้าจริง</div>
      <div class="document-customer"><div><span class="muted">ลูกค้า / ผู้รับสินค้า</span><h3>{{ document().customer.name }}</h3><p class="address">{{ document().customer.address }}</p><p>{{ document().customer.phone }}</p></div><div><span class="muted">อ้างอิง Sales Order</span><p class="mono">{{ orderNumber() }}</p></div></div>
      <table><thead><tr><th>รายการสินค้า</th><th class="numeric">จำนวน</th>@if (receipt()) { <th class="numeric">ราคา</th><th class="numeric">รวม</th> }</tr></thead><tbody>@for (item of document().items; track item.productId) { <tr><td>{{ item.name }}<div class="muted mono">{{ item.sku }}</div></td><td class="numeric">{{ item.quantity | number:'1.0-3' }} {{ item.unit }}</td>@if (receipt()) { <td class="numeric">{{ item.price | number:'1.2-2' }}</td><td class="numeric">{{ item.total | number:'1.2-2' }}</td> }</tr> }</tbody></table>
      @if (receipt(); as r) { <div class="order-totals"><div><span>ยอดสินค้า</span><strong>{{ r.subtotal | currency:'THB':'symbol-narrow' }}</strong></div><div><span>ส่วนลด</span><span>{{ r.discount | currency:'THB':'symbol-narrow' }}</span></div><div class="grand-total"><span>ยอดรับเงินทดลอง</span><strong>{{ r.total | currency:'THB':'symbol-narrow' }}</strong></div></div> }
      <div class="signatures"><div>ลงชื่อ ______________________<p>{{ kind() === 'receipt' ? 'ผู้รับเงิน' : 'ผู้ส่งสินค้า' }}</p></div><div>ลงชื่อ ______________________<p>{{ kind() === 'receipt' ? 'ผู้ชำระเงิน' : 'ผู้รับสินค้า' }}</p></div></div>
      <footer class="document-footnote">ข้อมูลทดลองในเบราว์เซอร์ · ไม่ใช่ใบกำกับภาษี</footer>
    </article>
  `,
})
export class DocumentPreview {
  readonly document = input.required<Receipt | Delivery>(); readonly kind = input.required<'receipt' | 'delivery'>(); readonly orderNumber = input('');
  readonly receipt = computed(() => { const document = this.document(); return 'total' in document ? document : null; });
  print() { window.print(); }
}
