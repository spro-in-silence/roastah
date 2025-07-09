import React from 'react';
import { render, screen, fireEvent, waitFor } from '../../../tests/utils/test-utils';
import SellerDashboard from '@/pages/seller-dashboard';
import { createTestProduct, createTestOrder } from '../../../tests/utils/test-utils';

// Mock hooks
jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: {
      id: 'seller-1',
      email: 'seller@test.com',
      role: 'roaster',
      isRoasterApproved: true,
    },
    isLoading: false,
    error: null,
  }),
}));

jest.mock('@/hooks/useSellerData', () => ({
  useSellerData: () => ({
    products: [
      createTestProduct({ id: 1, name: 'Ethiopian Coffee' }),
      createTestProduct({ id: 2, name: 'Colombian Coffee' }),
    ],
    orders: [
      createTestOrder({ id: 1, status: 'pending' }),
    ],
    analytics: {
      totalRevenue: 15000,
      totalOrders: 25,
      totalProducts: 2,
      conversionRate: 3.5,
    },
    isLoading: false,
    error: null,
  }),
}));

describe('SellerDashboard', () => {
  it('renders dashboard overview', () => {
    render(<SellerDashboard />);

    expect(screen.getByText('Seller Dashboard')).toBeInTheDocument();
    expect(screen.getByText('$150.00')).toBeInTheDocument(); // Total revenue
    expect(screen.getByText('25')).toBeInTheDocument(); // Total orders
    expect(screen.getByText('2')).toBeInTheDocument(); // Total products
    expect(screen.getByText('3.5%')).toBeInTheDocument(); // Conversion rate
  });

  it('shows recent orders', () => {
    render(<SellerDashboard />);

    expect(screen.getByText('Recent Orders')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  it('shows product list', () => {
    render(<SellerDashboard />);

    expect(screen.getByText('Your Products')).toBeInTheDocument();
    expect(screen.getByText('Ethiopian Coffee')).toBeInTheDocument();
    expect(screen.getByText('Colombian Coffee')).toBeInTheDocument();
  });

  it('has add product button', () => {
    render(<SellerDashboard />);

    expect(screen.getByRole('button', { name: /add product/i })).toBeInTheDocument();
  });

  it('handles add product click', async () => {
    const mockNavigate = jest.fn();
    
    jest.doMock('wouter', () => ({
      useLocation: () => ['/seller/dashboard', mockNavigate],
    }));

    render(<SellerDashboard />);

    const addProductButton = screen.getByRole('button', { name: /add product/i });
    fireEvent.click(addProductButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/seller/products/new');
    });
  });

  it('shows loading state', () => {
    jest.doMock('@/hooks/useSellerData', () => ({
      useSellerData: () => ({
        products: [],
        orders: [],
        analytics: null,
        isLoading: true,
        error: null,
      }),
    }));

    render(<SellerDashboard />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows error state', () => {
    jest.doMock('@/hooks/useSellerData', () => ({
      useSellerData: () => ({
        products: [],
        orders: [],
        analytics: null,
        isLoading: false,
        error: new Error('Failed to load data'),
      }),
    }));

    render(<SellerDashboard />);

    expect(screen.getByText('Failed to load data')).toBeInTheDocument();
  });

  it('shows analytics charts', () => {
    render(<SellerDashboard />);

    expect(screen.getByText('Sales Analytics')).toBeInTheDocument();
    // Would check for chart components if they exist
  });

  it('has navigation tabs', () => {
    render(<SellerDashboard />);

    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Products')).toBeInTheDocument();
    expect(screen.getByText('Orders')).toBeInTheDocument();
    expect(screen.getByText('Analytics')).toBeInTheDocument();
  });

  it('handles tab navigation', async () => {
    render(<SellerDashboard />);

    const productsTab = screen.getByText('Products');
    fireEvent.click(productsTab);

    await waitFor(() => {
      expect(screen.getByText('Manage Products')).toBeInTheDocument();
    });
  });

  it('shows order status badges', () => {
    render(<SellerDashboard />);

    expect(screen.getByText('Pending')).toHaveClass('badge-warning');
  });

  it('shows product status', () => {
    render(<SellerDashboard />);

    expect(screen.getByText('Published')).toBeInTheDocument();
  });

  it('has quick actions', () => {
    render(<SellerDashboard />);

    expect(screen.getByRole('button', { name: /view all orders/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /manage products/i })).toBeInTheDocument();
  });

  it('shows commission information', () => {
    render(<SellerDashboard />);

    expect(screen.getByText('Commission Rate')).toBeInTheDocument();
    expect(screen.getByText('5%')).toBeInTheDocument(); // Default commission
  });

  it('shows payout information', () => {
    render(<SellerDashboard />);

    expect(screen.getByText('Next Payout')).toBeInTheDocument();
    expect(screen.getByText('$142.50')).toBeInTheDocument(); // After commission
  });

  it('handles order status updates', async () => {
    const mockUpdateOrderStatus = jest.fn();
    
    jest.doMock('@/hooks/useSellerData', () => ({
      useSellerData: () => ({
        products: [],
        orders: [
          createTestOrder({ id: 1, status: 'pending' }),
        ],
        analytics: null,
        isLoading: false,
        error: null,
        updateOrderStatus: mockUpdateOrderStatus,
      }),
    }));

    render(<SellerDashboard />);

    const statusSelect = screen.getByRole('combobox');
    fireEvent.change(statusSelect, { target: { value: 'processing' } });

    await waitFor(() => {
      expect(mockUpdateOrderStatus).toHaveBeenCalledWith(1, 'processing');
    });
  });

  it('shows notification badge for new orders', () => {
    jest.doMock('@/hooks/useSellerData', () => ({
      useSellerData: () => ({
        products: [],
        orders: [
          createTestOrder({ id: 1, status: 'pending', isNew: true }),
        ],
        analytics: null,
        isLoading: false,
        error: null,
        newOrderCount: 1,
      }),
    }));

    render(<SellerDashboard />);

    expect(screen.getByText('1')).toHaveClass('notification-badge');
  });

  it('shows inventory alerts', () => {
    jest.doMock('@/hooks/useSellerData', () => ({
      useSellerData: () => ({
        products: [
          createTestProduct({ id: 1, stockQuantity: 2 }),
        ],
        orders: [],
        analytics: null,
        isLoading: false,
        error: null,
        lowStockCount: 1,
      }),
    }));

    render(<SellerDashboard />);

    expect(screen.getByText('Low Stock Alert')).toBeInTheDocument();
    expect(screen.getByText('1 product')).toBeInTheDocument();
  });
});