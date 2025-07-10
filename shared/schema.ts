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
  name: varchar("name"), // Full name for OAuth providers
  username: varchar("username"),
  password: varchar("password"), // For local auth
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").notNull().default("buyer"), // buyer or roaster
  isRoasterApproved: boolean("is_roaster_approved").default(false),
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeConnectAccountId: varchar("stripe_connect_account_id"),
  // Address fields
  addressLine1: varchar("address_line_1"),
  addressLine2: varchar("address_line_2"),
  city: varchar("city"),
  state: varchar("state"),
  zipCode: varchar("zip_code"),
  mfaEnabled: boolean("mfa_enabled").default(false),
  mfaSecret: varchar("mfa_secret"),
  backupCodes: text("backup_codes").array(),
  lastBackupCodeUsed: timestamp("last_backup_code_used"),
  emailVerified: boolean("email_verified").default(false),
  emailVerifiedAt: timestamp("email_verified_at"),
  onboardingCompleted: boolean("onboarding_completed").default(false),
  profileComplete: boolean("profile_complete").default(false),
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

// Message Publishing System
export const messageSubjects = pgTable("message_subjects", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: varchar("description", { length: 255 }),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const sellerMessages = pgTable("seller_messages", {
  id: serial("id").primaryKey(),
  sellerId: integer("seller_id").references(() => roasters.id).notNull(),
  subjectId: integer("subject_id").references(() => messageSubjects.id).notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  content: text("content").notNull(),
  publishedAt: timestamp("published_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const messageRecipients = pgTable("message_recipients", {
  id: serial("id").primaryKey(),
  messageId: integer("message_id").references(() => sellerMessages.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  readAt: timestamp("read_at"),
  emailSent: boolean("email_sent").default(false).notNull(),
  emailSentAt: timestamp("email_sent_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Message Relations
export const messageSubjectRelations = relations(messageSubjects, ({ many }) => ({
  messages: many(sellerMessages),
}));

export const sellerMessageRelations = relations(sellerMessages, ({ one, many }) => ({
  seller: one(roasters, {
    fields: [sellerMessages.sellerId],
    references: [roasters.id],
  }),
  subject: one(messageSubjects, {
    fields: [sellerMessages.subjectId],
    references: [messageSubjects.id],
  }),
  recipients: many(messageRecipients),
}));

export const messageRecipientRelations = relations(messageRecipients, ({ one }) => ({
  message: one(sellerMessages, {
    fields: [messageRecipients.messageId],
    references: [sellerMessages.id],
  }),
  user: one(users, {
    fields: [messageRecipients.userId],
    references: [users.id],
  }),
}));

// Zod schemas
export const insertUserSchema = createInsertSchema(users);
export const insertRoasterSchema = createInsertSchema(roasters);
export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  price: z.union([z.string(), z.number()]).transform((val) => String(val)),
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

export const insertMessageSubjectSchema = createInsertSchema(messageSubjects).omit({
  id: true,
  createdAt: true,
});

export const insertSellerMessageSchema = createInsertSchema(sellerMessages).omit({
  id: true,
  publishedAt: true,
  createdAt: true,
});

export const insertMessageRecipientSchema = createInsertSchema(messageRecipients).omit({
  id: true,
  createdAt: true,
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
export type MessageSubject = typeof messageSubjects.$inferSelect;
export type InsertMessageSubject = z.infer<typeof insertMessageSubjectSchema>;
export type SellerMessage = typeof sellerMessages.$inferSelect;
export type InsertSellerMessage = z.infer<typeof insertSellerMessageSchema>;
export type MessageRecipient = typeof messageRecipients.$inferSelect;
export type InsertMessageRecipient = z.infer<typeof insertMessageRecipientSchema>;
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

// Favorite sellers table
export const favoriteRoasters = pgTable("favorite_roasters", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  roasterId: integer("roaster_id").notNull(),
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

export const favoriteRoasterRelations = relations(favoriteRoasters, ({ one }) => ({
  user: one(users, {
    fields: [favoriteRoasters.userId],
    references: [users.id],
  }),
  roaster: one(roasters, {
    fields: [favoriteRoasters.roasterId],
    references: [roasters.id],
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

export const insertFavoriteRoasterSchema = createInsertSchema(favoriteRoasters).omit({
  id: true,
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
export type FavoriteRoaster = typeof favoriteRoasters.$inferSelect;
export type InsertFavoriteRoaster = z.infer<typeof insertFavoriteRoasterSchema>;

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

// =================================
// SHIPPING SYSTEM TABLES (SHIPPO INTEGRATION)
// =================================

// Shipping addresses for users
export const shippingAddresses = pgTable("shipping_addresses", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  email: varchar("email").notNull(),
  name: varchar("name").notNull(),
  company: varchar("company"),
  addressLine1: varchar("address_line_1").notNull(),
  addressLine2: varchar("address_line_2"),
  city: varchar("city").notNull(),
  state: varchar("state").notNull(),
  zipCode: varchar("zip_code").notNull(),
  country: varchar("country").notNull().default("US"),
  phone: varchar("phone"),
  deliveryInstructions: text("delivery_instructions"),
  isDefault: boolean("is_default").default(false),
  isValidated: boolean("is_validated").default(false),
  shippoAddressId: varchar("shippo_address_id"), // Shippo Address object ID
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Roaster shipping settings
export const roasterShippingSettings = pgTable("roaster_shipping_settings", {
  id: serial("id").primaryKey(),
  roasterId: integer("roaster_id").notNull().references(() => roasters.id),
  // Shippo account settings
  shippoAccountId: varchar("shippo_account_id"), // If roaster has their own Shippo account
  useRoastahShipping: boolean("use_roastah_shipping").default(true),
  // Origin address (where roaster ships from)
  originName: varchar("origin_name").notNull(),
  originCompany: varchar("origin_company"),
  originAddressLine1: varchar("origin_address_line_1").notNull(),
  originAddressLine2: varchar("origin_address_line_2"),
  originCity: varchar("origin_city").notNull(),
  originState: varchar("origin_state").notNull(),
  originZipCode: varchar("origin_zip_code").notNull(),
  originCountry: varchar("origin_country").notNull().default("US"),
  originPhone: varchar("origin_phone"),
  originEmail: varchar("origin_email"),
  // Shipping preferences
  freeShippingThreshold: decimal("free_shipping_threshold", { precision: 10, scale: 2 }),
  handlingTime: integer("handling_time").default(1), // days
  cutoffTime: varchar("cutoff_time").default("15:00"), // 3 PM default
  weekendsEnabled: boolean("weekends_enabled").default(false),
  // Packaging
  defaultPackageType: varchar("default_package_type").default("USPS_PRIORITY_MAIL_BOX"),
  packageWeight: decimal("package_weight", { precision: 5, scale: 2 }).default("1.00"), // lbs
  packageLength: decimal("package_length", { precision: 5, scale: 2 }).default("12.00"), // inches
  packageWidth: decimal("package_width", { precision: 5, scale: 2 }).default("9.00"),
  packageHeight: decimal("package_height", { precision: 5, scale: 2 }).default("3.00"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Shipping rates cache
export const shippingRates = pgTable("shipping_rates", {
  id: serial("id").primaryKey(),
  shippoRateId: varchar("shippo_rate_id").notNull().unique(),
  roasterId: integer("roaster_id").notNull().references(() => roasters.id),
  fromAddressId: integer("from_address_id").notNull().references(() => shippingAddresses.id),
  toAddressId: integer("to_address_id").notNull().references(() => shippingAddresses.id),
  serviceName: varchar("service_name").notNull(),
  serviceToken: varchar("service_token").notNull(),
  carrier: varchar("carrier").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency").notNull().default("USD"),
  estimatedDays: integer("estimated_days"),
  // Caching
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Shipments
export const shipments = pgTable("shipments", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => orders.id),
  roasterId: integer("roaster_id").notNull().references(() => roasters.id),
  shippoShipmentId: varchar("shippo_shipment_id").notNull().unique(),
  shippoTransactionId: varchar("shippo_transaction_id"),
  trackingNumber: varchar("tracking_number"),
  labelUrl: varchar("label_url"),
  carrier: varchar("carrier").notNull(),
  serviceName: varchar("service_name").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency").notNull().default("USD"),
  status: varchar("status").notNull().default("PENDING"), // PENDING, PURCHASED, DELIVERED, EXCEPTION
  estimatedDeliveryDate: timestamp("estimated_delivery_date"),
  actualDeliveryDate: timestamp("actual_delivery_date"),
  // Addresses
  fromAddress: jsonb("from_address").notNull(),
  toAddress: jsonb("to_address").notNull(),
  // Package details
  packageType: varchar("package_type").notNull(),
  weight: decimal("weight", { precision: 5, scale: 2 }).notNull(),
  length: decimal("length", { precision: 5, scale: 2 }).notNull(),
  width: decimal("width", { precision: 5, scale: 2 }).notNull(),
  height: decimal("height", { precision: 5, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Shipment tracking events
export const shipmentTrackingEvents = pgTable("shipment_tracking_events", {
  id: serial("id").primaryKey(),
  shipmentId: integer("shipment_id").notNull().references(() => shipments.id),
  status: varchar("status").notNull(),
  statusDate: timestamp("status_date").notNull(),
  statusDetails: varchar("status_details"),
  location: varchar("location"),
  carrier: varchar("carrier").notNull(),
  trackingNumber: varchar("tracking_number").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Return shipments
export const returnShipments = pgTable("return_shipments", {
  id: serial("id").primaryKey(),
  originalShipmentId: integer("original_shipment_id").notNull().references(() => shipments.id),
  orderId: integer("order_id").notNull().references(() => orders.id),
  roasterId: integer("roaster_id").notNull().references(() => roasters.id),
  customerId: varchar("customer_id").notNull().references(() => users.id),
  reason: varchar("reason").notNull(), // DEFECTIVE, WRONG_ITEM, DAMAGED, CHANGE_OF_MIND
  shippoShipmentId: varchar("shippo_shipment_id").unique(),
  shippoTransactionId: varchar("shippo_transaction_id"),
  trackingNumber: varchar("tracking_number"),
  labelUrl: varchar("label_url"),
  carrier: varchar("carrier"),
  serviceName: varchar("service_name"),
  amount: decimal("amount", { precision: 10, scale: 2 }),
  currency: varchar("currency").default("USD"),
  status: varchar("status").notNull().default("REQUESTED"), // REQUESTED, APPROVED, LABEL_GENERATED, SHIPPED, DELIVERED, PROCESSED
  whoPaysCost: varchar("who_pays_cost").notNull().default("CUSTOMER"), // CUSTOMER, ROASTER, ROASTAH
  refundAmount: decimal("refund_amount", { precision: 10, scale: 2 }),
  refundProcessed: boolean("refund_processed").default(false),
  notes: text("notes"),
  // Addresses
  fromAddress: jsonb("from_address"),
  toAddress: jsonb("to_address"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
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

// Shipping schema exports
export const insertShippingAddressSchema = createInsertSchema(shippingAddresses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const insertRoasterShippingSettingsSchema = createInsertSchema(roasterShippingSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const insertShippingRateSchema = createInsertSchema(shippingRates).omit({
  id: true,
  createdAt: true,
});
export const insertShipmentSchema = createInsertSchema(shipments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const insertShipmentTrackingEventSchema = createInsertSchema(shipmentTrackingEvents).omit({
  id: true,
  createdAt: true,
});
export const insertReturnShipmentSchema = createInsertSchema(returnShipments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
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

// Gift Cards
export const giftCards = pgTable("gift_cards", {
  id: serial("id").primaryKey(),
  purchaserId: varchar("purchaser_id").notNull().references(() => users.id),
  recipientEmail: varchar("recipient_email"),
  recipientPhone: varchar("recipient_phone"),
  recipientName: varchar("recipient_name"),
  senderName: varchar("sender_name").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  code: varchar("code").notNull().unique(),
  category: varchar("category").notNull(), // appreciation, congratulations, celebration, any-occasion, seasonal
  design: varchar("design").notNull(), // design identifier
  message: text("message"),
  deliveryDate: timestamp("delivery_date").notNull(),
  status: varchar("status").notNull().default("pending"), // pending, delivered, redeemed, expired
  redeemedBy: varchar("redeemed_by").references(() => users.id),
  redeemedAt: timestamp("redeemed_at"),
  remainingBalance: decimal("remaining_balance", { precision: 10, scale: 2 }),
  expiresAt: timestamp("expires_at"), // gift cards expire after 1 year
  stripePaymentIntentId: varchar("stripe_payment_intent_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const giftCardRelations = relations(giftCards, ({ one }) => ({
  purchaser: one(users, {
    fields: [giftCards.purchaserId],
    references: [users.id],
  }),
  redeemedByUser: one(users, {
    fields: [giftCards.redeemedBy],
    references: [users.id],
  }),
}));

export const insertGiftCardSchema = createInsertSchema(giftCards).omit({
  id: true,
  code: true,
  createdAt: true,
  updatedAt: true,
  redeemedAt: true,
  remainingBalance: true,
});

export type GiftCard = typeof giftCards.$inferSelect;
export type InsertGiftCard = z.infer<typeof insertGiftCardSchema>;

// Shipping types
export type ShippingAddress = typeof shippingAddresses.$inferSelect;
export type InsertShippingAddress = z.infer<typeof insertShippingAddressSchema>;
export type RoasterShippingSettings = typeof roasterShippingSettings.$inferSelect;
export type InsertRoasterShippingSettings = z.infer<typeof insertRoasterShippingSettingsSchema>;
export type ShippingRate = typeof shippingRates.$inferSelect;
export type InsertShippingRate = z.infer<typeof insertShippingRateSchema>;
export type Shipment = typeof shipments.$inferSelect;
export type InsertShipment = z.infer<typeof insertShipmentSchema>;
export type ShipmentTrackingEvent = typeof shipmentTrackingEvents.$inferSelect;
export type InsertShipmentTrackingEvent = z.infer<typeof insertShipmentTrackingEventSchema>;
export type ReturnShipment = typeof returnShipments.$inferSelect;
export type InsertReturnShipment = z.infer<typeof insertReturnShipmentSchema>;
