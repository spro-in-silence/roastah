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
  address: string;
  city: string;
  state: string;
  zipCode: string;
}
