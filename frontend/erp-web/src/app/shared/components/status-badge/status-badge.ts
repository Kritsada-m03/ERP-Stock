import { Component, computed, input } from '@angular/core';
import { OrderStatus, STATUS_LABELS } from '../../models/erp.models';
@Component({
  selector: 'app-status-badge',
  template: '<span class="badge" [attr.data-status]="status()">{{ label() }}</span>',
})
export class StatusBadge {
  readonly status = input.required<string>();
  readonly label = computed(() => STATUS_LABELS[this.status() as OrderStatus] ?? ({ Pending: 'รอตรวจรับเงิน', Verified: 'รับเงินแล้ว', Receive: 'รับเข้า', Dispatch: 'ส่งออก' } as Record<string, string>)[this.status()] ?? this.status());
}
