# Admin Dashboard — Angular 17

داشبورد إداري لإدارة المنتجات والطلبات مبني بـ Angular 17.

## تشغيل المشروع

```bash
npm install
npm start
```

افتح المتصفح على `http://localhost:4200`

**بيانات الدخول:** `admin` / `password123`

---

## هيكل المشروع

```
src/app/
├── core/
│   ├── guards/        # حماية الروابط
│   ├── interceptors/  # Token + معالجة الأخطاء
│   ├── models/        # TypeScript interfaces
│   └── services/      # Auth, Product, Order services
└── features/
    ├── auth/          # صفحة تسجيل الدخول
    ├── dashboard/     # الإحصائيات
    ├── products/      # إدارة المنتجات
    └── orders/        # إدارة الطلبات
```

---

## المتطلبات المنجزة

| المتطلب | التنفيذ |
|---|---|
| Angular 17 + Strict Mode | `tsconfig.json` |
| Authentication | Mock auth مع JWT token |
| Route Guards | `authGuard` و `guestGuard` |
| Lazy Loading | كل الـ features محمّلة بشكل lazy |
| Products CRUD | إضافة، تعديل، حذف، بحث، ترتيب، pagination |
| Orders | عرض وتحديث الحالة مع فلترة |
| Dashboard Analytics | `forkJoin` لتحميل البيانات بشكل متوازي |
| Reactive Forms | Login + Product forms |
| Async Validator | التحقق من تكرار اسم المنتج |
| HTTP Interceptors | Token interceptor + Error interceptor |
| RxJS | `forkJoin`, `debounceTime`, `switchMap`, `takeUntil` |
| OnPush | مستخدم في جميع الـ components |
| trackBy | في كل `*ngFor` |
| No memory leaks | `takeUntil(destroy$)` في كل مكان |
