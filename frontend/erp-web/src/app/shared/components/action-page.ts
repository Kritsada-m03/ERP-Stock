import { inject, signal } from '@angular/core';
import { DemoStore } from '../../core/services/demo-store';

export abstract class ActionPage {
  readonly store = inject(DemoStore);
  readonly error = signal('');
  readonly success = signal('');
  perform(action: () => void, message = 'บันทึกข้อมูลทดลองแล้ว'): boolean {
    this.error.set(''); this.success.set('');
    try { action(); this.success.set(message); return true; }
    catch (error) { this.error.set(error instanceof Error ? error.message : 'ทำรายการไม่สำเร็จ'); return false; }
  }
}
