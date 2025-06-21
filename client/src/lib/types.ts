export interface Product {
  id: number;
  roasterId: number;
  name: string;
  description: string;
  price: string;
  stockQuantity: number;
  origin: string;
  roastLevel: string;
  process: string;
  altitude: string;
  varietal: string;
  tastingNotes: string;
  images: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: number;
  userId: string;
  productId: number;
  quantity: number;
  grindSize: string;
  createdAt: string;
  product?: Product;
}

export interface Address {
  firstName: string;
  lastName: string;
  email: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface User {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  role?: string;
  mfaEnabled?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  clientSecret?: string;
}
