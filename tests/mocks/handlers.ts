import { http, HttpResponse } from 'msw';

export const handlers = [
  // Auth endpoints
  http.get('/api/auth/user', () => {
    return HttpResponse.json({
      id: 'test-user-001',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'user',
      isRoasterApproved: false,
      mfaEnabled: false,
    });
  }),

  http.post('/api/auth/login', () => {
    return HttpResponse.json({
      success: true,
      user: {
        id: 'test-user-001',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'user',
      },
    });
  }),

  http.post('/api/auth/logout', () => {
    return HttpResponse.json({ success: true });
  }),

  // Products endpoints
  http.get('/api/products', () => {
    return HttpResponse.json([
      {
        id: 1,
        name: 'Ethiopian Single Origin',
        description: 'Bright and fruity coffee from Ethiopia',
        price: 2499,
        roastLevel: 'medium',
        origin: 'Ethiopia',
        inStock: true,
        roasterId: 1,
        imageUrl: 'https://example.com/coffee.jpg',
        createdAt: new Date().toISOString(),
      },
    ]);
  }),

  // Cart endpoints
  http.get('/api/cart', () => {
    return HttpResponse.json([]);
  }),

  http.post('/api/cart', () => {
    return HttpResponse.json({ success: true });
  }),

  // Orders endpoints
  http.get('/api/orders', () => {
    return HttpResponse.json([]);
  }),

  // Roaster endpoints
  http.get('/api/roasters', () => {
    return HttpResponse.json([
      {
        id: 1,
        userId: 'roaster-001',
        businessName: 'Test Roasters',
        description: 'Premium coffee roasting',
        businessType: 'commercial',
        isApproved: true,
      },
    ]);
  }),

  // Development endpoints
  http.get('/api/dev/validate-impersonation', () => {
    return HttpResponse.json({
      environment: {
        isLocal: true,
        isReplit: false,
        isCloudRunDev: false,
        isDev: true,
      },
      buyer: {
        id: 'dev-buyer-001',
        role: 'user',
        isRoasterApproved: false,
      },
      seller: {
        id: 'dev-seller-001',
        role: 'roaster',
        isRoasterApproved: true,
        hasRoasterProfile: true,
      },
      session: { hasSession: true },
    });
  }),

  http.post('/api/dev/impersonate', () => {
    return HttpResponse.json({ success: true });
  }),
];