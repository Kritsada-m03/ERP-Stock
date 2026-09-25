import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./layouts/main-layout/main-layout').then(m => m.MainLayout),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard').then(m => m.Dashboard) },
      { path: 'products', loadComponent: () => import('./features/products/product-list/product-list').then(m => m.ProductList) },
      { path: 'products/new', loadComponent: () => import('./features/products/product-form/product-form').then(m => m.ProductForm) },
      { path: 'products/:id/edit', loadComponent: () => import('./features/products/product-form/product-form').then(m => m.ProductForm) },
      { path: 'products/:id', loadComponent: () => import('./features/products/product-detail/product-detail').then(m => m.ProductDetail) },
      { path: 'inventory', loadComponent: () => import('./features/inventory/stock-list/stock-list').then(m => m.StockList) },
      { path: 'inventory/receive', loadComponent: () => import('./features/inventory/stock-receive/stock-receive').then(m => m.StockReceive) },
      { path: 'inventory/history', loadComponent: () => import('./features/inventory/stock-history/stock-history').then(m => m.StockHistory) },
      { path: 'orders', loadComponent: () => import('./features/orders/order-list/order-list').then(m => m.OrderList) },
      { path: 'orders/new', loadComponent: () => import('./features/orders/order-create/order-create').then(m => m.OrderCreate) },
      { path: 'orders/:id', loadComponent: () => import('./features/orders/order-detail/order-detail').then(m => m.OrderDetail) },
      { path: 'payments', loadComponent: () => import('./features/payments/payment-list/payment-list').then(m => m.PaymentList) },
      { path: 'payments/:id/qr', loadComponent: () => import('./features/payments/qr-payment/qr-payment').then(m => m.QrPayment) },
      { path: 'receipts', loadComponent: () => import('./features/receipts/receipts').then(m => m.Receipts) },
      { path: 'deliveries', loadComponent: () => import('./features/deliveries/deliveries').then(m => m.Deliveries) },
      { path: '**', redirectTo: 'dashboard' },
    ],
  },
];
