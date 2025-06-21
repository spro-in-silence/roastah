import {
  users,
  roasters,
  products,
  cartItems,
  orders,
  orderItems,
  type User,
  type UpsertUser,
  type Roaster,
  type InsertRoaster,
  type Product,
  type InsertProduct,
  type CartItem,
  type InsertCartItem,
  type Order,
  type InsertOrder,
  type OrderItem,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Roaster operations
  createRoaster(roaster: InsertRoaster): Promise<Roaster>;
  getRoasterByUserId(userId: string): Promise<Roaster | undefined>;
  updateRoasterStatus(userId: string, isApproved: boolean): Promise<void>;
  
  // Product operations
  createProduct(product: InsertProduct): Promise<Product>;
  getProducts(filters?: { roastLevel?: string; origin?: string; minPrice?: number; maxPrice?: number }): Promise<Product[]>;
  getProductById(id: number): Promise<Product | undefined>;
  getProductsByRoaster(roasterId: number): Promise<Product[]>;
  updateProduct(id: number, updates: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: number): Promise<void>;
  
  // Cart operations
  addToCart(cartItem: InsertCartItem): Promise<CartItem>;
  getCartByUserId(userId: string): Promise<CartItem[]>;
  updateCartItem(id: number, quantity: number): Promise<CartItem>;
  removeFromCart(id: number): Promise<void>;
  clearCart(userId: string): Promise<void>;
  
  // Order operations
  createOrder(order: InsertOrder): Promise<Order>;
  getOrderById(id: number): Promise<Order | undefined>;
  getOrdersByUserId(userId: string): Promise<Order[]>;
  getOrderItemsByRoaster(roasterId: number): Promise<OrderItem[]>;
  updateOrderStatus(id: number, status: string): Promise<void>;
  updateOrderItemStatus(id: number, status: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Roaster operations
  async createRoaster(roaster: InsertRoaster): Promise<Roaster> {
    const [newRoaster] = await db.insert(roasters).values(roaster).returning();
    
    // Update user role to roaster
    await db
      .update(users)
      .set({ role: "roaster", isRoasterApproved: true })
      .where(eq(users.id, roaster.userId));
    
    return newRoaster;
  }

  async getRoasterByUserId(userId: string): Promise<Roaster | undefined> {
    const [roaster] = await db
      .select()
      .from(roasters)
      .where(eq(roasters.userId, userId));
    return roaster;
  }

  async updateRoasterStatus(userId: string, isApproved: boolean): Promise<void> {
    await db
      .update(users)
      .set({ isRoasterApproved: isApproved })
      .where(eq(users.id, userId));
  }

  // Product operations
  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async getProducts(filters?: { roastLevel?: string; origin?: string; minPrice?: number; maxPrice?: number }): Promise<Product[]> {
    const conditions = [eq(products.isActive, true)];
    
    if (filters) {
      if (filters.roastLevel) {
        conditions.push(eq(products.roastLevel, filters.roastLevel));
      }
      if (filters.origin) {
        conditions.push(eq(products.origin, filters.origin));
      }
      if (filters.minPrice) {
        conditions.push(sql`${products.price} >= ${filters.minPrice}`);
      }
      if (filters.maxPrice) {
        conditions.push(sql`${products.price} <= ${filters.maxPrice}`);
      }
    }
    
    return await db.select().from(products).where(and(...conditions));
  }

  async getProductById(id: number): Promise<Product | undefined> {
    const [product] = await db
      .select()
      .from(products)
      .where(and(eq(products.id, id), eq(products.isActive, true)));
    return product;
  }

  async getProductsByRoaster(roasterId: number): Promise<Product[]> {
    return await db
      .select()
      .from(products)
      .where(eq(products.roasterId, roasterId));
  }

  async updateProduct(id: number, updates: Partial<InsertProduct>): Promise<Product> {
    const [updated] = await db
      .update(products)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return updated;
  }

  async deleteProduct(id: number): Promise<void> {
    await db
      .update(products)
      .set({ isActive: false })
      .where(eq(products.id, id));
  }

  // Cart operations
  async addToCart(cartItem: InsertCartItem): Promise<CartItem> {
    // Check if item already exists
    const [existing] = await db
      .select()
      .from(cartItems)
      .where(
        and(
          eq(cartItems.userId, cartItem.userId),
          eq(cartItems.productId, cartItem.productId),
          eq(cartItems.grindSize, cartItem.grindSize || "whole_bean")
        )
      );

    if (existing) {
      // Update quantity
      const [updated] = await db
        .update(cartItems)
        .set({ quantity: existing.quantity + (cartItem.quantity || 1) })
        .where(eq(cartItems.id, existing.id))
        .returning();
      return updated;
    } else {
      // Insert new item
      const [newItem] = await db.insert(cartItems).values(cartItem).returning();
      return newItem;
    }
  }

  async getCartByUserId(userId: string): Promise<CartItem[]> {
    return await db.select().from(cartItems).where(eq(cartItems.userId, userId));
  }

  async updateCartItem(id: number, quantity: number): Promise<CartItem> {
    const [updated] = await db
      .update(cartItems)
      .set({ quantity })
      .where(eq(cartItems.id, id))
      .returning();
    return updated;
  }

  async removeFromCart(id: number): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.id, id));
  }

  async clearCart(userId: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.userId, userId));
  }

  // Order operations
  async createOrder(order: InsertOrder): Promise<Order> {
    const [newOrder] = await db.insert(orders).values(order).returning();
    return newOrder;
  }

  async getOrderById(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async getOrdersByUserId(userId: string): Promise<Order[]> {
    return await db
      .select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(sql`${orders.createdAt} DESC`);
  }

  async getOrderItemsByRoaster(roasterId: number): Promise<OrderItem[]> {
    return await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.roasterId, roasterId))
      .orderBy(sql`${orderItems.createdAt} DESC`);
  }

  async updateOrderStatus(id: number, status: string): Promise<void> {
    await db
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, id));
  }

  async updateOrderItemStatus(id: number, status: string): Promise<void> {
    await db
      .update(orderItems)
      .set({ status })
      .where(eq(orderItems.id, id));
  }
}

export const storage = new DatabaseStorage();
