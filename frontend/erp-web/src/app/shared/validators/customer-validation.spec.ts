import { CustomerField, customerFieldError } from './customer-validation';

describe('Customer validation rules', () => {
  it.each(['0812345678', '091-234-5678', '061 234 5678', '02-123-4567', '053123456', '+66 81 234 5678', '+66 2 123 4567', '', '   '])('accepts supported phone format %s', phone => {
    expect(customerFieldError('phone', phone)).toBe('');
  });
  it.each(['0000000000', '081234567', '08123456789', '+660812345678', 'abc0812345678', '0812345678 ext 1', '081\n2345678', '+1 202 555 0100'])('rejects unsupported phone %s', phone => {
    expect(customerFieldError('phone', phone)).not.toBe('');
  });
  it.each(['demo@example.com', 'first.last+orders@example.co.th', ' demo@example.com ', '', '   '])('accepts email %s', email => {
    expect(customerFieldError('email', email)).toBe('');
  });
  it.each(['demo', 'demo@localhost', 'demo@@example.com', 'demo @example.com', '.demo@example.com', 'demo..test@example.com', 'demo@-example.com', 'demo@example..com', 'a'.repeat(65) + '@example.com'])('rejects malformed email %s', email => {
    expect(customerFieldError('email', email)).not.toBe('');
  });
  it('validates trimmed required fields, codes and text length without restricting Thai names', () => {
    for (const field of ['code', 'name', 'address'] as CustomerField[]) expect(customerFieldError(field, ' \t ')).not.toBe('');
    expect(customerFieldError('code', ' cus_001-TH ')).toBe('');
    expect(customerFieldError('code', 'CUS 001')).not.toBe('');
    expect(customerFieldError('name', 'บริษัท ตัวอย่าง (ประเทศไทย) จำกัด')).toBe('');
    expect(customerFieldError('notes', 'a'.repeat(1000))).toBe('');
    expect(customerFieldError('notes', 'a'.repeat(1001))).not.toBe('');
    expect(customerFieldError('taxId', '1234567890123')).toBe('');
    expect(customerFieldError('taxId', '123456789012x')).not.toBe('');
  });
});
