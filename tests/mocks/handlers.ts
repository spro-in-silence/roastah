import { http, HttpResponse } from 'msw';

export const handlers = [
  // Auth endpoints
  http.post('/api/auth/login', async ({ request }) => {
    const body = await request.json();
    const { email, password } = body as { email: string; password: string };
    
    if (!email || !password) {
      return HttpResponse.json({ message: 'Missing email or password' }, { status: 400 });
    }
    
    if (email === 'buyer@test.com' && password === 'testpassword123') {
      return HttpResponse.json({
        user: {
          id: 'test-buyer-001',
          email: 'buyer@test.com',
          firstName: 'Test',
          lastName: 'Buyer',
          role: 'user'
        }
      });
    }
    
    return HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 });
  }),

  http.post('/api/auth/register', async ({ request }) => {
    const body = await request.json();
    const { email, password, firstName, lastName } = body as { 
      email: string; 
      password: string; 
      firstName: string; 
      lastName: string; 
    };
    
    if (!email || !password || !firstName || !lastName) {
      return HttpResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }
    
    if (email === 'buyer@test.com') {
      return HttpResponse.json({ message: 'Email already exists' }, { status: 400 });
    }
    
    return HttpResponse.json({
      user: {
        id: 'test-new-user',
        email,
        firstName,
        lastName,
        role: 'user'
      }
    }, { status: 201 });
  }),

  http.post('/api/auth/logout', () => {
    return HttpResponse.json({ message: 'Logged out successfully' });
  }),

  // Products endpoints
  http.get('/api/products', () => {
    return HttpResponse.json([
      {
        id: 'test-product-001',
        name: 'Test Ethiopian Coffee',
        description: 'Test coffee from Ethiopia',
        price: 2499,
        roastLevel: 'medium',
        origin: 'Ethiopia',
        inStock: true,
        imageUrl: 'https://example.com/coffee1.jpg'
      }
    ]);
  }),

  http.post('/api/products', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      id: 'test-product-new',
      ...body
    }, { status: 201 });
  }),

  // Cart endpoints
  http.get('/api/cart', () => {
    return HttpResponse.json([]);
  }),

  http.post('/api/cart', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      id: 'test-cart-item',
      ...body
    }, { status: 201 });
  }),

  // Orders endpoints
  http.get('/api/orders', () => {
    return HttpResponse.json([]);
  }),

  http.post('/api/orders', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      id: 'test-order-001',
      ...body
    }, { status: 201 });
  }),

  // Default handler for unhandled requests
  http.all('*', ({ request }) => {
    console.warn(`Unhandled ${request.method} request to ${request.url}`);
    return HttpResponse.json({ message: 'Not found' }, { status: 404 });
  })
];