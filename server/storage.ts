import {
  users,
  roasters,
  products,
  cartItems,
  orders,
  orderItems,
  reviews,
  wishlist,
  notifications,
  orderTracking,
  realtimeConnections,
  commissions,
  sellerAnalytics,
  campaigns,
  bulkUploads,
  disputes,
  favoriteRoasters,
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
  type Review,
  type InsertReview,
  type WishlistItem,
  type InsertWishlistItem,
  type Notification,
  type InsertNotification,
  type OrderTracking,
  type InsertOrderTracking,
  type RealtimeConnection,
  type InsertRealtimeConnection,
  type Commission,
  type InsertCommission,
  type SellerAnalytics,
  type InsertSellerAnalytics,
  type Campaign,
  type InsertCampaign,
  type BulkUpload,
  type InsertBulkUpload,
  type Dispute,
  type InsertDispute,
  type FavoriteRoaster,
  type InsertFavoriteRoaster,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, sql, desc } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserMFA(id: string, mfaData: { mfaEnabled?: boolean; mfaSecret?: string; backupCodes?: string[]; lastBackupCodeUsed?: Date }): Promise<User>;
  
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
  
  // Review operations
  createReview(review: InsertReview): Promise<Review>;
  getReviewsByProductId(productId: number): Promise<Review[]>;
  updateReviewHelpful(id: number): Promise<void>;
  
  // Wishlist operations
  addToWishlist(item: InsertWishlistItem): Promise<WishlistItem>;
  getWishlistByUserId(userId: string): Promise<WishlistItem[]>;
  removeFromWishlist(userId: string, productId: number): Promise<void>;
  
  // Notification operations
  createNotification(notification: InsertNotification): Promise<Notification>;
  getNotificationsByUserId(userId: string): Promise<Notification[]>;
  markNotificationAsRead(id: number): Promise<void>;
  markAllNotificationsAsRead(userId: string): Promise<void>;
  deleteNotification(id: number): Promise<void>;
  
  // Commission operations
  createCommission(commission: InsertCommission): Promise<Commission>;
  getCommissionsByRoaster(roasterId: number): Promise<Commission[]>;
  updateCommissionStatus(id: number, status: string, paidAt?: Date): Promise<void>;
  
  // Seller analytics operations
  createSellerAnalytics(analytics: InsertSellerAnalytics): Promise<SellerAnalytics>;
  getSellerAnalyticsByRoaster(roasterId: number, startDate?: Date, endDate?: Date): Promise<SellerAnalytics[]>;
  updateSellerAnalytics(roasterId: number, date: Date, updates: Partial<InsertSellerAnalytics>): Promise<void>;
  
  // Campaign operations
  createCampaign(campaign: InsertCampaign): Promise<Campaign>;
  getCampaignsByRoaster(roasterId: number): Promise<Campaign[]>;
  updateCampaign(id: number, updates: Partial<InsertCampaign>): Promise<Campaign>;
  deleteCampaign(id: number): Promise<void>;
  incrementCampaignUsage(id: number): Promise<void>;
  
  // Bulk upload operations
  createBulkUpload(upload: InsertBulkUpload): Promise<BulkUpload>;
  getBulkUploadsByRoaster(roasterId: number): Promise<BulkUpload[]>;
  updateBulkUploadStatus(id: number, status: string, updates?: Partial<InsertBulkUpload>): Promise<void>;
  
  // Dispute operations
  createDispute(dispute: InsertDispute): Promise<Dispute>;
  getDisputesByRoaster(roasterId: number): Promise<Dispute[]>;
  getDisputesByCustomer(customerId: string): Promise<Dispute[]>;
  updateDisputeStatus(id: number, status: string, resolution?: string): Promise<void>;
  
  // Real-time tracking operations
  createOrderTracking(tracking: InsertOrderTracking): Promise<OrderTracking>;
  getOrderTracking(orderId: number): Promise<OrderTracking[]>;
  updateOrderTracking(id: number, updates: Partial<InsertOrderTracking>): Promise<OrderTracking>;
  
  // Real-time connection operations
  createRealtimeConnection(connection: InsertRealtimeConnection): Promise<RealtimeConnection>;
  getRealtimeConnectionsByUser(userId: string): Promise<RealtimeConnection[]>;
  updateRealtimeConnection(id: number, updates: Partial<InsertRealtimeConnection>): Promise<void>;
  removeRealtimeConnection(connectionId: string): Promise<void>;
  
  // Enhanced order operations for real-time features
  getRoasterById(id: number): Promise<Roaster | undefined>;
  getOrderItemsByOrder(orderId: number): Promise<OrderItem[]>;
  
  // Leaderboard operations
  getLeaderboard(dateRange?: string, limit?: number): Promise<any[]>;
  updateRoasterMetrics(roasterId: number): Promise<void>;
  calculateLeaderboardScore(roasterId: number): Promise<number>;
  
  // Favorite roasters operations
  addFavoriteRoaster(userId: string, roasterId: number): Promise<FavoriteRoaster>;
  removeFavoriteRoaster(userId: string, roasterId: number): Promise<void>;
  getFavoriteRoastersByUser(userId: string): Promise<any[]>;
  isFavoriteRoaster(userId: string, roasterId: number): Promise<boolean>;
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

  async updateUserMFA(id: string, mfaData: { mfaEnabled?: boolean; mfaSecret?: string; backupCodes?: string[]; lastBackupCodeUsed?: Date }): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        ...mfaData,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
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

  // Review operations
  async createReview(review: InsertReview): Promise<Review> {
    const [newReview] = await db
      .insert(reviews)
      .values(review)
      .returning();
    return newReview;
  }

  async getReviewsByProductId(productId: number): Promise<Review[]> {
    return await db
      .select({
        id: reviews.id,
        userId: reviews.userId,
        productId: reviews.productId,
        rating: reviews.rating,
        title: reviews.title,
        content: reviews.content,
        verifiedPurchase: reviews.verifiedPurchase,
        helpfulVotes: reviews.helpfulVotes,
        createdAt: reviews.createdAt,
        user: {
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
        },
      })
      .from(reviews)
      .leftJoin(users, eq(reviews.userId, users.id))
      .where(eq(reviews.productId, productId))
      .orderBy(desc(reviews.createdAt));
  }

  async updateReviewHelpful(id: number): Promise<void> {
    await db
      .update(reviews)
      .set({ helpfulVotes: sql`${reviews.helpfulVotes} + 1` })
      .where(eq(reviews.id, id));
  }

  // Wishlist operations
  async addToWishlist(item: InsertWishlistItem): Promise<WishlistItem> {
    const [newItem] = await db
      .insert(wishlist)
      .values(item)
      .returning();
    return newItem;
  }

  async getWishlistByUserId(userId: string): Promise<WishlistItem[]> {
    return await db
      .select({
        id: wishlist.id,
        userId: wishlist.userId,
        productId: wishlist.productId,
        createdAt: wishlist.createdAt,
        product: {
          id: products.id,
          name: products.name,
          price: products.price,
          images: products.images,
          roastLevel: products.roastLevel,
          origin: products.origin,
        },
      })
      .from(wishlist)
      .leftJoin(products, eq(wishlist.productId, products.id))
      .where(eq(wishlist.userId, userId))
      .orderBy(desc(wishlist.createdAt));
  }

  async removeFromWishlist(userId: string, productId: number): Promise<void> {
    await db
      .delete(wishlist)
      .where(and(eq(wishlist.userId, userId), eq(wishlist.productId, productId)));
  }

  // Notification operations
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db
      .insert(notifications)
      .values(notification)
      .returning();
    return newNotification;
  }

  async getNotificationsByUserId(userId: string): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async markNotificationAsRead(id: number): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id));
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.userId, userId));
  }

  async deleteNotification(id: number): Promise<void> {
    await db
      .delete(notifications)
      .where(eq(notifications.id, id));
  }

  // Commission operations
  async createCommission(commission: InsertCommission): Promise<Commission> {
    const [newCommission] = await db
      .insert(commissions)
      .values(commission)
      .returning();
    return newCommission;
  }

  async getCommissionsByRoaster(roasterId: number): Promise<Commission[]> {
    return await db
      .select()
      .from(commissions)
      .where(eq(commissions.roasterId, roasterId))
      .orderBy(sql`${commissions.createdAt} desc`);
  }

  async updateCommissionStatus(id: number, status: string, paidAt?: Date): Promise<void> {
    await db
      .update(commissions)
      .set({ status, paidAt })
      .where(eq(commissions.id, id));
  }

  // Seller analytics operations
  async createSellerAnalytics(analytics: InsertSellerAnalytics): Promise<SellerAnalytics> {
    const [newAnalytics] = await db
      .insert(sellerAnalytics)
      .values(analytics)
      .returning();
    return newAnalytics;
  }

  async getSellerAnalyticsByRoaster(roasterId: number, startDate?: Date, endDate?: Date): Promise<SellerAnalytics[]> {
    if (startDate && endDate) {
      return await db
        .select()
        .from(sellerAnalytics)
        .where(
          and(
            eq(sellerAnalytics.roasterId, roasterId),
            sql`${sellerAnalytics.date} >= ${startDate.toISOString().split('T')[0]}`,
            sql`${sellerAnalytics.date} <= ${endDate.toISOString().split('T')[0]}`
          )
        )
        .orderBy(sql`${sellerAnalytics.date} desc`);
    }

    return await db
      .select()
      .from(sellerAnalytics)
      .where(eq(sellerAnalytics.roasterId, roasterId))
      .orderBy(sql`${sellerAnalytics.date} desc`);
  }

  async updateSellerAnalytics(roasterId: number, date: Date, updates: Partial<InsertSellerAnalytics>): Promise<void> {
    await db
      .update(sellerAnalytics)
      .set(updates)
      .where(
        and(
          eq(sellerAnalytics.roasterId, roasterId),
          sql`${sellerAnalytics.date} = ${date.toISOString().split('T')[0]}`
        )
      );
  }

  // Campaign operations
  async createCampaign(campaign: InsertCampaign): Promise<Campaign> {
    const [newCampaign] = await db
      .insert(campaigns)
      .values(campaign)
      .returning();
    return newCampaign;
  }

  async getCampaignsByRoaster(roasterId: number): Promise<Campaign[]> {
    return await db
      .select()
      .from(campaigns)
      .where(eq(campaigns.roasterId, roasterId))
      .orderBy(sql`${campaigns.createdAt} desc`);
  }

  async updateCampaign(id: number, updates: Partial<InsertCampaign>): Promise<Campaign> {
    const [updatedCampaign] = await db
      .update(campaigns)
      .set(updates)
      .where(eq(campaigns.id, id))
      .returning();
    return updatedCampaign;
  }

  async deleteCampaign(id: number): Promise<void> {
    await db.delete(campaigns).where(eq(campaigns.id, id));
  }

  async incrementCampaignUsage(id: number): Promise<void> {
    await db
      .update(campaigns)
      .set({ usedCount: sql`${campaigns.usedCount} + 1` })
      .where(eq(campaigns.id, id));
  }

  // Bulk upload operations
  async createBulkUpload(upload: InsertBulkUpload): Promise<BulkUpload> {
    const [newUpload] = await db
      .insert(bulkUploads)
      .values(upload)
      .returning();
    return newUpload;
  }

  async getBulkUploadsByRoaster(roasterId: number): Promise<BulkUpload[]> {
    return await db
      .select()
      .from(bulkUploads)
      .where(eq(bulkUploads.roasterId, roasterId))
      .orderBy(sql`${bulkUploads.createdAt} desc`);
  }

  async updateBulkUploadStatus(id: number, status: string, updates?: Partial<InsertBulkUpload>): Promise<void> {
    const updateData: any = { status, ...updates };
    if (status === 'completed' || status === 'failed') {
      updateData.completedAt = new Date();
    }
    
    await db
      .update(bulkUploads)
      .set(updateData)
      .where(eq(bulkUploads.id, id));
  }

  // Dispute operations
  async createDispute(dispute: InsertDispute): Promise<Dispute> {
    const [newDispute] = await db
      .insert(disputes)
      .values(dispute)
      .returning();
    return newDispute;
  }

  async getDisputesByRoaster(roasterId: number): Promise<Dispute[]> {
    return await db
      .select()
      .from(disputes)
      .where(eq(disputes.roasterId, roasterId))
      .orderBy(sql`${disputes.createdAt} desc`);
  }

  async getDisputesByCustomer(customerId: string): Promise<Dispute[]> {
    return await db
      .select()
      .from(disputes)
      .where(eq(disputes.customerId, customerId))
      .orderBy(sql`${disputes.createdAt} desc`);
  }

  async updateDisputeStatus(id: number, status: string, resolution?: string): Promise<void> {
    const updateData: any = { status };
    if (resolution) {
      updateData.resolution = resolution;
    }
    if (status === 'resolved' || status === 'closed') {
      updateData.resolvedAt = new Date();
    }
    
    await db
      .update(disputes)
      .set(updateData)
      .where(eq(disputes.id, id));
  }

  // Real-time tracking operations
  async createOrderTracking(tracking: InsertOrderTracking): Promise<OrderTracking> {
    const [result] = await db
      .insert(orderTracking)
      .values(tracking)
      .returning();
    return result;
  }

  async getOrderTracking(orderId: number): Promise<OrderTracking[]> {
    return await db
      .select()
      .from(orderTracking)
      .where(eq(orderTracking.orderId, orderId))
      .orderBy(desc(orderTracking.createdAt));
  }

  async updateOrderTracking(id: number, updates: Partial<InsertOrderTracking>): Promise<OrderTracking> {
    const [result] = await db
      .update(orderTracking)
      .set(updates)
      .where(eq(orderTracking.id, id))
      .returning();
    return result;
  }

  // Real-time connection operations
  async createRealtimeConnection(connection: InsertRealtimeConnection): Promise<RealtimeConnection> {
    const [result] = await db
      .insert(realtimeConnections)
      .values(connection)
      .returning();
    return result;
  }

  async getRealtimeConnectionsByUser(userId: string): Promise<RealtimeConnection[]> {
    return await db
      .select()
      .from(realtimeConnections)
      .where(eq(realtimeConnections.userId, userId))
      .orderBy(desc(realtimeConnections.createdAt));
  }

  async updateRealtimeConnection(id: number, updates: Partial<InsertRealtimeConnection>): Promise<void> {
    await db
      .update(realtimeConnections)
      .set(updates)
      .where(eq(realtimeConnections.id, id));
  }

  async removeRealtimeConnection(connectionId: string): Promise<void> {
    await db
      .delete(realtimeConnections)
      .where(eq(realtimeConnections.connectionId, connectionId));
  }

  // Enhanced order operations for real-time features
  async getRoasterById(id: number): Promise<Roaster | undefined> {
    const [roaster] = await db.select().from(roasters).where(eq(roasters.id, id));
    return roaster;
  }

  async getOrderItemsByOrder(orderId: number): Promise<OrderItem[]> {
    return await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, orderId));
  }

  // Leaderboard operations
  async getLeaderboard(dateRange?: string, limit: number = 10): Promise<any[]> {
    const now = new Date();
    let startDate: Date;

    // Calculate date range
    switch (dateRange) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        break;
      case 'quarter':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        break;
      case '6m':
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
        break;
      case 'year':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
      case '3year':
        startDate = new Date(now.getFullYear() - 3, now.getMonth(), now.getDate());
        break;
      case '5year':
        startDate = new Date(now.getFullYear() - 5, now.getMonth(), now.getDate());
        break;
      default: // 'all'
        startDate = new Date(2020, 0, 1);
    }

    // Get leaderboard with comprehensive metrics
    const result = await db
      .select({
        id: roasters.id,
        userId: roasters.userId,
        businessName: roasters.businessName,
        description: roasters.description,
        city: roasters.city,
        state: roasters.state,
        createdAt: roasters.createdAt,
        averageRating: roasters.averageRating,
        totalReviews: roasters.totalReviews,
        totalSales: roasters.totalSales,
        totalRevenue: roasters.totalRevenue,
        responseTime: roasters.responseTime,
        completionRate: roasters.completionRate,
        leaderboardScore: roasters.leaderboardScore,
        profileImageUrl: users.profileImageUrl,
      })
      .from(roasters)
      .leftJoin(users, eq(roasters.userId, users.id))
      .where(eq(roasters.isActive, true))
      .orderBy(desc(roasters.leaderboardScore), desc(roasters.averageRating), desc(roasters.totalReviews))
      .limit(limit);

    // Add ranking
    return result.map((item, index) => ({
      ...item,
      rank: index + 1
    }));
  }

  async updateRoasterMetrics(roasterId: number): Promise<void> {
    // Calculate average rating and review count
    const reviewStats = await db
      .select({
        avgRating: sql<number>`COALESCE(AVG(${reviews.rating}::numeric), 0)`,
        reviewCount: sql<number>`COUNT(${reviews.id})`,
      })
      .from(reviews)
      .leftJoin(products, eq(reviews.productId, products.id))
      .where(eq(products.roasterId, roasterId));

    // Calculate sales metrics
    const salesStats = await db
      .select({
        totalOrders: sql<number>`COUNT(DISTINCT ${orders.id})`,
        totalRevenue: sql<number>`COALESCE(SUM(${orderItems.price} * ${orderItems.quantity}), 0)`,
      })
      .from(orderItems)
      .leftJoin(products, eq(orderItems.productId, products.id))
      .leftJoin(orders, eq(orderItems.orderId, orders.id))
      .where(eq(products.roasterId, roasterId));

    const { avgRating, reviewCount } = reviewStats[0] || { avgRating: 0, reviewCount: 0 };
    const { totalOrders, totalRevenue } = salesStats[0] || { totalOrders: 0, totalRevenue: 0 };

    // Calculate leaderboard score
    const score = (
      (Number(avgRating) / 5.0 * 40) +
      (Math.min(Number(reviewCount) / 50.0, 1.0) * 30) +
      (Math.min(Number(totalOrders) / 20.0, 1.0) * 20) +
      (100 / 100.0 * 10) // Default completion rate
    );

    // Update roaster metrics
    await db
      .update(roasters)
      .set({
        averageRating: avgRating.toString(),
        totalReviews: Number(reviewCount),
        totalSales: Number(totalOrders),
        totalRevenue: totalRevenue.toString(),
        leaderboardScore: score.toString(),
        updatedAt: new Date(),
      })
      .where(eq(roasters.id, roasterId));
  }

  async calculateLeaderboardScore(roasterId: number): Promise<number> {
    const [roaster] = await db
      .select({
        averageRating: roasters.averageRating,
        totalReviews: roasters.totalReviews,
      })
      .from(roasters)
      .where(eq(roasters.id, roasterId));

    if (!roaster) return 0;

    // Safely parse rating and reviews with fallbacks
    const rating = parseFloat(roaster.averageRating || '0') || 0;
    const reviews = parseInt(String(roaster.totalReviews || 0)) || 0;

    // Public metrics only scoring algorithm
    // 70% weight for average rating, 30% weight for number of reviews
    const ratingScore = Math.max(0, Math.min(5, rating)) / 5.0 * 70;
    const reviewScore = Math.min(reviews / 100.0, 1.0) * 30;
    
    const totalScore = ratingScore + reviewScore;
    
    return Math.round(totalScore * 100) / 100;
  }

  // Favorite roasters operations
  async addFavoriteRoaster(userId: string, roasterId: number): Promise<FavoriteRoaster> {
    const [favorite] = await db
      .insert(favoriteRoasters)
      .values({ userId, roasterId })
      .returning();
    return favorite;
  }

  async removeFavoriteRoaster(userId: string, roasterId: number): Promise<void> {
    await db
      .delete(favoriteRoasters)
      .where(
        and(
          eq(favoriteRoasters.userId, userId),
          eq(favoriteRoasters.roasterId, roasterId)
        )
      );
  }

  async getFavoriteRoastersByUser(userId: string): Promise<any[]> {
    const favorites = await db
      .select({
        id: favoriteRoasters.id,
        roasterId: favoriteRoasters.roasterId,
        createdAt: favoriteRoasters.createdAt,
        businessName: roasters.businessName,
        description: roasters.description,
        city: roasters.city,
        state: roasters.state,
        averageRating: roasters.averageRating,
        totalReviews: roasters.totalReviews,
        roasterUserId: roasters.userId,
        firstName: users.firstName,
        lastName: users.lastName,
        profileImageUrl: users.profileImageUrl
      })
      .from(favoriteRoasters)
      .leftJoin(roasters, eq(roasters.id, favoriteRoasters.roasterId))
      .leftJoin(users, eq(users.id, roasters.userId))
      .where(eq(favoriteRoasters.userId, userId))
      .orderBy(desc(favoriteRoasters.createdAt));

    return favorites;
  }

  async isFavoriteRoaster(userId: string, roasterId: number): Promise<boolean> {
    const [favorite] = await db
      .select({ id: favoriteRoasters.id })
      .from(favoriteRoasters)
      .where(
        and(
          eq(favoriteRoasters.userId, userId),
          eq(favoriteRoasters.roasterId, roasterId)
        )
      )
      .limit(1);

    return !!favorite;
  }
}

export const storage = new DatabaseStorage();
