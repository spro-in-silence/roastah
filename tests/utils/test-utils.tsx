import React, { PropsWithChildren, ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Router } from 'wouter';
import { UserProvider } from '@/contexts/UserContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { Toaster } from '@/components/ui/toaster';

// Mock implementations for contexts
const mockUserContext = {
  user: null,
  isLoading: false,
  error: null,
  login: jest.fn(),
  logout: jest.fn(),
  refreshUser: jest.fn(),
};

const mockThemeContext = {
  theme: 'light' as const,
  setTheme: jest.fn(),
};

// Custom render function with all providers
function customRender(
  ui: ReactElement,
  {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    }),
    ...renderOptions
  }: RenderOptions & { queryClient?: QueryClient } = {}
) {
  function Wrapper({ children }: PropsWithChildren) {
    return (
      <QueryClientProvider client={queryClient}>
        <Router base="/test">
          <ThemeProvider>
            <UserProvider>
              {children}
              <Toaster />
            </UserProvider>
          </ThemeProvider>
        </Router>
      </QueryClientProvider>
    );
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

// Test data factories
export const createTestUser = (overrides = {}) => ({
  id: 'test-user-001',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  role: 'user',
  isRoasterApproved: false,
  mfaEnabled: false,
  createdAt: new Date().toISOString(),
  ...overrides,
});

export const createTestRoaster = (overrides = {}) => ({
  id: 1,
  userId: 'roaster-001',
  businessName: 'Test Roasters',
  description: 'Premium coffee roasting',
  businessType: 'commercial',
  isApproved: true,
  createdAt: new Date().toISOString(),
  ...overrides,
});

export const createTestProduct = (overrides = {}) => ({
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
  ...overrides,
});

export const createTestOrder = (overrides = {}) => ({
  id: 1,
  userId: 'test-user-001',
  status: 'pending',
  total: 2499,
  items: [
    {
      id: 1,
      productId: 1,
      quantity: 1,
      price: 2499,
      grindSize: 'medium',
    },
  ],
  createdAt: new Date().toISOString(),
  ...overrides,
});

export const createTestCartItem = (overrides = {}) => ({
  id: 1,
  userId: 'test-user-001',
  productId: 1,
  quantity: 1,
  grindSize: 'medium',
  createdAt: new Date().toISOString(),
  ...overrides,
});

// Helper functions for testing
export const waitForLoadingToFinish = () => {
  return new Promise(resolve => setTimeout(resolve, 100));
};

export const mockApiCall = (url: string, response: any, status = 200) => {
  return jest.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(response),
  });
};

export const mockApiError = (url: string, error: string, status = 500) => {
  return jest.fn().mockRejectedValue({
    ok: false,
    status,
    message: error,
  });
};

// Re-export everything
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
export { customRender as render };
export { mockUserContext, mockThemeContext };