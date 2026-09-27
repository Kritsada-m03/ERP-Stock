export const customerFields = {
  code: { label: 'รหัสลูกค้า', max: 30, required: true },
  name: { label: 'ชื่อลูกค้า / บริษัท', max: 200, required: true },
  contactName: { label: 'ชื่อผู้ติดต่อ', max: 200, required: false },
  phone: { label: 'เบอร์โทรศัพท์', max: 30, required: false },
  email: { label: 'อีเมล', max: 254, required: false },
  taxId: { label: 'เลขประจำตัวผู้เสียภาษี', max: 13, required: false },
  address: { label: 'ที่อยู่', max: 1000, required: true },
  notes: { label: 'หมายเหตุ', max: 1000, required: false },
} as const;
export type CustomerField = keyof typeof customerFields;

// The same application rules are implemented by CustomerFieldAttribute in the API.
const emailPattern = /^[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,63}$/;
export function customerFieldError(field: CustomerField, input: string | null | undefined): string {
  const value = (input ?? '').trim();
  const rule = customerFields[field];
  if (!value) return rule.required ? `กรุณากรอก${rule.label}` : '';
  if (value.length > rule.max) return `${rule.label}ต้องไม่เกิน ${rule.max} ตัวอักษร`;
  if (field === 'code' && !/^[A-Za-z0-9_-]+$/.test(value)) return 'รหัสลูกค้าใช้ A–Z, 0–9, ขีดกลาง (-) และขีดล่าง (_) เท่านั้น';
  if (field === 'phone') {
    const compact = value.replace(/[ -]/g, '');
    const domestic = compact.startsWith('+66') ? '0' + compact.slice(3) : compact;
    if (!/^[+0-9 -]+$/.test(value) || !/^(?:0[23457][0-9]{7}|0[689][0-9]{8})$/.test(domestic))
      return 'กรอกเบอร์ไทย 9–10 หลัก เช่น 02-123-4567, 081-234-5678 หรือ +66 81 234 5678';
  }
  if (field === 'email' && (!emailPattern.test(value) || value.split('@')[0].length > 64)) return 'กรอกอีเมลให้ถูกต้อง เช่น name@example.com';
  if (field === 'taxId' && !/^[0-9]{13}$/.test(value)) return 'เลขผู้เสียภาษีต้องเป็นตัวเลข 13 หลัก';
  return '';
}
