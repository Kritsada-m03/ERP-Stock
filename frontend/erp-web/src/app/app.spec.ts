import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from './app.routes';

describe('Backoffice routes', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
  });

  it('opens the dashboard inside the staff layout', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/');
    expect(TestBed.inject(Router).url).toBe('/dashboard');
    expect(harness.routeNativeElement?.querySelector('h1')?.textContent).toBe('ภาพรวมการดำเนินงาน');
    expect(harness.routeNativeElement?.querySelector('nav a[href="/customers"]')?.textContent).toContain('ลูกค้า');
  });

  it('matches the new-product page before the product detail route', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/products/new');
    expect(harness.routeNativeElement?.querySelector('h1')?.textContent).toBe('เพิ่มสินค้า');
    await harness.navigateByUrl('/products/p1');
    expect(harness.routeNativeElement?.querySelector('h1')?.textContent).toBe('กระดาษ A4 80 แกรม');
    await harness.navigateByUrl('/products/missing-product');
    expect(harness.routeNativeElement?.querySelector('h1')?.textContent).toBe('ไม่พบสินค้า');
  });
});
