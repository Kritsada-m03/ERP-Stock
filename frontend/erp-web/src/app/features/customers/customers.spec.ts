import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../../app.routes';
import { DemoStore } from '../../core/services/demo-store';

describe('Customer screens', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
  });

  it('creates a customer through the form, edits the address, and prefills an order', async () => {
    const harness = await RouterTestingHarness.create('/customers/new');
    const fill = (control: string, value: string) => {
      const input = harness.routeNativeElement!.querySelector<HTMLInputElement>(`#${control}`)!;
      input.value = value; input.dispatchEvent(new Event('input')); harness.detectChanges();
    };
    fill('code', 'CUS-101'); fill('name', 'ลูกค้าจากฟอร์ม'); fill('address', 'ที่อยู่เดิม');
    harness.routeNativeElement!.querySelector<HTMLFormElement>('form')!.dispatchEvent(new Event('submit', { cancelable: true }));
    await harness.fixture.whenStable(); harness.detectChanges();
    const customer = TestBed.inject(DemoStore).customers()[0];
    expect(TestBed.inject(Router).url).toBe('/customers/' + customer.id);
    expect(harness.routeNativeElement!.querySelector('h1')!.textContent).toBe(customer.name);
    await harness.navigateByUrl(`/customers/${customer.id}/edit`);
    fill('address', 'ที่อยู่ใหม่ กรุงเทพฯ 10000');
    harness.routeNativeElement!.querySelector<HTMLFormElement>('form')!.dispatchEvent(new Event('submit', { cancelable: true }));
    await harness.fixture.whenStable(); harness.detectChanges();
    await harness.navigateByUrl('/orders/new?customerId=' + customer.id);
    await harness.fixture.whenStable(); harness.detectChanges();
    expect(harness.routeNativeElement!.querySelector<HTMLInputElement>('[name="customerName"]')!.value).toBe(customer.name);
    expect(harness.routeNativeElement!.querySelector<HTMLTextAreaElement>('[name="address"]')!.value).toBe('ที่อยู่ใหม่ กรุงเทพฯ 10000');
  });

  it('shows a missing customer instead of an editable empty form', async () => {
    const harness = await RouterTestingHarness.create('/customers/missing/edit');
    expect(harness.routeNativeElement!.textContent).toContain('ไม่พบลูกค้า');
    expect(harness.routeNativeElement!.querySelector('form')).toBeNull();
  });

  it('shows inline errors after blur, blocks invalid submission, and clears errors on correction', async () => {
    const harness = await RouterTestingHarness.create('/customers/new');
    const root = harness.routeNativeElement!;
    const fill = (field: string, value: string, blur = true) => {
      const input = root.querySelector<HTMLInputElement>('#' + field)!;
      input.value = value; input.dispatchEvent(new Event('input'));
      if (blur) input.dispatchEvent(new Event('blur'));
      harness.detectChanges();
    };
    expect(root.querySelector('#phone-error')).toBeNull();
    fill('phone', 'abc', false);
    expect(root.querySelector('#phone-error')).toBeNull();
    root.querySelector('#phone')!.dispatchEvent(new Event('blur')); harness.detectChanges();
    expect(root.querySelector('#phone-error')?.textContent).toContain('เบอร์ไทย');
    fill('code', 'CUS-202'); fill('name', '   '); fill('address', 'ที่อยู่ทดลอง'); fill('email', 'bad@localhost');
    root.querySelector('form')!.dispatchEvent(new Event('submit', { cancelable: true }));
    await harness.fixture.whenStable(); harness.detectChanges();
    expect(TestBed.inject(DemoStore).customers()).toHaveLength(0);
    expect(root.querySelector('#name-error')?.textContent).toContain('กรุณากรอก');
    expect(root.querySelector('#email')?.getAttribute('aria-invalid')).toBe('true');
    fill('name', 'ลูกค้าทดลอง'); fill('phone', '+66 81 234 5678'); fill('email', 'first.last+test@example.com');
    expect(root.querySelector('#phone-error')).toBeNull(); expect(root.querySelector('#email-error')).toBeNull();
    root.querySelector('form')!.dispatchEvent(new Event('submit', { cancelable: true }));
    await harness.fixture.whenStable(); harness.detectChanges();
    expect(TestBed.inject(DemoStore).customers()).toHaveLength(1);
    await harness.navigateByUrl('/customers/new');
    const code = harness.routeNativeElement!.querySelector<HTMLInputElement>('#code')!;
    code.value = ' cus-202 '; code.dispatchEvent(new Event('input')); code.dispatchEvent(new Event('blur')); harness.detectChanges();
    expect(harness.routeNativeElement!.querySelector('#code-error')?.textContent).toContain('มีอยู่แล้ว');
  });

  it('also blocks invalid customer details on the order form', async () => {
    const harness = await RouterTestingHarness.create('/orders/new');
    const phone = harness.routeNativeElement!.querySelector<HTMLInputElement>('[name="phone"]')!;
    phone.value = '081234567'; phone.dispatchEvent(new Event('input')); phone.dispatchEvent(new Event('blur'));
    await harness.fixture.whenStable(); harness.detectChanges();
    expect(harness.routeNativeElement!.querySelector('#order-phone-error')?.textContent).toContain('เบอร์ไทย');
    harness.routeNativeElement!.querySelector('form')!.dispatchEvent(new Event('submit', { cancelable: true }));
    await harness.fixture.whenStable(); harness.detectChanges();
    expect(TestBed.inject(DemoStore).orders()).toHaveLength(0);
    expect(TestBed.inject(Router).url).toBe('/orders/new');
  });
});
