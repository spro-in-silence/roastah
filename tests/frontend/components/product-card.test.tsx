import React from 'react';
import { render, screen, fireEvent, waitFor } from '../../../tests/utils/test-utils';
import ProductCard from '@/components/ProductCard';
import { createTestProduct } from '../../../tests/utils/test-utils';

// Mock the useAuth hook
jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'user-1', email: 'test@example.com' },
    isLoading: false,
    error: null,
  }),
}));

describe('ProductCard', () => {
  const mockProduct = createTestProduct();
  const mockOnAddToCart = jest.fn();
  const mockOnAddToWishlist = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders product information correctly', () => {
    render(
      <ProductCard
        product={mockProduct}
        onAddToCart={mockOnAddToCart}
        onAddToWishlist={mockOnAddToWishlist}
      />
    );

    expect(screen.getByText(mockProduct.name)).toBeInTheDocument();
    expect(screen.getByText(mockProduct.description)).toBeInTheDocument();
    expect(screen.getByText('$24.99')).toBeInTheDocument(); // Price formatted
    expect(screen.getByText('Medium')).toBeInTheDocument(); // Roast level
    expect(screen.getByText('Ethiopia')).toBeInTheDocument(); // Origin
  });

  it('displays product image', () => {
    render(
      <ProductCard
        product={mockProduct}
        onAddToCart={mockOnAddToCart}
        onAddToWishlist={mockOnAddToWishlist}
      />
    );

    const productImage = screen.getByAltText(mockProduct.name);
    expect(productImage).toBeInTheDocument();
    expect(productImage).toHaveAttribute('src', mockProduct.imageUrl);
  });

  it('shows in stock status', () => {
    render(
      <ProductCard
        product={mockProduct}
        onAddToCart={mockOnAddToCart}
        onAddToWishlist={mockOnAddToWishlist}
      />
    );

    expect(screen.getByText('In Stock')).toBeInTheDocument();
  });

  it('shows out of stock status', () => {
    const outOfStockProduct = createTestProduct({ inStock: false });
    
    render(
      <ProductCard
        product={outOfStockProduct}
        onAddToCart={mockOnAddToCart}
        onAddToWishlist={mockOnAddToWishlist}
      />
    );

    expect(screen.getByText('Out of Stock')).toBeInTheDocument();
  });

  it('handles add to cart click', async () => {
    render(
      <ProductCard
        product={mockProduct}
        onAddToCart={mockOnAddToCart}
        onAddToWishlist={mockOnAddToWishlist}
      />
    );

    const addToCartButton = screen.getByRole('button', { name: /add to cart/i });
    fireEvent.click(addToCartButton);

    await waitFor(() => {
      expect(mockOnAddToCart).toHaveBeenCalledWith(mockProduct);
    });
  });

  it('handles add to wishlist click', async () => {
    render(
      <ProductCard
        product={mockProduct}
        onAddToCart={mockOnAddToCart}
        onAddToWishlist={mockOnAddToWishlist}
      />
    );

    const addToWishlistButton = screen.getByRole('button', { name: /add to wishlist/i });
    fireEvent.click(addToWishlistButton);

    await waitFor(() => {
      expect(mockOnAddToWishlist).toHaveBeenCalledWith(mockProduct);
    });
  });

  it('disables add to cart button when out of stock', () => {
    const outOfStockProduct = createTestProduct({ inStock: false });
    
    render(
      <ProductCard
        product={outOfStockProduct}
        onAddToCart={mockOnAddToCart}
        onAddToWishlist={mockOnAddToWishlist}
      />
    );

    const addToCartButton = screen.getByRole('button', { name: /add to cart/i });
    expect(addToCartButton).toBeDisabled();
  });

  it('shows loading state for add to cart', () => {
    render(
      <ProductCard
        product={mockProduct}
        onAddToCart={mockOnAddToCart}
        onAddToWishlist={mockOnAddToWishlist}
        isAddingToCart={true}
      />
    );

    expect(screen.getByText(/adding/i)).toBeInTheDocument();
  });

  it('shows quick view button', () => {
    render(
      <ProductCard
        product={mockProduct}
        onAddToCart={mockOnAddToCart}
        onAddToWishlist={mockOnAddToWishlist}
      />
    );

    const quickViewButton = screen.getByRole('button', { name: /quick view/i });
    expect(quickViewButton).toBeInTheDocument();
  });

  it('handles quick view click', async () => {
    const mockOnQuickView = jest.fn();
    
    render(
      <ProductCard
        product={mockProduct}
        onAddToCart={mockOnAddToCart}
        onAddToWishlist={mockOnAddToWishlist}
        onQuickView={mockOnQuickView}
      />
    );

    const quickViewButton = screen.getByRole('button', { name: /quick view/i });
    fireEvent.click(quickViewButton);

    await waitFor(() => {
      expect(mockOnQuickView).toHaveBeenCalledWith(mockProduct);
    });
  });

  it('shows roaster information', () => {
    const productWithRoaster = createTestProduct({
      roaster: {
        id: 1,
        businessName: 'Test Roasters',
        userId: 'roaster-1',
      },
    });
    
    render(
      <ProductCard
        product={productWithRoaster}
        onAddToCart={mockOnAddToCart}
        onAddToWishlist={mockOnAddToWishlist}
      />
    );

    expect(screen.getByText('Test Roasters')).toBeInTheDocument();
  });

  it('shows product tags', () => {
    const productWithTags = createTestProduct({
      tags: ['organic', 'fair-trade', 'single-origin'],
    });
    
    render(
      <ProductCard
        product={productWithTags}
        onAddToCart={mockOnAddToCart}
        onAddToWishlist={mockOnAddToWishlist}
      />
    );

    expect(screen.getByText('organic')).toBeInTheDocument();
    expect(screen.getByText('fair-trade')).toBeInTheDocument();
    expect(screen.getByText('single-origin')).toBeInTheDocument();
  });

  it('shows sale price when product is on sale', () => {
    const saleProduct = createTestProduct({
      price: 2499,
      salePrice: 1999,
    });
    
    render(
      <ProductCard
        product={saleProduct}
        onAddToCart={mockOnAddToCart}
        onAddToWishlist={mockOnAddToWishlist}
      />
    );

    expect(screen.getByText('$19.99')).toBeInTheDocument(); // Sale price
    expect(screen.getByText('$24.99')).toBeInTheDocument(); // Original price (crossed out)
  });

  it('shows average rating', () => {
    const productWithRating = createTestProduct({
      averageRating: 4.5,
      reviewCount: 23,
    });
    
    render(
      <ProductCard
        product={productWithRating}
        onAddToCart={mockOnAddToCart}
        onAddToWishlist={mockOnAddToWishlist}
      />
    );

    expect(screen.getByText('4.5')).toBeInTheDocument();
    expect(screen.getByText('(23 reviews)')).toBeInTheDocument();
  });

  it('handles card click for navigation', async () => {
    const mockOnCardClick = jest.fn();
    
    render(
      <ProductCard
        product={mockProduct}
        onAddToCart={mockOnAddToCart}
        onAddToWishlist={mockOnAddToWishlist}
        onCardClick={mockOnCardClick}
      />
    );

    const card = screen.getByRole('article');
    fireEvent.click(card);

    await waitFor(() => {
      expect(mockOnCardClick).toHaveBeenCalledWith(mockProduct);
    });
  });

  it('shows new product badge', () => {
    const newProduct = createTestProduct({
      createdAt: new Date().toISOString(), // Very recent
    });
    
    render(
      <ProductCard
        product={newProduct}
        onAddToCart={mockOnAddToCart}
        onAddToWishlist={mockOnAddToWishlist}
      />
    );

    expect(screen.getByText('New')).toBeInTheDocument();
  });

  it('shows limited stock warning', () => {
    const lowStockProduct = createTestProduct({
      stockQuantity: 3,
    });
    
    render(
      <ProductCard
        product={lowStockProduct}
        onAddToCart={mockOnAddToCart}
        onAddToWishlist={mockOnAddToWishlist}
      />
    );

    expect(screen.getByText('Only 3 left!')).toBeInTheDocument();
  });
});