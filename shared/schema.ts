import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  decimal,
  integer,
  boolean,
  date,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (mandatory for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").notNull().default("buyer"), // buyer or roaster
  isRoasterApproved: boolean("is_roaster_approved").default(false),
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeConnectAccountId: varchar("stripe_connect_account_id"),
  mfaEnabled: boolean("mfa_enabled").default(false),
  mfaSecret: varchar("mfa_secret"),
  backupCodes: text("backup_codes").array(),
  lastBackupCodeUsed: timestamp("last_backup_code_used"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Roaster business information
export const roasters = pgTable("roasters", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  businessName: varchar("business_name").notNull(),
  businessType: varchar("business_type").notNull(),
  businessAddress: text("business_address"),
  city: varchar("city"),
  state: varchar("state"),
  zipCode: varchar("zip_code"),
  description: text("description"),
  roastingExperience: varchar("roasting_experience"),
  philosophy: text("philosophy"),
  isActive: boolean("is_active").default(true),
  // Leaderboard metrics
  totalReviews: integer("total_reviews").default(0),
  averageRating: decimal("average_rating", { precision: 3, scale: 2 }).default("0.00"),
  totalSales: integer("total_sales").default(0),
  totalRevenue: decimal("total_revenue", { precision: 12, scale: 2 }).default("0.00"),
  responseTime: decimal("response_time", { precision: 5, scale: 2 }).default("24.00"), // hours
  completionRate: decimal("completion_rate", { precision: 5, scale: 2 }).default("100.00"), // percentage
  leaderboardScore: decimal("leaderboard_score", { precision: 8, scale: 2 }).default("0.00"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Products
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  roasterId: integer("roaster_id").notNull().references(() => roasters.id),
  name: varchar("name").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  stockQuantity: integer("stock_quantity").notNull().default(0),
  origin: varchar("origin"),
  roastLevel: varchar("roast_level").notNull(),
  process: varchar("process"),
  altitude: varchar("altitude"),
  varietal: varchar("varietal"),
  tastingNotes: text("tasting_notes"),
  images: text("images").array(),
  
  // Clean State Model
  state: varchar("state").notNull().default("draft"), // draft, pending_review, published, archived, rejected
  
  // Tags/Flags
  isUnlisted: boolean("is_unlisted").default(false),
  isPreorder: boolean("is_preorder").default(false),
  isPrivate: boolean("is_private").default(false),
  isOutOfStock: boolean("is_out_of_stock").default(false),
  isScheduled: boolean("is_scheduled").default(false),
  
  // Scheduling and dates
  publishedAt: timestamp("published_at"),
  scheduledPublishAt: timestamp("scheduled_publish_at"),
  preorderShippingDate: timestamp("preorder_shipping_date"),
  archivedAt: timestamp("archived_at"),
  rejectedAt: timestamp("rejected_at"),
  rejectionReason: text("rejection_reason"),
  
  // Admin review
  reviewedBy: varchar("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  reviewNotes: text("review_notes"),
  
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Shopping cart
export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  productId: integer("product_id").notNull().references(() => products.id),
  quantity: integer("quantity").notNull().default(1),
  grindSize: varchar("grind_size").default("whole_bean"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Orders
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  stripePaymentIntentId: varchar("stripe_payment_intent_id"),
  status: varchar("status").notNull().default("pending"), // pending, paid, processing, shipped, delivered, cancelled
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  shippingAddress: jsonb("shipping_address").notNull(),
  billingAddress: jsonb("billing_address"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Order items
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => orders.id),
  productId: integer("product_id").notNull().references(() => products.id),
  roasterId: integer("roaster_id").notNull().references(() => roasters.id),
  quantity: integer("quantity").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  grindSize: varchar("grind_size").default("whole_bean"),
  status: varchar("status").notNull().default("pending"), // pending, processing, shipped, delivered
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const userRelations = relations(users, ({ one, many }) => ({
  roaster: one(roasters, {
    fields: [users.id],
    references: [roasters.userId],
  }),
  cartItems: many(cartItems),
  orders: many(orders),
}));

export const roasterRelations = relations(roasters, ({ one, many }) => ({
  user: one(users, {
    fields: [roasters.userId],
    references: [users.id],
  }),
  products: many(products),
  orderItems: many(orderItems),
}));

export const productRelations = relations(products, ({ one, many }) => ({
  roaster: one(roasters, {
    fields: [products.roasterId],
    references: [roasters.id],
  }),
  cartItems: many(cartItems),
  orderItems: many(orderItems),
}));

export const cartItemRelations = relations(cartItems, ({ one }) => ({
  user: one(users, {
    fields: [cartItems.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [cartItems.productId],
    references: [products.id],
  }),
}));

export const orderRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  orderItems: many(orderItems),
}));

export const orderItemRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
  roaster: one(roasters, {
    fields: [orderItems.roasterId],
    references: [roasters.id],
  }),
}));

// Zod schemas
export const insertUserSchema = createInsertSchema(users);
export const insertRoasterSchema = createInsertSchema(roasters);
export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const insertCartItemSchema = createInsertSchema(cartItems).omit({
  id: true,
  createdAt: true,
});
export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Roaster = typeof roasters.$inferSelect;
export type InsertRoaster = z.infer<typeof insertRoasterSchema>;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type OrderItem = typeof orderItems.$inferSelect;

// Reviews table
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  productId: integer("product_id").notNull(),
  rating: integer("rating").notNull(),
  title: varchar("title").notNull(),
  content: text("content").notNull(),
  verifiedPurchase: boolean("verified_purchase").default(false),
  helpfulVotes: integer("helpful_votes").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Wishlist table
export const wishlist = pgTable("wishlist", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  productId: integer("product_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Notifications table
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  type: varchar("type").notNull(),
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  data: jsonb("data"),
  isRead: boolean("is_read").default(false),
  priority: varchar("priority").default("normal"), // low, normal, high, urgent
  orderId: integer("order_id"),
  orderItemId: integer("order_item_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Order tracking table for real-time updates
export const orderTracking = pgTable("order_tracking", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  status: varchar("status").notNull(),
  location: varchar("location"),
  description: text("description").notNull(),
  estimatedDelivery: timestamp("estimated_delivery"),
  actualTime: timestamp("actual_time").defaultNow(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Real-time connections table for WebSocket management
export const realtimeConnections = pgTable("realtime_connections", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  connectionId: varchar("connection_id").notNull(),
  deviceInfo: jsonb("device_info"),
  lastSeen: timestamp("last_seen").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Additional relations
export const reviewRelations = relations(reviews, ({ one }) => ({
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [reviews.productId],
    references: [products.id],
  }),
}));

export const wishlistRelations = relations(wishlist, ({ one }) => ({
  user: one(users, {
    fields: [wishlist.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [wishlist.productId],
    references: [products.id],
  }),
}));

export const notificationRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
  order: one(orders, {
    fields: [notifications.orderId],
    references: [orders.id],
  }),
  orderItem: one(orderItems, {
    fields: [notifications.orderItemId],
    references: [orderItems.id],
  }),
}));

export const orderTrackingRelations = relations(orderTracking, ({ one }) => ({
  order: one(orders, {
    fields: [orderTracking.orderId],
    references: [orders.id],
  }),
}));

export const realtimeConnectionRelations = relations(realtimeConnections, ({ one }) => ({
  user: one(users, {
    fields: [realtimeConnections.userId],
    references: [users.id],
  }),
}));

// Additional schemas and types
export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
});
export const insertWishlistSchema = createInsertSchema(wishlist).omit({
  id: true,
  createdAt: true,
});
export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export const insertOrderTrackingSchema = createInsertSchema(orderTracking).omit({
  id: true,
  actualTime: true,
  createdAt: true,
});

export const insertRealtimeConnectionSchema = createInsertSchema(realtimeConnections).omit({
  id: true,
  lastSeen: true,
  createdAt: true,
});

export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type WishlistItem = typeof wishlist.$inferSelect;
export type InsertWishlistItem = z.infer<typeof insertWishlistSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type OrderTracking = typeof orderTracking.$inferSelect;
export type InsertOrderTracking = z.infer<typeof insertOrderTrackingSchema>;
export type RealtimeConnection = typeof realtimeConnections.$inferSelect;
export type InsertRealtimeConnection = z.infer<typeof insertRealtimeConnectionSchema>;

// Commission tracking table
export const commissions = pgTable("commissions", {
  id: serial("id").primaryKey(),
  roasterId: integer("roaster_id").notNull().references(() => roasters.id),
  orderId: integer("order_id").notNull().references(() => orders.id),
  orderItemId: integer("order_item_id").notNull().references(() => orderItems.id),
  saleAmount: decimal("sale_amount", { precision: 10, scale: 2 }).notNull(),
  commissionRate: decimal("commission_rate", { precision: 5, scale: 4 }).notNull().default("0.0850"), // 8.5%
  commissionAmount: decimal("commission_amount", { precision: 10, scale: 2 }).notNull(),
  platformFee: decimal("platform_fee", { precision: 10, scale: 2 }).notNull(),
  roasterEarnings: decimal("roaster_earnings", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status").notNull().default("pending"), // pending, paid, disputed
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Seller analytics table
export const sellerAnalytics = pgTable("seller_analytics", {
  id: serial("id").primaryKey(),
  roasterId: integer("roaster_id").notNull().references(() => roasters.id),
  date: date("date").notNull(),
  totalSales: decimal("total_sales", { precision: 10, scale: 2 }).default("0"),
  totalOrders: integer("total_orders").default(0),
  totalCustomers: integer("total_customers").default(0),
  avgOrderValue: decimal("avg_order_value", { precision: 10, scale: 2 }).default("0"),
  topProduct: varchar("top_product"),
  conversionRate: decimal("conversion_rate", { precision: 5, scale: 4 }).default("0"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Promotional campaigns table
export const campaigns = pgTable("campaigns", {
  id: serial("id").primaryKey(),
  roasterId: integer("roaster_id").notNull().references(() => roasters.id),
  name: varchar("name").notNull(),
  description: text("description"),
  type: varchar("type").notNull(), // discount, bogo, free_shipping
  discountType: varchar("discount_type"), // percentage, fixed_amount
  discountValue: decimal("discount_value", { precision: 10, scale: 2 }),
  minOrderAmount: decimal("min_order_amount", { precision: 10, scale: 2 }),
  applicableProducts: jsonb("applicable_products"), // array of product IDs
  usageLimit: integer("usage_limit"),
  usedCount: integer("used_count").default(0),
  isActive: boolean("is_active").default(true),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Bulk upload sessions table
export const bulkUploads = pgTable("bulk_uploads", {
  id: serial("id").primaryKey(),
  roasterId: integer("roaster_id").notNull().references(() => roasters.id),
  fileName: varchar("file_name").notNull(),
  status: varchar("status").notNull().default("processing"), // processing, completed, failed
  totalRows: integer("total_rows").default(0),
  processedRows: integer("processed_rows").default(0),
  successfulRows: integer("successful_rows").default(0),
  errors: jsonb("errors"), // array of error messages
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

// Disputes table
export const disputes = pgTable("disputes", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => orders.id),
  roasterId: integer("roaster_id").notNull().references(() => roasters.id),
  customerId: varchar("customer_id").notNull().references(() => users.id),
  type: varchar("type").notNull(), // refund, quality, shipping
  description: text("description").notNull(),
  status: varchar("status").notNull().default("open"), // open, investigating, resolved, closed
  resolution: text("resolution"),
  refundAmount: decimal("refund_amount", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
  resolvedAt: timestamp("resolved_at"),
});

// Additional relations
export const commissionRelations = relations(commissions, ({ one }) => ({
  roaster: one(roasters, {
    fields: [commissions.roasterId],
    references: [roasters.id],
  }),
  order: one(orders, {
    fields: [commissions.orderId],
    references: [orders.id],
  }),
  orderItem: one(orderItems, {
    fields: [commissions.orderItemId],
    references: [orderItems.id],
  }),
}));

export const sellerAnalyticsRelations = relations(sellerAnalytics, ({ one }) => ({
  roaster: one(roasters, {
    fields: [sellerAnalytics.roasterId],
    references: [roasters.id],
  }),
}));

export const campaignRelations = relations(campaigns, ({ one }) => ({
  roaster: one(roasters, {
    fields: [campaigns.roasterId],
    references: [roasters.id],
  }),
}));

export const bulkUploadRelations = relations(bulkUploads, ({ one }) => ({
  roaster: one(roasters, {
    fields: [bulkUploads.roasterId],
    references: [roasters.id],
  }),
}));

export const disputeRelations = relations(disputes, ({ one }) => ({
  order: one(orders, {
    fields: [disputes.orderId],
    references: [orders.id],
  }),
  roaster: one(roasters, {
    fields: [disputes.roasterId],
    references: [roasters.id],
  }),
  customer: one(users, {
    fields: [disputes.customerId],
    references: [users.id],
  }),
}));

// Additional schemas and types
export const insertCommissionSchema = createInsertSchema(commissions).omit({
  id: true,
  createdAt: true,
});
export const insertSellerAnalyticsSchema = createInsertSchema(sellerAnalytics).omit({
  id: true,
  createdAt: true,
} as const);
export const insertCampaignSchema = createInsertSchema(campaigns).omit({
  id: true,
  createdAt: true,
});
export const insertBulkUploadSchema = createInsertSchema(bulkUploads).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});
export const insertDisputeSchema = createInsertSchema(disputes).omit({
  id: true,
  createdAt: true,
  resolvedAt: true,
});

export type Commission = typeof commissions.$inferSelect;
export type InsertCommission = z.infer<typeof insertCommissionSchema>;
export type SellerAnalytics = typeof sellerAnalytics.$inferSelect;
export type InsertSellerAnalytics = z.infer<typeof insertSellerAnalyticsSchema>;
export type Campaign = typeof campaigns.$inferSelect;
export type InsertCampaign = z.infer<typeof insertCampaignSchema>;
export type BulkUpload = typeof bulkUploads.$inferSelect;
export type InsertBulkUpload = z.infer<typeof insertBulkUploadSchema>;
export type Dispute = typeof disputes.$inferSelect;
export type InsertDispute = z.infer<typeof insertDisputeSchema>;
