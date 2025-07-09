var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  bulkUploadRelations: () => bulkUploadRelations,
  bulkUploads: () => bulkUploads,
  campaignRelations: () => campaignRelations,
  campaigns: () => campaigns,
  cartItemRelations: () => cartItemRelations,
  cartItems: () => cartItems,
  commissionRelations: () => commissionRelations,
  commissions: () => commissions,
  disputeRelations: () => disputeRelations,
  disputes: () => disputes,
  favoriteRoasterRelations: () => favoriteRoasterRelations,
  favoriteRoasters: () => favoriteRoasters,
  giftCardRelations: () => giftCardRelations,
  giftCards: () => giftCards,
  insertBulkUploadSchema: () => insertBulkUploadSchema,
  insertCampaignSchema: () => insertCampaignSchema,
  insertCartItemSchema: () => insertCartItemSchema,
  insertCommissionSchema: () => insertCommissionSchema,
  insertDisputeSchema: () => insertDisputeSchema,
  insertFavoriteRoasterSchema: () => insertFavoriteRoasterSchema,
  insertGiftCardSchema: () => insertGiftCardSchema,
  insertMessageRecipientSchema: () => insertMessageRecipientSchema,
  insertMessageSubjectSchema: () => insertMessageSubjectSchema,
  insertNotificationSchema: () => insertNotificationSchema,
  insertOrderSchema: () => insertOrderSchema,
  insertOrderTrackingSchema: () => insertOrderTrackingSchema,
  insertProductSchema: () => insertProductSchema,
  insertRealtimeConnectionSchema: () => insertRealtimeConnectionSchema,
  insertReviewSchema: () => insertReviewSchema,
  insertRoasterSchema: () => insertRoasterSchema,
  insertSellerAnalyticsSchema: () => insertSellerAnalyticsSchema,
  insertSellerMessageSchema: () => insertSellerMessageSchema,
  insertUserSchema: () => insertUserSchema,
  insertWishlistSchema: () => insertWishlistSchema,
  messageRecipientRelations: () => messageRecipientRelations,
  messageRecipients: () => messageRecipients,
  messageSubjectRelations: () => messageSubjectRelations,
  messageSubjects: () => messageSubjects,
  notificationRelations: () => notificationRelations,
  notifications: () => notifications,
  orderItemRelations: () => orderItemRelations,
  orderItems: () => orderItems,
  orderRelations: () => orderRelations,
  orderTracking: () => orderTracking,
  orderTrackingRelations: () => orderTrackingRelations,
  orders: () => orders,
  productRelations: () => productRelations,
  products: () => products,
  realtimeConnectionRelations: () => realtimeConnectionRelations,
  realtimeConnections: () => realtimeConnections,
  reviewRelations: () => reviewRelations,
  reviews: () => reviews,
  roasterRelations: () => roasterRelations,
  roasters: () => roasters,
  sellerAnalytics: () => sellerAnalytics,
  sellerAnalyticsRelations: () => sellerAnalyticsRelations,
  sellerMessageRelations: () => sellerMessageRelations,
  sellerMessages: () => sellerMessages,
  sessions: () => sessions,
  userRelations: () => userRelations,
  users: () => users,
  wishlist: () => wishlist,
  wishlistRelations: () => wishlistRelations
});
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
  date
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";
var sessions, users, roasters, products, cartItems, orders, orderItems, userRelations, roasterRelations, productRelations, cartItemRelations, orderRelations, orderItemRelations, messageSubjects, sellerMessages, messageRecipients, messageSubjectRelations, sellerMessageRelations, messageRecipientRelations, insertUserSchema, insertRoasterSchema, insertProductSchema, insertCartItemSchema, insertOrderSchema, insertMessageSubjectSchema, insertSellerMessageSchema, insertMessageRecipientSchema, reviews, wishlist, notifications, orderTracking, realtimeConnections, favoriteRoasters, reviewRelations, wishlistRelations, notificationRelations, orderTrackingRelations, realtimeConnectionRelations, favoriteRoasterRelations, insertReviewSchema, insertWishlistSchema, insertNotificationSchema, insertOrderTrackingSchema, insertRealtimeConnectionSchema, insertFavoriteRoasterSchema, commissions, sellerAnalytics, campaigns, bulkUploads, disputes, commissionRelations, sellerAnalyticsRelations, campaignRelations, bulkUploadRelations, disputeRelations, insertCommissionSchema, insertSellerAnalyticsSchema, insertCampaignSchema, insertBulkUploadSchema, insertDisputeSchema, giftCards, giftCardRelations, insertGiftCardSchema;
var init_schema = __esm({
  "shared/schema.ts"() {
    "use strict";
    sessions = pgTable(
      "sessions",
      {
        sid: varchar("sid").primaryKey(),
        sess: jsonb("sess").notNull(),
        expire: timestamp("expire").notNull()
      },
      (table) => [index("IDX_session_expire").on(table.expire)]
    );
    users = pgTable("users", {
      id: varchar("id").primaryKey().notNull(),
      email: varchar("email").unique(),
      firstName: varchar("first_name"),
      lastName: varchar("last_name"),
      name: varchar("name"),
      // Full name for OAuth providers
      username: varchar("username"),
      password: varchar("password"),
      // For local auth
      profileImageUrl: varchar("profile_image_url"),
      role: varchar("role").notNull().default("buyer"),
      // buyer or roaster
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
      updatedAt: timestamp("updated_at").defaultNow()
    });
    roasters = pgTable("roasters", {
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
      responseTime: decimal("response_time", { precision: 5, scale: 2 }).default("24.00"),
      // hours
      completionRate: decimal("completion_rate", { precision: 5, scale: 2 }).default("100.00"),
      // percentage
      leaderboardScore: decimal("leaderboard_score", { precision: 8, scale: 2 }).default("0.00"),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    products = pgTable("products", {
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
      state: varchar("state").notNull().default("draft"),
      // draft, pending_review, published, archived, rejected
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
      updatedAt: timestamp("updated_at").defaultNow()
    });
    cartItems = pgTable("cart_items", {
      id: serial("id").primaryKey(),
      userId: varchar("user_id").notNull().references(() => users.id),
      productId: integer("product_id").notNull().references(() => products.id),
      quantity: integer("quantity").notNull().default(1),
      grindSize: varchar("grind_size").default("whole_bean"),
      createdAt: timestamp("created_at").defaultNow()
    });
    orders = pgTable("orders", {
      id: serial("id").primaryKey(),
      userId: varchar("user_id").notNull().references(() => users.id),
      stripePaymentIntentId: varchar("stripe_payment_intent_id"),
      status: varchar("status").notNull().default("pending"),
      // pending, paid, processing, shipped, delivered, cancelled
      totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
      shippingAddress: jsonb("shipping_address").notNull(),
      billingAddress: jsonb("billing_address"),
      notes: text("notes"),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    orderItems = pgTable("order_items", {
      id: serial("id").primaryKey(),
      orderId: integer("order_id").notNull().references(() => orders.id),
      productId: integer("product_id").notNull().references(() => products.id),
      roasterId: integer("roaster_id").notNull().references(() => roasters.id),
      quantity: integer("quantity").notNull(),
      price: decimal("price", { precision: 10, scale: 2 }).notNull(),
      grindSize: varchar("grind_size").default("whole_bean"),
      status: varchar("status").notNull().default("pending"),
      // pending, processing, shipped, delivered
      createdAt: timestamp("created_at").defaultNow()
    });
    userRelations = relations(users, ({ one, many }) => ({
      roaster: one(roasters, {
        fields: [users.id],
        references: [roasters.userId]
      }),
      cartItems: many(cartItems),
      orders: many(orders)
    }));
    roasterRelations = relations(roasters, ({ one, many }) => ({
      user: one(users, {
        fields: [roasters.userId],
        references: [users.id]
      }),
      products: many(products),
      orderItems: many(orderItems)
    }));
    productRelations = relations(products, ({ one, many }) => ({
      roaster: one(roasters, {
        fields: [products.roasterId],
        references: [roasters.id]
      }),
      cartItems: many(cartItems),
      orderItems: many(orderItems)
    }));
    cartItemRelations = relations(cartItems, ({ one }) => ({
      user: one(users, {
        fields: [cartItems.userId],
        references: [users.id]
      }),
      product: one(products, {
        fields: [cartItems.productId],
        references: [products.id]
      })
    }));
    orderRelations = relations(orders, ({ one, many }) => ({
      user: one(users, {
        fields: [orders.userId],
        references: [users.id]
      }),
      orderItems: many(orderItems)
    }));
    orderItemRelations = relations(orderItems, ({ one }) => ({
      order: one(orders, {
        fields: [orderItems.orderId],
        references: [orders.id]
      }),
      product: one(products, {
        fields: [orderItems.productId],
        references: [products.id]
      }),
      roaster: one(roasters, {
        fields: [orderItems.roasterId],
        references: [roasters.id]
      })
    }));
    messageSubjects = pgTable("message_subjects", {
      id: serial("id").primaryKey(),
      name: varchar("name", { length: 100 }).notNull().unique(),
      description: varchar("description", { length: 255 }),
      isActive: boolean("is_active").default(true).notNull(),
      createdAt: timestamp("created_at").defaultNow()
    });
    sellerMessages = pgTable("seller_messages", {
      id: serial("id").primaryKey(),
      sellerId: integer("seller_id").references(() => roasters.id).notNull(),
      subjectId: integer("subject_id").references(() => messageSubjects.id).notNull(),
      title: varchar("title", { length: 200 }).notNull(),
      content: text("content").notNull(),
      publishedAt: timestamp("published_at").defaultNow(),
      createdAt: timestamp("created_at").defaultNow()
    });
    messageRecipients = pgTable("message_recipients", {
      id: serial("id").primaryKey(),
      messageId: integer("message_id").references(() => sellerMessages.id).notNull(),
      userId: varchar("user_id").references(() => users.id).notNull(),
      isRead: boolean("is_read").default(false).notNull(),
      readAt: timestamp("read_at"),
      emailSent: boolean("email_sent").default(false).notNull(),
      emailSentAt: timestamp("email_sent_at"),
      createdAt: timestamp("created_at").defaultNow()
    });
    messageSubjectRelations = relations(messageSubjects, ({ many }) => ({
      messages: many(sellerMessages)
    }));
    sellerMessageRelations = relations(sellerMessages, ({ one, many }) => ({
      seller: one(roasters, {
        fields: [sellerMessages.sellerId],
        references: [roasters.id]
      }),
      subject: one(messageSubjects, {
        fields: [sellerMessages.subjectId],
        references: [messageSubjects.id]
      }),
      recipients: many(messageRecipients)
    }));
    messageRecipientRelations = relations(messageRecipients, ({ one }) => ({
      message: one(sellerMessages, {
        fields: [messageRecipients.messageId],
        references: [sellerMessages.id]
      }),
      user: one(users, {
        fields: [messageRecipients.userId],
        references: [users.id]
      })
    }));
    insertUserSchema = createInsertSchema(users);
    insertRoasterSchema = createInsertSchema(roasters);
    insertProductSchema = createInsertSchema(products).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    }).extend({
      price: z.union([z.string(), z.number()]).transform((val) => String(val))
    });
    insertCartItemSchema = createInsertSchema(cartItems).omit({
      id: true,
      createdAt: true
    });
    insertOrderSchema = createInsertSchema(orders).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertMessageSubjectSchema = createInsertSchema(messageSubjects).omit({
      id: true,
      createdAt: true
    });
    insertSellerMessageSchema = createInsertSchema(sellerMessages).omit({
      id: true,
      publishedAt: true,
      createdAt: true
    });
    insertMessageRecipientSchema = createInsertSchema(messageRecipients).omit({
      id: true,
      createdAt: true
    });
    reviews = pgTable("reviews", {
      id: serial("id").primaryKey(),
      userId: varchar("user_id").notNull(),
      productId: integer("product_id").notNull(),
      rating: integer("rating").notNull(),
      title: varchar("title").notNull(),
      content: text("content").notNull(),
      verifiedPurchase: boolean("verified_purchase").default(false),
      helpfulVotes: integer("helpful_votes").default(0),
      createdAt: timestamp("created_at").defaultNow()
    });
    wishlist = pgTable("wishlist", {
      id: serial("id").primaryKey(),
      userId: varchar("user_id").notNull(),
      productId: integer("product_id").notNull(),
      createdAt: timestamp("created_at").defaultNow()
    });
    notifications = pgTable("notifications", {
      id: serial("id").primaryKey(),
      userId: varchar("user_id").notNull(),
      type: varchar("type").notNull(),
      title: varchar("title").notNull(),
      message: text("message").notNull(),
      data: jsonb("data"),
      isRead: boolean("is_read").default(false),
      priority: varchar("priority").default("normal"),
      // low, normal, high, urgent
      orderId: integer("order_id"),
      orderItemId: integer("order_item_id"),
      createdAt: timestamp("created_at").defaultNow()
    });
    orderTracking = pgTable("order_tracking", {
      id: serial("id").primaryKey(),
      orderId: integer("order_id").notNull(),
      status: varchar("status").notNull(),
      location: varchar("location"),
      description: text("description").notNull(),
      estimatedDelivery: timestamp("estimated_delivery"),
      actualTime: timestamp("actual_time").defaultNow(),
      metadata: jsonb("metadata"),
      createdAt: timestamp("created_at").defaultNow()
    });
    realtimeConnections = pgTable("realtime_connections", {
      id: serial("id").primaryKey(),
      userId: varchar("user_id").notNull(),
      connectionId: varchar("connection_id").notNull(),
      deviceInfo: jsonb("device_info"),
      lastSeen: timestamp("last_seen").defaultNow(),
      createdAt: timestamp("created_at").defaultNow()
    });
    favoriteRoasters = pgTable("favorite_roasters", {
      id: serial("id").primaryKey(),
      userId: varchar("user_id").notNull(),
      roasterId: integer("roaster_id").notNull(),
      createdAt: timestamp("created_at").defaultNow()
    });
    reviewRelations = relations(reviews, ({ one }) => ({
      user: one(users, {
        fields: [reviews.userId],
        references: [users.id]
      }),
      product: one(products, {
        fields: [reviews.productId],
        references: [products.id]
      })
    }));
    wishlistRelations = relations(wishlist, ({ one }) => ({
      user: one(users, {
        fields: [wishlist.userId],
        references: [users.id]
      }),
      product: one(products, {
        fields: [wishlist.productId],
        references: [products.id]
      })
    }));
    notificationRelations = relations(notifications, ({ one }) => ({
      user: one(users, {
        fields: [notifications.userId],
        references: [users.id]
      }),
      order: one(orders, {
        fields: [notifications.orderId],
        references: [orders.id]
      }),
      orderItem: one(orderItems, {
        fields: [notifications.orderItemId],
        references: [orderItems.id]
      })
    }));
    orderTrackingRelations = relations(orderTracking, ({ one }) => ({
      order: one(orders, {
        fields: [orderTracking.orderId],
        references: [orders.id]
      })
    }));
    realtimeConnectionRelations = relations(realtimeConnections, ({ one }) => ({
      user: one(users, {
        fields: [realtimeConnections.userId],
        references: [users.id]
      })
    }));
    favoriteRoasterRelations = relations(favoriteRoasters, ({ one }) => ({
      user: one(users, {
        fields: [favoriteRoasters.userId],
        references: [users.id]
      }),
      roaster: one(roasters, {
        fields: [favoriteRoasters.roasterId],
        references: [roasters.id]
      })
    }));
    insertReviewSchema = createInsertSchema(reviews).omit({
      id: true,
      createdAt: true
    });
    insertWishlistSchema = createInsertSchema(wishlist).omit({
      id: true,
      createdAt: true
    });
    insertNotificationSchema = createInsertSchema(notifications).omit({
      id: true,
      createdAt: true
    });
    insertOrderTrackingSchema = createInsertSchema(orderTracking).omit({
      id: true,
      actualTime: true,
      createdAt: true
    });
    insertRealtimeConnectionSchema = createInsertSchema(realtimeConnections).omit({
      id: true,
      lastSeen: true,
      createdAt: true
    });
    insertFavoriteRoasterSchema = createInsertSchema(favoriteRoasters).omit({
      id: true,
      createdAt: true
    });
    commissions = pgTable("commissions", {
      id: serial("id").primaryKey(),
      roasterId: integer("roaster_id").notNull().references(() => roasters.id),
      orderId: integer("order_id").notNull().references(() => orders.id),
      orderItemId: integer("order_item_id").notNull().references(() => orderItems.id),
      saleAmount: decimal("sale_amount", { precision: 10, scale: 2 }).notNull(),
      commissionRate: decimal("commission_rate", { precision: 5, scale: 4 }).notNull().default("0.0850"),
      // 8.5%
      commissionAmount: decimal("commission_amount", { precision: 10, scale: 2 }).notNull(),
      platformFee: decimal("platform_fee", { precision: 10, scale: 2 }).notNull(),
      roasterEarnings: decimal("roaster_earnings", { precision: 10, scale: 2 }).notNull(),
      status: varchar("status").notNull().default("pending"),
      // pending, paid, disputed
      paidAt: timestamp("paid_at"),
      createdAt: timestamp("created_at").defaultNow()
    });
    sellerAnalytics = pgTable("seller_analytics", {
      id: serial("id").primaryKey(),
      roasterId: integer("roaster_id").notNull().references(() => roasters.id),
      date: date("date").notNull(),
      totalSales: decimal("total_sales", { precision: 10, scale: 2 }).default("0"),
      totalOrders: integer("total_orders").default(0),
      totalCustomers: integer("total_customers").default(0),
      avgOrderValue: decimal("avg_order_value", { precision: 10, scale: 2 }).default("0"),
      topProduct: varchar("top_product"),
      conversionRate: decimal("conversion_rate", { precision: 5, scale: 4 }).default("0"),
      createdAt: timestamp("created_at").defaultNow()
    });
    campaigns = pgTable("campaigns", {
      id: serial("id").primaryKey(),
      roasterId: integer("roaster_id").notNull().references(() => roasters.id),
      name: varchar("name").notNull(),
      description: text("description"),
      type: varchar("type").notNull(),
      // discount, bogo, free_shipping
      discountType: varchar("discount_type"),
      // percentage, fixed_amount
      discountValue: decimal("discount_value", { precision: 10, scale: 2 }),
      minOrderAmount: decimal("min_order_amount", { precision: 10, scale: 2 }),
      applicableProducts: jsonb("applicable_products"),
      // array of product IDs
      usageLimit: integer("usage_limit"),
      usedCount: integer("used_count").default(0),
      isActive: boolean("is_active").default(true),
      startDate: timestamp("start_date").notNull(),
      endDate: timestamp("end_date").notNull(),
      createdAt: timestamp("created_at").defaultNow()
    });
    bulkUploads = pgTable("bulk_uploads", {
      id: serial("id").primaryKey(),
      roasterId: integer("roaster_id").notNull().references(() => roasters.id),
      fileName: varchar("file_name").notNull(),
      status: varchar("status").notNull().default("processing"),
      // processing, completed, failed
      totalRows: integer("total_rows").default(0),
      processedRows: integer("processed_rows").default(0),
      successfulRows: integer("successful_rows").default(0),
      errors: jsonb("errors"),
      // array of error messages
      createdAt: timestamp("created_at").defaultNow(),
      completedAt: timestamp("completed_at")
    });
    disputes = pgTable("disputes", {
      id: serial("id").primaryKey(),
      orderId: integer("order_id").notNull().references(() => orders.id),
      roasterId: integer("roaster_id").notNull().references(() => roasters.id),
      customerId: varchar("customer_id").notNull().references(() => users.id),
      type: varchar("type").notNull(),
      // refund, quality, shipping
      description: text("description").notNull(),
      status: varchar("status").notNull().default("open"),
      // open, investigating, resolved, closed
      resolution: text("resolution"),
      refundAmount: decimal("refund_amount", { precision: 10, scale: 2 }),
      createdAt: timestamp("created_at").defaultNow(),
      resolvedAt: timestamp("resolved_at")
    });
    commissionRelations = relations(commissions, ({ one }) => ({
      roaster: one(roasters, {
        fields: [commissions.roasterId],
        references: [roasters.id]
      }),
      order: one(orders, {
        fields: [commissions.orderId],
        references: [orders.id]
      }),
      orderItem: one(orderItems, {
        fields: [commissions.orderItemId],
        references: [orderItems.id]
      })
    }));
    sellerAnalyticsRelations = relations(sellerAnalytics, ({ one }) => ({
      roaster: one(roasters, {
        fields: [sellerAnalytics.roasterId],
        references: [roasters.id]
      })
    }));
    campaignRelations = relations(campaigns, ({ one }) => ({
      roaster: one(roasters, {
        fields: [campaigns.roasterId],
        references: [roasters.id]
      })
    }));
    bulkUploadRelations = relations(bulkUploads, ({ one }) => ({
      roaster: one(roasters, {
        fields: [bulkUploads.roasterId],
        references: [roasters.id]
      })
    }));
    disputeRelations = relations(disputes, ({ one }) => ({
      order: one(orders, {
        fields: [disputes.orderId],
        references: [orders.id]
      }),
      roaster: one(roasters, {
        fields: [disputes.roasterId],
        references: [roasters.id]
      }),
      customer: one(users, {
        fields: [disputes.customerId],
        references: [users.id]
      })
    }));
    insertCommissionSchema = createInsertSchema(commissions).omit({
      id: true,
      createdAt: true
    });
    insertSellerAnalyticsSchema = createInsertSchema(sellerAnalytics).omit({
      id: true,
      createdAt: true
    });
    insertCampaignSchema = createInsertSchema(campaigns).omit({
      id: true,
      createdAt: true
    });
    insertBulkUploadSchema = createInsertSchema(bulkUploads).omit({
      id: true,
      createdAt: true,
      completedAt: true
    });
    insertDisputeSchema = createInsertSchema(disputes).omit({
      id: true,
      createdAt: true,
      resolvedAt: true
    });
    giftCards = pgTable("gift_cards", {
      id: serial("id").primaryKey(),
      purchaserId: varchar("purchaser_id").notNull().references(() => users.id),
      recipientEmail: varchar("recipient_email"),
      recipientPhone: varchar("recipient_phone"),
      recipientName: varchar("recipient_name"),
      senderName: varchar("sender_name").notNull(),
      amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
      code: varchar("code").notNull().unique(),
      category: varchar("category").notNull(),
      // appreciation, congratulations, celebration, any-occasion, seasonal
      design: varchar("design").notNull(),
      // design identifier
      message: text("message"),
      deliveryDate: timestamp("delivery_date").notNull(),
      status: varchar("status").notNull().default("pending"),
      // pending, delivered, redeemed, expired
      redeemedBy: varchar("redeemed_by").references(() => users.id),
      redeemedAt: timestamp("redeemed_at"),
      remainingBalance: decimal("remaining_balance", { precision: 10, scale: 2 }),
      expiresAt: timestamp("expires_at"),
      // gift cards expire after 1 year
      stripePaymentIntentId: varchar("stripe_payment_intent_id"),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    giftCardRelations = relations(giftCards, ({ one }) => ({
      purchaser: one(users, {
        fields: [giftCards.purchaserId],
        references: [users.id]
      }),
      redeemedByUser: one(users, {
        fields: [giftCards.redeemedBy],
        references: [users.id]
      })
    }));
    insertGiftCardSchema = createInsertSchema(giftCards).omit({
      id: true,
      code: true,
      createdAt: true,
      updatedAt: true,
      redeemedAt: true,
      remainingBalance: true
    });
  }
});

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
function getDb() {
  if (!dbInstance) {
    if (!process.env.DATABASE_URL) {
      throw new Error(
        "DATABASE_URL must be set. Did you forget to provision a database?"
      );
    }
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    dbInstance = drizzle({ client: pool, schema: schema_exports });
  }
  return dbInstance;
}
var pool, dbInstance;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    init_schema();
    neonConfig.webSocketConstructor = ws;
    pool = null;
    dbInstance = null;
  }
});

// server/storage.ts
var storage_exports = {};
__export(storage_exports, {
  DatabaseStorage: () => DatabaseStorage,
  storage: () => storage
});
import { eq, and, sql, desc } from "drizzle-orm";
var DatabaseStorage, storage;
var init_storage = __esm({
  "server/storage.ts"() {
    "use strict";
    init_schema();
    init_db();
    DatabaseStorage = class {
      // User operations
      async getUser(id) {
        const [user] = await getDb().select().from(users).where(eq(users.id, id));
        return user;
      }
      async getUserByEmail(email) {
        const [user] = await getDb().select().from(users).where(eq(users.email, email));
        return user;
      }
      async upsertUser(userData) {
        const [user] = await getDb().insert(users).values(userData).onConflictDoUpdate({
          target: users.id,
          set: {
            ...userData,
            updatedAt: /* @__PURE__ */ new Date()
          }
        }).returning();
        return user;
      }
      async updateUserMFA(id, mfaData) {
        const [user] = await getDb().update(users).set({
          ...mfaData,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(users.id, id)).returning();
        return user;
      }
      async updateUserAddress(id, addressData) {
        const [user] = await getDb().update(users).set({
          addressLine1: addressData.addressLine1,
          addressLine2: addressData.addressLine2 || "",
          city: addressData.city,
          state: addressData.state,
          zipCode: addressData.zipCode,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(users.id, id)).returning();
        return user;
      }
      // Roaster operations
      async createRoaster(roaster) {
        const [newRoaster] = await getDb().insert(roasters).values(roaster).returning();
        await getDb().update(users).set({ role: "roaster", isRoasterApproved: true }).where(eq(users.id, roaster.userId));
        return newRoaster;
      }
      async getRoasterByUserId(userId) {
        const [roaster] = await getDb().select().from(roasters).where(eq(roasters.userId, userId));
        return roaster;
      }
      async updateRoasterStatus(userId, isApproved) {
        await getDb().update(users).set({ isRoasterApproved: isApproved }).where(eq(users.id, userId));
      }
      // Product operations
      async createProduct(product) {
        const [newProduct] = await getDb().insert(products).values(product).returning();
        return newProduct;
      }
      async getProducts(filters) {
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
        return await getDb().select().from(products).where(and(...conditions));
      }
      async getProductById(id) {
        const [product] = await getDb().select().from(products).where(and(eq(products.id, id), eq(products.isActive, true)));
        return product;
      }
      async getProductsByRoaster(roasterId) {
        return await getDb().select().from(products).where(eq(products.roasterId, roasterId));
      }
      async updateProduct(id, updates) {
        const [updated] = await getDb().update(products).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(eq(products.id, id)).returning();
        return updated;
      }
      async deleteProduct(id) {
        await getDb().update(products).set({ isActive: false }).where(eq(products.id, id));
      }
      // Cart operations
      async addToCart(cartItem) {
        const [existing] = await getDb().select().from(cartItems).where(
          and(
            eq(cartItems.userId, cartItem.userId),
            eq(cartItems.productId, cartItem.productId),
            eq(cartItems.grindSize, cartItem.grindSize || "whole_bean")
          )
        );
        if (existing) {
          const [updated] = await getDb().update(cartItems).set({ quantity: existing.quantity + (cartItem.quantity || 1) }).where(eq(cartItems.id, existing.id)).returning();
          return updated;
        } else {
          const [newItem] = await getDb().insert(cartItems).values(cartItem).returning();
          return newItem;
        }
      }
      async getCartByUserId(userId) {
        return await getDb().select().from(cartItems).where(eq(cartItems.userId, userId));
      }
      async updateCartItem(id, quantity) {
        const [updated] = await getDb().update(cartItems).set({ quantity }).where(eq(cartItems.id, id)).returning();
        return updated;
      }
      async removeFromCart(id) {
        await getDb().delete(cartItems).where(eq(cartItems.id, id));
      }
      async clearCart(userId) {
        await getDb().delete(cartItems).where(eq(cartItems.userId, userId));
      }
      // Order operations
      async createOrder(order) {
        const [newOrder] = await getDb().insert(orders).values(order).returning();
        return newOrder;
      }
      async getOrderById(id) {
        const [order] = await getDb().select().from(orders).where(eq(orders.id, id));
        return order;
      }
      async getOrdersByUserId(userId) {
        return await getDb().select().from(orders).where(eq(orders.userId, userId)).orderBy(sql`${orders.createdAt} DESC`);
      }
      async getOrderItemsByRoaster(roasterId) {
        return await getDb().select().from(orderItems).where(eq(orderItems.roasterId, roasterId)).orderBy(sql`${orderItems.createdAt} DESC`);
      }
      async updateOrderStatus(id, status) {
        await getDb().update(orders).set({ status, updatedAt: /* @__PURE__ */ new Date() }).where(eq(orders.id, id));
      }
      async updateOrderItemStatus(id, status) {
        await getDb().update(orderItems).set({ status }).where(eq(orderItems.id, id));
      }
      // Review operations
      async createReview(review) {
        const [newReview] = await getDb().insert(reviews).values(review).returning();
        return newReview;
      }
      async getReviewsByProductId(productId) {
        return await getDb().select({
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
            profileImageUrl: users.profileImageUrl
          }
        }).from(reviews).leftJoin(users, eq(reviews.userId, users.id)).where(eq(reviews.productId, productId)).orderBy(desc(reviews.createdAt));
      }
      async updateReviewHelpful(id) {
        await getDb().update(reviews).set({ helpfulVotes: sql`${reviews.helpfulVotes} + 1` }).where(eq(reviews.id, id));
      }
      // Wishlist operations
      async addToWishlist(item) {
        const [newItem] = await getDb().insert(wishlist).values(item).returning();
        return newItem;
      }
      async getWishlistByUserId(userId) {
        return await getDb().select({
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
            origin: products.origin
          }
        }).from(wishlist).leftJoin(products, eq(wishlist.productId, products.id)).where(eq(wishlist.userId, userId)).orderBy(desc(wishlist.createdAt));
      }
      async removeFromWishlist(userId, productId) {
        await getDb().delete(wishlist).where(and(eq(wishlist.userId, userId), eq(wishlist.productId, productId)));
      }
      // Notification operations
      async createNotification(notification) {
        const [newNotification] = await getDb().insert(notifications).values(notification).returning();
        return newNotification;
      }
      async getNotificationsByUserId(userId) {
        return await getDb().select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt));
      }
      async markNotificationAsRead(id) {
        await getDb().update(notifications).set({ isRead: true }).where(eq(notifications.id, id));
      }
      async markAllNotificationsAsRead(userId) {
        await getDb().update(notifications).set({ isRead: true }).where(eq(notifications.userId, userId));
      }
      async deleteNotification(id) {
        await getDb().delete(notifications).where(eq(notifications.id, id));
      }
      // Commission operations
      async createCommission(commission) {
        const [newCommission] = await getDb().insert(commissions).values(commission).returning();
        return newCommission;
      }
      async getCommissionsByRoaster(roasterId) {
        return await getDb().select().from(commissions).where(eq(commissions.roasterId, roasterId)).orderBy(sql`${commissions.createdAt} desc`);
      }
      async updateCommissionStatus(id, status, paidAt) {
        await getDb().update(commissions).set({ status, paidAt }).where(eq(commissions.id, id));
      }
      // Seller analytics operations
      async createSellerAnalytics(analytics) {
        const [newAnalytics] = await getDb().insert(sellerAnalytics).values(analytics).returning();
        return newAnalytics;
      }
      async getSellerAnalyticsByRoaster(roasterId, startDate, endDate) {
        if (startDate && endDate) {
          return await getDb().select().from(sellerAnalytics).where(
            and(
              eq(sellerAnalytics.roasterId, roasterId),
              sql`${sellerAnalytics.date} >= ${startDate.toISOString().split("T")[0]}`,
              sql`${sellerAnalytics.date} <= ${endDate.toISOString().split("T")[0]}`
            )
          ).orderBy(sql`${sellerAnalytics.date} desc`);
        }
        return await getDb().select().from(sellerAnalytics).where(eq(sellerAnalytics.roasterId, roasterId)).orderBy(sql`${sellerAnalytics.date} desc`);
      }
      async updateSellerAnalytics(roasterId, date2, updates) {
        await getDb().update(sellerAnalytics).set(updates).where(
          and(
            eq(sellerAnalytics.roasterId, roasterId),
            sql`${sellerAnalytics.date} = ${date2.toISOString().split("T")[0]}`
          )
        );
      }
      // Campaign operations
      async createCampaign(campaign) {
        const [newCampaign] = await getDb().insert(campaigns).values(campaign).returning();
        return newCampaign;
      }
      async getCampaignsByRoaster(roasterId) {
        return await getDb().select().from(campaigns).where(eq(campaigns.roasterId, roasterId)).orderBy(sql`${campaigns.createdAt} desc`);
      }
      async updateCampaign(id, updates) {
        const [updatedCampaign] = await getDb().update(campaigns).set(updates).where(eq(campaigns.id, id)).returning();
        return updatedCampaign;
      }
      async deleteCampaign(id) {
        await getDb().delete(campaigns).where(eq(campaigns.id, id));
      }
      async incrementCampaignUsage(id) {
        await getDb().update(campaigns).set({ usedCount: sql`${campaigns.usedCount} + 1` }).where(eq(campaigns.id, id));
      }
      // Bulk upload operations
      async createBulkUpload(upload) {
        const [newUpload] = await getDb().insert(bulkUploads).values(upload).returning();
        return newUpload;
      }
      async getBulkUploadsByRoaster(roasterId) {
        return await getDb().select().from(bulkUploads).where(eq(bulkUploads.roasterId, roasterId)).orderBy(sql`${bulkUploads.createdAt} desc`);
      }
      async updateBulkUploadStatus(id, status, updates) {
        const updateData = { status, ...updates };
        if (status === "completed" || status === "failed") {
          updateData.completedAt = /* @__PURE__ */ new Date();
        }
        await getDb().update(bulkUploads).set(updateData).where(eq(bulkUploads.id, id));
      }
      // Dispute operations
      async createDispute(dispute) {
        const [newDispute] = await getDb().insert(disputes).values(dispute).returning();
        return newDispute;
      }
      async getDisputesByRoaster(roasterId) {
        return await getDb().select().from(disputes).where(eq(disputes.roasterId, roasterId)).orderBy(sql`${disputes.createdAt} desc`);
      }
      async getDisputesByCustomer(customerId) {
        return await getDb().select().from(disputes).where(eq(disputes.customerId, customerId)).orderBy(sql`${disputes.createdAt} desc`);
      }
      async updateDisputeStatus(id, status, resolution) {
        const updateData = { status };
        if (resolution) {
          updateData.resolution = resolution;
        }
        if (status === "resolved" || status === "closed") {
          updateData.resolvedAt = /* @__PURE__ */ new Date();
        }
        await getDb().update(disputes).set(updateData).where(eq(disputes.id, id));
      }
      // Real-time tracking operations
      async createOrderTracking(tracking) {
        const [result] = await getDb().insert(orderTracking).values(tracking).returning();
        return result;
      }
      async getOrderTracking(orderId) {
        return await getDb().select().from(orderTracking).where(eq(orderTracking.orderId, orderId)).orderBy(desc(orderTracking.createdAt));
      }
      async updateOrderTracking(id, updates) {
        const [result] = await getDb().update(orderTracking).set(updates).where(eq(orderTracking.id, id)).returning();
        return result;
      }
      // Real-time connection operations
      async createRealtimeConnection(connection) {
        const [result] = await getDb().insert(realtimeConnections).values(connection).returning();
        return result;
      }
      async getRealtimeConnectionsByUser(userId) {
        return await getDb().select().from(realtimeConnections).where(eq(realtimeConnections.userId, userId)).orderBy(desc(realtimeConnections.createdAt));
      }
      async updateRealtimeConnection(id, updates) {
        await getDb().update(realtimeConnections).set(updates).where(eq(realtimeConnections.id, id));
      }
      async removeRealtimeConnection(connectionId) {
        await getDb().delete(realtimeConnections).where(eq(realtimeConnections.connectionId, connectionId));
      }
      // Enhanced order operations for real-time features
      async getRoasterById(id) {
        const [roaster] = await getDb().select().from(roasters).where(eq(roasters.id, id));
        return roaster;
      }
      async getOrderItemsByOrder(orderId) {
        return await getDb().select().from(orderItems).where(eq(orderItems.orderId, orderId));
      }
      // Leaderboard operations
      async getLeaderboard(dateRange, limit = 10) {
        const now = /* @__PURE__ */ new Date();
        let startDate;
        switch (dateRange) {
          case "week":
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1e3);
            break;
          case "month":
            startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
            break;
          case "quarter":
            startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
            break;
          case "6m":
            startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
            break;
          case "year":
            startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
            break;
          case "3year":
            startDate = new Date(now.getFullYear() - 3, now.getMonth(), now.getDate());
            break;
          case "5year":
            startDate = new Date(now.getFullYear() - 5, now.getMonth(), now.getDate());
            break;
          default:
            startDate = new Date(2020, 0, 1);
        }
        const result = await getDb().select({
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
          profileImageUrl: users.profileImageUrl
        }).from(roasters).leftJoin(users, eq(roasters.userId, users.id)).where(eq(roasters.isActive, true)).orderBy(desc(roasters.leaderboardScore), desc(roasters.averageRating), desc(roasters.totalReviews)).limit(limit);
        return result.map((item, index2) => ({
          ...item,
          rank: index2 + 1
        }));
      }
      async updateRoasterMetrics(roasterId) {
        const reviewStats = await getDb().select({
          avgRating: sql`COALESCE(AVG(${reviews.rating}::numeric), 0)`,
          reviewCount: sql`COUNT(${reviews.id})`
        }).from(reviews).leftJoin(products, eq(reviews.productId, products.id)).where(eq(products.roasterId, roasterId));
        const salesStats = await getDb().select({
          totalOrders: sql`COUNT(DISTINCT ${orders.id})`,
          totalRevenue: sql`COALESCE(SUM(${orderItems.price} * ${orderItems.quantity}), 0)`
        }).from(orderItems).leftJoin(products, eq(orderItems.productId, products.id)).leftJoin(orders, eq(orderItems.orderId, orders.id)).where(eq(products.roasterId, roasterId));
        const { avgRating, reviewCount } = reviewStats[0] || { avgRating: 0, reviewCount: 0 };
        const { totalOrders, totalRevenue } = salesStats[0] || { totalOrders: 0, totalRevenue: 0 };
        const score = Number(avgRating) / 5 * 40 + Math.min(Number(reviewCount) / 50, 1) * 30 + Math.min(Number(totalOrders) / 20, 1) * 20 + 100 / 100 * 10;
        await getDb().update(roasters).set({
          averageRating: avgRating.toString(),
          totalReviews: Number(reviewCount),
          totalSales: Number(totalOrders),
          totalRevenue: totalRevenue.toString(),
          leaderboardScore: score.toString(),
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(roasters.id, roasterId));
      }
      async calculateLeaderboardScore(roasterId) {
        const [roaster] = await getDb().select({
          averageRating: roasters.averageRating,
          totalReviews: roasters.totalReviews
        }).from(roasters).where(eq(roasters.id, roasterId));
        if (!roaster) return 0;
        const rating = parseFloat(roaster.averageRating || "0") || 0;
        const reviews3 = parseInt(String(roaster.totalReviews || 0)) || 0;
        const ratingScore = Math.max(0, Math.min(5, rating)) / 5 * 70;
        const reviewScore = Math.min(reviews3 / 100, 1) * 30;
        const totalScore = ratingScore + reviewScore;
        return Math.round(totalScore * 100) / 100;
      }
      // Favorite roasters operations
      async addFavoriteRoaster(userId, roasterId) {
        try {
          console.log(`Storage: Adding favorite - userId: ${userId}, roasterId: ${roasterId}`);
          const [favorite] = await getDb().insert(favoriteRoasters).values({ userId, roasterId }).returning();
          console.log(`Storage: Favorite added successfully:`, favorite);
          return favorite;
        } catch (error) {
          console.error(`Storage: Error adding favorite:`, error);
          throw error;
        }
      }
      async removeFavoriteRoaster(userId, roasterId) {
        await getDb().delete(favoriteRoasters).where(
          and(
            eq(favoriteRoasters.userId, userId),
            eq(favoriteRoasters.roasterId, roasterId)
          )
        );
      }
      async getFavoriteRoastersByUser(userId) {
        const favorites = await getDb().select({
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
        }).from(favoriteRoasters).leftJoin(roasters, eq(roasters.id, favoriteRoasters.roasterId)).leftJoin(users, eq(users.id, roasters.userId)).where(eq(favoriteRoasters.userId, userId)).orderBy(desc(favoriteRoasters.createdAt));
        return favorites;
      }
      async isFavoriteRoaster(userId, roasterId) {
        const [favorite] = await getDb().select({ id: favoriteRoasters.id }).from(favoriteRoasters).where(
          and(
            eq(favoriteRoasters.userId, userId),
            eq(favoriteRoasters.roasterId, roasterId)
          )
        ).limit(1);
        return !!favorite;
      }
      // Gift card operations
      async createGiftCard(giftCardData) {
        const code = this.generateGiftCardCode();
        const expiresAt = /* @__PURE__ */ new Date();
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);
        const [giftCard] = await getDb().insert(giftCards).values({
          ...giftCardData,
          code,
          expiresAt,
          remainingBalance: giftCardData.amount
        }).returning();
        return giftCard;
      }
      async getGiftCardById(id) {
        const [giftCard] = await getDb().select().from(giftCards).where(eq(giftCards.id, id));
        return giftCard;
      }
      async getGiftCardByCode(code) {
        const [giftCard] = await getDb().select().from(giftCards).where(eq(giftCards.code, code));
        return giftCard;
      }
      async getGiftCardsByPurchaser(purchaserId) {
        return await getDb().select().from(giftCards).where(eq(giftCards.purchaserId, purchaserId)).orderBy(desc(giftCards.createdAt));
      }
      async redeemGiftCard(code, userId, amount) {
        const [giftCard] = await getDb().update(giftCards).set({
          redeemedBy: userId,
          redeemedAt: /* @__PURE__ */ new Date(),
          remainingBalance: sql`${giftCards.remainingBalance} - ${amount}`,
          status: sql`CASE WHEN ${giftCards.remainingBalance} - ${amount} <= 0 THEN 'redeemed' ELSE 'partially_redeemed' END`,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(giftCards.code, code)).returning();
        return giftCard;
      }
      async updateGiftCardStatus(id, status) {
        await getDb().update(giftCards).set({ status, updatedAt: /* @__PURE__ */ new Date() }).where(eq(giftCards.id, id));
      }
      generateGiftCardCode() {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let code = "";
        for (let i = 0; i < 16; i++) {
          code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code.match(/.{1,4}/g)?.join("-") || code;
      }
      // Message Subject operations
      async getAllMessageSubjects() {
        return await getDb().select().from(messageSubjects).where(eq(messageSubjects.isActive, true)).orderBy(messageSubjects.name);
      }
      async createMessageSubject(subject) {
        const [newSubject] = await getDb().insert(messageSubjects).values(subject).returning();
        return newSubject;
      }
      // Seller Message operations
      async createSellerMessage(message) {
        const [newMessage] = await getDb().insert(sellerMessages).values(message).returning();
        return newMessage;
      }
      async getSellerMessages(sellerId) {
        return await getDb().select({
          id: sellerMessages.id,
          sellerId: sellerMessages.sellerId,
          subjectId: sellerMessages.subjectId,
          title: sellerMessages.title,
          content: sellerMessages.content,
          publishedAt: sellerMessages.publishedAt,
          createdAt: sellerMessages.createdAt,
          subject: {
            id: messageSubjects.id,
            name: messageSubjects.name,
            description: messageSubjects.description
          }
        }).from(sellerMessages).leftJoin(messageSubjects, eq(sellerMessages.subjectId, messageSubjects.id)).where(eq(sellerMessages.sellerId, sellerId)).orderBy(sql`${sellerMessages.publishedAt} desc`);
      }
      async getSellerMessageById(messageId) {
        const [message] = await getDb().select({
          id: sellerMessages.id,
          sellerId: sellerMessages.sellerId,
          subjectId: sellerMessages.subjectId,
          title: sellerMessages.title,
          content: sellerMessages.content,
          publishedAt: sellerMessages.publishedAt,
          createdAt: sellerMessages.createdAt,
          subject: {
            id: messageSubjects.id,
            name: messageSubjects.name
          },
          seller: {
            id: roasters.id,
            businessName: roasters.businessName
          }
        }).from(sellerMessages).leftJoin(messageSubjects, eq(sellerMessages.subjectId, messageSubjects.id)).leftJoin(roasters, eq(sellerMessages.sellerId, roasters.id)).where(eq(sellerMessages.id, messageId));
        return message;
      }
      // Message Recipient operations
      async createMessageRecipients(recipients) {
        return await getDb().insert(messageRecipients).values(recipients).returning();
      }
      async getUserMessages(userId) {
        return await getDb().select({
          id: messageRecipients.id,
          messageId: messageRecipients.messageId,
          userId: messageRecipients.userId,
          isRead: messageRecipients.isRead,
          readAt: messageRecipients.readAt,
          emailSent: messageRecipients.emailSent,
          emailSentAt: messageRecipients.emailSentAt,
          createdAt: messageRecipients.createdAt,
          message: {
            id: sellerMessages.id,
            title: sellerMessages.title,
            content: sellerMessages.content,
            publishedAt: sellerMessages.publishedAt,
            sellerId: roasters.id,
            sellerName: roasters.businessName,
            subjectId: messageSubjects.id,
            subjectName: messageSubjects.name
          }
        }).from(messageRecipients).leftJoin(sellerMessages, eq(messageRecipients.messageId, sellerMessages.id)).leftJoin(roasters, eq(sellerMessages.sellerId, roasters.id)).leftJoin(messageSubjects, eq(sellerMessages.subjectId, messageSubjects.id)).where(eq(messageRecipients.userId, userId)).orderBy(sql`${sellerMessages.publishedAt} desc`);
      }
      async getUnreadMessageCount(userId) {
        const [result] = await getDb().select({ count: sql`count(*)` }).from(messageRecipients).where(
          and(
            eq(messageRecipients.userId, userId),
            eq(messageRecipients.isRead, false)
          )
        );
        return result.count;
      }
      async markMessageAsRead(userId, messageId) {
        await getDb().update(messageRecipients).set({
          isRead: true,
          readAt: /* @__PURE__ */ new Date()
        }).where(
          and(
            eq(messageRecipients.userId, userId),
            eq(messageRecipients.messageId, messageId)
          )
        );
      }
      async markEmailAsSent(userId, messageId) {
        await getDb().update(messageRecipients).set({
          emailSent: true,
          emailSentAt: /* @__PURE__ */ new Date()
        }).where(
          and(
            eq(messageRecipients.userId, userId),
            eq(messageRecipients.messageId, messageId)
          )
        );
      }
      // Get recipients for a seller's message (favorites + past buyers)
      async getMessageRecipients(sellerId) {
        const favoriteUsers = await getDb().select({ userId: wishlist.userId }).from(wishlist).leftJoin(products, eq(wishlist.productId, products.id)).where(eq(products.roasterId, sellerId));
        const pastBuyers = await getDb().select({ userId: orders.userId }).from(orders).leftJoin(orderItems, eq(orders.id, orderItems.orderId)).where(eq(orderItems.roasterId, sellerId));
        const allRecipients = /* @__PURE__ */ new Set();
        favoriteUsers.forEach((user) => allRecipients.add(user.userId));
        pastBuyers.forEach((user) => allRecipients.add(user.userId));
        return Array.from(allRecipients);
      }
    };
    storage = new DatabaseStorage();
  }
});

// server/oauth-auth.ts
var oauth_auth_exports = {};
__export(oauth_auth_exports, {
  getSession: () => getSession,
  isAuthenticated: () => isAuthenticated,
  isCloudRun: () => isCloudRun,
  isDevelopment: () => isDevelopment,
  setupOAuth: () => setupOAuth
});
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import session from "express-session";
import connectPg from "connect-pg-simple";
function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1e3;
  try {
    console.log("\u{1F510} Setting up session store with DATABASE_URL:", process.env.DATABASE_URL ? "Present" : "Missing");
    console.log("\u{1F510} SESSION_SECRET:", process.env.SESSION_SECRET ? "Present" : "Missing");
    const pgStore = connectPg(session);
    const sessionStore = new pgStore({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: true,
      // Create sessions table if missing
      ttl: sessionTtl,
      tableName: "sessions"
    });
    console.log("\u{1F510} Session store created successfully");
    return session({
      secret: process.env.SESSION_SECRET,
      store: sessionStore,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: sessionTtl,
        sameSite: "lax"
        // Add sameSite for better compatibility
      }
    });
  } catch (error) {
    console.error("\u{1F510} Session setup error:", error);
    console.log("\u{1F510} Falling back to memory store");
    return session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: sessionTtl,
        sameSite: "lax"
      }
    });
  }
}
async function upsertUserFromOAuth(profile, provider) {
  const userId = `${provider}-${profile.id}`;
  const email = profile.emails?.[0]?.value || `${userId}@${provider}.com`;
  const user = await storage.upsertUser({
    id: userId,
    email,
    name: profile.displayName || profile.name?.givenName || profile.username,
    username: profile.username || email.split("@")[0],
    role: "user",
    mfaEnabled: false,
    emailVerified: true,
    emailVerifiedAt: /* @__PURE__ */ new Date(),
    onboardingCompleted: false,
    profileComplete: false,
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  });
  return user;
}
async function setupOAuth(app2) {
  const sessionMiddleware = getSession();
  app2.use(sessionMiddleware);
  app2.use(passport.initialize());
  app2.use(passport.session());
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await storage.getUser(id);
      if (user) {
        done(null, user);
      } else {
        done(null, false);
      }
    } catch (error) {
      console.warn("Error deserializing user:", error);
      done(null, false);
    }
  });
  app2.get("/api/login", (req, res) => {
    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
      res.redirect("/api/auth/google");
    } else {
      res.status(500).json({ error: "OAuth not configured. Please set up Google OAuth credentials." });
    }
  });
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    console.log("\u{1F510} Setting up Google OAuth");
    let callbackURL;
    if (isDevelopment) {
      callbackURL = `http://localhost:${process.env.PORT || 5e3}/api/auth/google/callback`;
    } else if (isCloudRun) {
      const serviceName = process.env.K_SERVICE || "roastah-d";
      const region = process.env.K_REVISION?.split("-")[1] || "us-central1";
      const projectId = process.env.GOOGLE_CLOUD_PROJECT || "roastah-d";
      callbackURL = `https://${serviceName}-${projectId.split("-")[1]}.${region}.run.app/api/auth/google/callback`;
    } else {
      callbackURL = process.env.CLOUD_RUN_URL ? `https://${process.env.CLOUD_RUN_URL}/api/auth/google/callback` : "https://roastah-d-188956418455.us-central1.run.app/api/auth/google/callback";
    }
    console.log("\u{1F510} Google OAuth callback URL:", callbackURL);
    passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL
    }, async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await upsertUserFromOAuth(profile, "google");
        done(null, user);
      } catch (error) {
        done(error, null);
      }
    }));
    app2.get(
      "/api/auth/google",
      passport.authenticate("google", { scope: ["profile", "email"] })
    );
    app2.get(
      "/api/auth/google/callback",
      passport.authenticate("google", { failureRedirect: "/auth/error" }),
      (req, res) => {
        res.redirect("/");
      }
    );
  } else {
    console.warn("\u26A0\uFE0F Google OAuth not configured - missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET");
  }
  if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    console.log("\u{1F510} Setting up GitHub OAuth");
    let callbackURL;
    if (isDevelopment) {
      callbackURL = `http://localhost:${process.env.PORT || 5e3}/api/auth/github/callback`;
    } else if (isCloudRun) {
      const serviceName = process.env.K_SERVICE || "roastah-d";
      const region = process.env.K_REVISION?.split("-")[1] || "us-central1";
      const projectId = process.env.GOOGLE_CLOUD_PROJECT || "roastah-d";
      callbackURL = `https://${serviceName}-${projectId.split("-")[1]}.${region}.run.app/api/auth/github/callback`;
    } else {
      callbackURL = process.env.CLOUD_RUN_URL ? `https://${process.env.CLOUD_RUN_URL}/api/auth/github/callback` : "https://roastah-d-188956418455.us-central1.run.app/api/auth/github/callback";
    }
    console.log("\u{1F510} GitHub OAuth callback URL:", callbackURL);
    passport.use(new GitHubStrategy({
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL
    }, async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await upsertUserFromOAuth(profile, "github");
        done(null, user);
      } catch (error) {
        done(error, null);
      }
    }));
    app2.get(
      "/api/auth/github",
      passport.authenticate("github", { scope: ["user:email"] })
    );
    app2.get(
      "/api/auth/github/callback",
      passport.authenticate("github", { failureRedirect: "/auth/error" }),
      (req, res) => {
        res.redirect("/");
      }
    );
  }
  if (process.env.APPLE_CLIENT_ID && process.env.APPLE_TEAM_ID && process.env.APPLE_KEY_ID) {
    console.log("\u{1F510} Setting up Apple OAuth");
    try {
      const { Strategy: AppleStrategy } = __require("passport-apple");
      let callbackURL;
      if (isDevelopment) {
        callbackURL = `http://localhost:${process.env.PORT || 5e3}/api/auth/apple/callback`;
      } else if (isCloudRun) {
        const serviceName = process.env.K_SERVICE || "roastah-d";
        const region = process.env.K_REVISION?.split("-")[1] || "us-central1";
        const projectId = process.env.GOOGLE_CLOUD_PROJECT || "roastah-d";
        callbackURL = `https://${serviceName}-${projectId.split("-")[1]}.${region}.run.app/api/auth/apple/callback`;
      } else {
        callbackURL = process.env.CLOUD_RUN_URL ? `https://${process.env.CLOUD_RUN_URL}/api/auth/apple/callback` : "https://roastah-d-188956418455.us-central1.run.app/api/auth/apple/callback";
      }
      console.log("\u{1F510} Apple OAuth callback URL:", callbackURL);
      passport.use(new AppleStrategy({
        clientID: process.env.APPLE_CLIENT_ID,
        teamID: process.env.APPLE_TEAM_ID,
        keyID: process.env.APPLE_KEY_ID,
        privateKeyString: process.env.APPLE_PRIVATE_KEY,
        callbackURL
      }, async (accessToken, refreshToken, profile, done) => {
        try {
          const user = await upsertUserFromOAuth(profile, "apple");
          done(null, user);
        } catch (error) {
          done(error, null);
        }
      }));
      app2.get(
        "/api/auth/apple",
        passport.authenticate("apple", { scope: ["name", "email"] })
      );
      app2.get(
        "/api/auth/apple/callback",
        passport.authenticate("apple", { failureRedirect: "/auth/error" }),
        (req, res) => {
          res.redirect("/");
        }
      );
    } catch (error) {
      console.warn("\u26A0\uFE0F Apple OAuth not available, install passport-apple if needed");
    }
  }
  app2.get("/api/auth/user", async (req, res) => {
    try {
      if (isDevelopment && req.session?.user?.sub) {
        const userId = req.session.user.sub;
        const user = await storage.getUser(userId);
        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }
        let roaster = null;
        if (user?.role === "roaster") {
          roaster = await storage.getRoasterByUserId(userId);
        }
        const response = {
          ...user,
          roaster,
          mfaRequired: !!(roaster || user?.role === "admin")
        };
        return res.json(response);
      }
      if (req.user?.id) {
        return res.json(req.user);
      }
      res.status(401).json({ error: "Not authenticated" });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });
  app2.post("/api/auth/register", async (req, res) => {
    try {
      const { name, email, password } = req.body;
      if (!name || !email || !password) {
        return res.status(400).json({ error: "Name, email, and password are required" });
      }
      if (password.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters long" });
      }
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: "User with this email already exists" });
      }
      const bcrypt = await import("bcrypt");
      const hashedPassword = await bcrypt.hash(password, 12);
      const user = await storage.upsertUser({
        id: `email-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        email,
        name,
        username: email.split("@")[0],
        password: hashedPassword,
        role: "user",
        mfaEnabled: false,
        emailVerified: true,
        emailVerifiedAt: /* @__PURE__ */ new Date(),
        onboardingCompleted: false,
        profileComplete: false,
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      });
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ error: "Failed to log in after registration" });
        }
        res.status(201).json(user);
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/auth/test-db", async (req, res) => {
    try {
      console.log("\u{1F527} Testing database connection...");
      const user = await storage.getUserByEmail("saasna@roastah.com");
      console.log("\u{1F527} Test user found:", user ? "Yes" : "No");
      res.json({
        dbConnection: "working",
        userFound: !!user,
        userDetails: user ? { id: user.id, email: user.email, hasPassword: !!user.password } : null
      });
    } catch (error) {
      console.error("\u{1F527} Database test error:", error);
      res.status(500).json({ error: "Database connection failed", details: error.message });
    }
  });
  app2.post("/api/auth/simple-login", async (req, res) => {
    console.log("\u{1F527} === SIMPLE LOGIN TEST START ===");
    try {
      const { email, password } = req.body;
      console.log("\u{1F527} Simple login attempt for:", email);
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password required" });
      }
      const user = await storage.getUserByEmail(email);
      if (!user || !user.password) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      const bcrypt = await import("bcrypt");
      const isValid = await bcrypt.compare(password, user.password);
      if (isValid) {
        console.log("\u{1F527} Simple login successful");
        res.json({ success: true, user: { id: user.id, email: user.email } });
      } else {
        res.status(401).json({ error: "Invalid credentials" });
      }
    } catch (error) {
      console.error("\u{1F527} Simple login error:", error);
      res.status(500).json({ error: "Simple login failed", details: error.message });
    }
  });
  app2.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }
      const user = await storage.getUserByEmail(email);
      if (!user || !user.password) {
        return res.status(401).json({ error: "Invalid email or password" });
      }
      const bcrypt = await import("bcrypt");
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid email or password" });
      }
      req.login(user, (err) => {
        if (err) {
          console.error("\u{1F510} Login error:", err.message);
          return res.status(500).json({ error: "Failed to log in" });
        }
        console.log("\u{1F510} Login successful for user:", user.id);
        if (isDevelopment) {
          res.json({
            ...user,
            redirectTo: "/dev-login"
          });
        } else {
          res.json(user);
        }
      });
    } catch (error) {
      console.error("\u{1F510} Login error:", error.message);
      res.status(500).json({
        error: "Internal server error",
        details: error.message
      });
    }
  });
  app2.post("/api/auth/logout", (req, res) => {
    req.logout(() => {
      res.json({ message: "Logout successful" });
    });
  });
  app2.get("/auth/error", (req, res) => {
    res.status(401).json({ error: "Authentication failed" });
  });
  console.log("\u{1F510} OAuth authentication setup complete");
}
var isDevelopment, isCloudRun, isAuthenticated;
var init_oauth_auth = __esm({
  "server/oauth-auth.ts"() {
    "use strict";
    init_storage();
    isDevelopment = process.env.NODE_ENV === "development";
    isCloudRun = process.env.K_SERVICE !== void 0;
    console.log(`\u{1F510} OAuth Environment: Development=${isDevelopment}, CloudRun=${isCloudRun}`);
    isAuthenticated = async (req, res, next) => {
      if (isDevelopment && req.session.user?.sub) {
        return next();
      }
      if (req.user?.id) {
        return next();
      }
      res.status(401).json({ error: "Authentication required" });
    };
  }
});

// server/secrets.ts
var secrets_exports = {};
__export(secrets_exports, {
  getSecret: () => getSecret,
  loadSecrets: () => loadSecrets
});
import { SecretManagerServiceClient } from "@google-cloud/secret-manager";
async function getSecret(secretName) {
  try {
    const name = `projects/${process.env.GOOGLE_CLOUD_PROJECT || "roastah-d"}/secrets/${secretName}/versions/latest`;
    const [version] = await client.accessSecretVersion({ name });
    return version.payload?.data?.toString() || "";
  } catch (error) {
    console.warn(`Failed to load secret ${secretName} from Secret Manager:`, error);
    return process.env[secretName] || "";
  }
}
async function loadSecrets() {
  console.log("\u{1F510} Starting loadSecrets...");
  console.log("GOOGLE_CLOUD_PROJECT:", process.env.GOOGLE_CLOUD_PROJECT);
  console.log("NODE_ENV:", process.env.NODE_ENV);
  console.log("PORT:", process.env.PORT);
  try {
    console.log("Loading secrets from GCP Secret Manager...");
    const requiredSecrets = [
      "DATABASE_URL",
      "SESSION_SECRET",
      "STRIPE_SECRET_KEY",
      "GOOGLE_CLIENT_ID",
      "GOOGLE_CLIENT_SECRET"
    ];
    const optionalSecrets = [
      "CLOUD_RUN_URL",
      "GITHUB_CLIENT_ID",
      "GITHUB_CLIENT_SECRET"
    ];
    const allSecrets = [...requiredSecrets, ...optionalSecrets];
    const secretPromises = allSecrets.map(async (secretName) => {
      try {
        const secretValue = await getSecret(secretName);
        if (secretValue) {
          process.env[secretName] = secretValue;
          console.log(`\u2705 Loaded ${secretName} from Secret Manager`);
          return { name: secretName, success: true };
        } else {
          const isOptional = optionalSecrets.includes(secretName);
          if (isOptional) {
            console.log(`\u2139\uFE0F Optional secret ${secretName} not found in Secret Manager`);
          } else {
            console.warn(`\u26A0\uFE0F Failed to load ${secretName} from Secret Manager`);
          }
          return { name: secretName, success: false, optional: isOptional };
        }
      } catch (error) {
        const isOptional = optionalSecrets.includes(secretName);
        if (isOptional) {
          console.log(`\u2139\uFE0F Optional secret ${secretName} not available:`, error.message);
        } else {
          console.warn(`\u274C Error loading ${secretName}:`, error);
        }
        return { name: secretName, success: false, error, optional: isOptional };
      }
    });
    const results = await Promise.all(secretPromises);
    const successful = results.filter((r) => r.success);
    const failed = results.filter((r) => !r.success);
    console.log(`\u{1F4CA} Secret loading complete: ${successful.length} successful, ${failed.length} failed`);
    if (failed.length > 0) {
      console.warn("Failed secrets:", failed.map((f) => f.name));
    }
  } catch (error) {
    console.error("\u274C Failed to load secrets from Secret Manager:", error);
    throw error;
  }
}
var client;
var init_secrets = __esm({
  "server/secrets.ts"() {
    "use strict";
    client = new SecretManagerServiceClient();
  }
});

// server/index.ts
import express from "express";

// server/routes.ts
init_storage();
import { createServer } from "http";
import Stripe from "stripe";
import multer from "multer";
import * as fs from "fs";

// server/auth-router.ts
var isCloudRun2 = process.env.K_SERVICE !== void 0;
var isDevelopment2 = process.env.NODE_ENV === "development";
console.log(`\u{1F510} Auth Environment: Development=${isDevelopment2}, CloudRun=${isCloudRun2}`);
async function setupAuthentication(app2) {
  console.log("\u{1F510} Setting up OAuth authentication system...");
  try {
    const { setupOAuth: setupOAuth2, isAuthenticated: isAuthenticated2 } = await Promise.resolve().then(() => (init_oauth_auth(), oauth_auth_exports));
    console.log("\u{1F510} OAuth module imported successfully");
    await setupOAuth2(app2);
    console.log("\u{1F510} OAuth authentication setup complete");
    return { isAuthenticated: isAuthenticated2 };
  } catch (error) {
    console.error("\u{1F510} CRITICAL: Authentication setup failed:", error);
    console.error("\u{1F510} Error stack:", error.stack);
    throw error;
  }
}

// server/routes.ts
init_db();
import { eq as eq2 } from "drizzle-orm";

// server/security.ts
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { body, validationResult, param, query } from "express-validator";
import mongoSanitize from "express-mongo-sanitize";
var generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1e3,
  // 15 minutes
  max: 200,
  // Increased limit for development
  message: {
    error: "Too many requests from this IP, please try again later."
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    return process.env.NODE_ENV === "development" && req.path.includes("/auth/");
  }
});
var authLimiter = rateLimit({
  windowMs: 15 * 60 * 1e3,
  // 15 minutes
  max: process.env.NODE_ENV === "development" ? 50 : 5,
  // More lenient in development
  message: {
    error: "Too many login attempts, please try again later."
  },
  skipSuccessfulRequests: true
});
var paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1e3,
  // 15 minutes
  max: 10,
  // Limit payment attempts
  message: {
    error: "Too many payment attempts, please try again later."
  }
});
var uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1e3,
  // 1 hour
  max: 20,
  // Limit file uploads
  message: {
    error: "Too many upload attempts, please try again later."
  }
});
var validateProductCreation = [
  body("name").trim().isLength({ min: 2, max: 100 }).withMessage("Product name must be between 2 and 100 characters").matches(/^[a-zA-Z0-9\s\-_&.,()]+$/).withMessage("Product name contains invalid characters"),
  body("description").trim().isLength({ min: 10, max: 2e3 }).withMessage("Description must be between 10 and 2000 characters"),
  body("price").isFloat({ min: 0.01, max: 1e4 }).withMessage("Price must be a valid amount between $0.01 and $10,000"),
  body("stockQuantity").isInt({ min: 0, max: 1e4 }).withMessage("Stock quantity must be a valid number between 0 and 10,000"),
  body("roastLevel").optional().isIn(["light", "medium-light", "medium", "medium-dark", "dark"]).withMessage("Invalid roast level"),
  body("origin").optional().trim().isLength({ max: 100 }).matches(/^[a-zA-Z\s\-,]+$/).withMessage("Origin contains invalid characters")
];
var validateRoasterApplication = [
  body("businessName").trim().isLength({ min: 2, max: 100 }).withMessage("Business name must be between 2 and 100 characters").matches(/^[a-zA-Z0-9\s\-_&.,()]+$/).withMessage("Business name contains invalid characters"),
  body("contactEmail").isEmail().normalizeEmail().withMessage("Valid email address required"),
  body("contactPhone").optional().matches(/^[\d\s\-\+\(\)]+$/).withMessage("Invalid phone number format"),
  body("yearsExperience").isInt({ min: 0, max: 100 }).withMessage("Years of experience must be between 0 and 100"),
  body("businessDescription").optional().trim().isLength({ max: 1e3 }).withMessage("Business description must not exceed 1000 characters")
];
var validateCartOperation = [
  body("productId").isInt({ min: 1 }).withMessage("Valid product ID required"),
  body("quantity").isInt({ min: 1, max: 100 }).withMessage("Quantity must be between 1 and 100")
];
var validatePaymentIntent = [
  body("amount").isFloat({ min: 0.5, max: 5e4 }).withMessage("Payment amount must be between $0.50 and $50,000"),
  body("cartItems").optional().isArray({ max: 50 }).withMessage("Cart items must be an array with max 50 items"),
  body("cartItems.*.productId").optional().isInt({ min: 1 }).withMessage("Valid product ID required for each item"),
  body("cartItems.*.quantity").optional().isInt({ min: 1, max: 100 }).withMessage("Valid quantity required for each item")
];
var validateIdParam = [
  param("id").isInt({ min: 1 }).withMessage("Valid ID required")
];
var validatePaginationQuery = [
  query("page").optional().isInt({ min: 1, max: 1e3 }).withMessage("Page must be between 1 and 1000"),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100")
];
var handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: "Validation failed",
      details: errors.array().map((error) => ({
        field: error.type === "field" ? error.path : error.type,
        message: error.msg
      }))
    });
  }
  next();
};
function setupSecurity(app2) {
  app2.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:", "blob:"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "'unsafe-eval'",
          "https://js.stripe.com",
          // Allow Replit scripts only in development
          ...process.env.NODE_ENV !== "production" ? ["https://replit.com"] : []
        ],
        connectSrc: ["'self'", "https://api.stripe.com", "https://q.stripe.com", "wss:", "ws:"],
        frameSrc: ["'self'", "https://js.stripe.com", "https://hooks.stripe.com"],
        mediaSrc: ["'self'", "https://ssl.gstatic.com", "data:", "blob:"]
      }
    },
    crossOriginEmbedderPolicy: false
    // Needed for Stripe
  }));
  app2.use("/api/", generalLimiter);
  app2.use(mongoSanitize({
    replaceWith: "_",
    onSanitize: ({ req, key }) => {
      console.warn(`Sanitized input for key: ${key} from IP: ${req.ip}`);
    }
  }));
  app2.use((req, res, next) => {
    res.removeHeader("X-Powered-By");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    next();
  });
}
var sessionSecurityConfig = {
  name: "roastah_session",
  // Don't use default session name
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    // HTTPS only in production
    httpOnly: true,
    // Prevent XSS
    maxAge: 24 * 60 * 60 * 1e3,
    // 24 hours
    sameSite: "strict"
    // CSRF protection
  }
};
function enhancedAuthCheck(req, res, next) {
  if (!req.isAuthenticated()) {
    if (!req.path.includes("/auth/")) {
      console.warn(`Unauthorized access attempt from IP: ${req.ip} to ${req.path}`);
    }
    return res.status(401).json({ error: "Authentication required" });
  }
  const user = req.user;
  const hasValidUser = user?.id || user?.claims?.sub || user?.sub;
  if (!hasValidUser) {
    console.warn(`Invalid session data from IP: ${req.ip}`);
    req.logout((err) => {
      if (err) console.error("Logout error:", err);
    });
    return res.status(401).json({ error: "Invalid session" });
  }
  next();
}
function requireRole(role) {
  return async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }
    const user = req.user;
    const userId = user.claims.sub;
    try {
      if (role === "roaster") {
        const { storage: storage2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
        const user2 = await storage2.getUser(userId);
        const roaster = await storage2.getRoasterByUserId(userId);
        if (!roaster || !user2?.isRoasterApproved) {
          return res.status(403).json({ error: "Roaster access required" });
        }
      }
      if (role === "admin") {
        return res.status(403).json({ error: "Admin access required" });
      }
      next();
    } catch (error) {
      console.error("Role check error:", error);
      res.status(500).json({ error: "Authorization check failed" });
    }
  };
}

// server/mfa.ts
init_storage();
import speakeasy from "speakeasy";
import QRCode from "qrcode";
async function generateMFASetup(userId, userEmail) {
  const secret = speakeasy.generateSecret({
    name: `Roastah (${userEmail})`,
    issuer: "Roastah Marketplace",
    length: 32
  });
  const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);
  const backupCodes = Array.from(
    { length: 8 },
    () => Math.random().toString(36).substring(2, 8).toUpperCase()
  );
  return {
    secret: secret.base32,
    qrCodeUrl,
    backupCodes
  };
}
function verifyMFAToken(secret, token) {
  return speakeasy.totp.verify({
    secret,
    encoding: "base32",
    token,
    window: 2
    // Allow 1 step before and after current time
  });
}
async function verifyBackupCode(userId, code) {
  try {
    const user = await storage.getUser(userId);
    if (!user?.backupCodes) return false;
    const codeIndex = user.backupCodes.indexOf(code.toUpperCase());
    if (codeIndex === -1) return false;
    const updatedCodes = user.backupCodes.filter((_, index2) => index2 !== codeIndex);
    await storage.updateUserMFA(userId, {
      backupCodes: updatedCodes,
      lastBackupCodeUsed: /* @__PURE__ */ new Date()
    });
    return true;
  } catch (error) {
    console.error("Backup code verification error:", error);
    return false;
  }
}
function requireStepUpAuth(req, res, next) {
  const stepUpTimestamp = req.session?.stepUpVerifiedAt;
  if (!stepUpTimestamp || Date.now() - stepUpTimestamp > 15 * 60 * 1e3) {
    return res.status(403).json({
      error: "Recent authentication required",
      requiresStepUp: true
    });
  }
  next();
}
async function hasMFAEnabled(userId) {
  try {
    const user = await storage.getUser(userId);
    return !!(user?.mfaEnabled && user?.mfaSecret);
  } catch (error) {
    console.error("MFA check error:", error);
    return false;
  }
}
function logSecurityEvent(userId, event, details, req) {
  const logEntry = {
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    userId: userId || "anonymous",
    event,
    details,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
    path: req.path,
    method: req.method
  };
  console.log("SECURITY_EVENT:", JSON.stringify(logEntry));
  if (["login_failed", "mfa_failed", "suspicious_activity"].includes(event)) {
  }
}

// server/routes.ts
init_schema();

// server/medusa-bridge.ts
init_storage();
var MedusaBridge = class {
  app;
  constructor(app2) {
    this.app = app2;
  }
  // Convert existing products to MedusaJS format
  async syncProductsToMedusa() {
    const products3 = await storage.getProducts();
    const medusaProducts = [];
    for (const product of products3) {
      const roaster = await storage.getRoasterByUserId(product.roasterId.toString());
      const medusaProduct = {
        title: product.name,
        description: product.description,
        handle: product.name.toLowerCase().replace(/\s+/g, "-"),
        status: product.isActive ? "published" : "draft",
        variants: [{
          title: "Default Variant",
          prices: [{
            currency_code: "usd",
            amount: parseFloat(product.price) * 100
            // Convert to cents
          }],
          inventory_quantity: product.stockQuantity,
          manage_inventory: true,
          options: [
            { value: "whole_bean" },
            { value: "ground" }
          ]
        }],
        options: [{
          title: "Grind",
          values: [
            { value: "whole_bean" },
            { value: "ground" }
          ]
        }],
        metadata: {
          roaster_id: product.roasterId,
          roaster_name: roaster?.businessName || "Unknown Roaster",
          origin: product.origin,
          roast_level: product.roastLevel,
          process: product.process,
          altitude: product.altitude,
          varietal: product.varietal,
          tasting_notes: product.tastingNotes
        },
        images: product.images ? product.images.map((url) => ({ url })) : []
      };
      medusaProducts.push(medusaProduct);
    }
    return medusaProducts;
  }
  // Convert MedusaJS orders back to Roastah format
  async syncOrdersFromMedusa(medusaOrders) {
    const roastahOrders = [];
    for (const order of medusaOrders) {
      const roastahOrder = {
        userId: order.customer_id,
        totalAmount: (order.total / 100).toString(),
        // Convert from cents
        status: this.mapMedusaOrderStatus(order.status),
        shippingAddress: {
          firstName: order.shipping_address.first_name,
          lastName: order.shipping_address.last_name,
          address: order.shipping_address.address_1,
          city: order.shipping_address.city,
          state: order.shipping_address.province,
          zipCode: order.shipping_address.postal_code,
          email: order.email
        },
        items: order.items.map((item) => ({
          productId: parseInt(item.variant.product.metadata.roaster_product_id || "0"),
          quantity: item.quantity,
          price: (item.unit_price / 100).toString(),
          grindSize: item.variant.options?.find((opt) => opt.option.title === "Grind")?.value || "whole_bean"
        }))
      };
      roastahOrders.push(roastahOrder);
    }
    return roastahOrders;
  }
  mapMedusaOrderStatus(medusaStatus) {
    const statusMap = {
      "pending": "pending",
      "completed": "completed",
      "canceled": "cancelled",
      "requires_action": "processing"
    };
    return statusMap[medusaStatus] || "pending";
  }
  // Setup routes for MedusaJS integration
  setupRoutes() {
    this.app.post("/api/medusa/sync-products", async (req, res) => {
      try {
        const products3 = await this.syncProductsToMedusa();
        res.json({ message: "Products synced successfully", count: products3.length });
      } catch (error) {
        console.error("Error syncing products:", error);
        res.status(500).json({ error: "Failed to sync products" });
      }
    });
    this.app.post("/api/medusa/webhook/orders", async (req, res) => {
      try {
        const { event, data } = req.body;
        if (event === "order.placed") {
          const roastahOrders = await this.syncOrdersFromMedusa([data]);
          for (const orderData of roastahOrders) {
            await storage.createOrder(orderData);
          }
        }
        res.status(200).json({ received: true });
      } catch (error) {
        console.error("Error processing webhook:", error);
        res.status(500).json({ error: "Failed to process webhook" });
      }
    });
    this.app.get("/api/medusa/products", async (req, res) => {
      try {
        const products3 = await this.syncProductsToMedusa();
        res.json({ products: products3 });
      } catch (error) {
        console.error("Error fetching MedusaJS products:", error);
        res.status(500).json({ error: "Failed to fetch products" });
      }
    });
  }
};

// server/realtime.ts
init_storage();
import WebSocket from "ws";
import { WebSocketServer } from "ws";
var RealtimeService = class {
  wss = null;
  connections = /* @__PURE__ */ new Map();
  heartbeatInterval = null;
  initialize(server) {
    this.wss = new WebSocketServer({
      server,
      path: "/ws",
      verifyClient: (info) => {
        return true;
      }
    });
    this.wss.on("connection", this.handleConnection.bind(this));
    this.setupHeartbeat();
    console.log("Real-time WebSocket server initialized on /ws");
  }
  async handleConnection(ws2, request) {
    const connectionId = this.generateConnectionId();
    ws2.connectionId = connectionId;
    ws2.isAlive = true;
    ws2.on("pong", () => {
      ws2.isAlive = true;
    });
    ws2.on("message", async (data) => {
      try {
        const message = JSON.parse(data);
        await this.handleMessage(ws2, message);
      } catch (error) {
        console.error("Invalid WebSocket message:", error);
        ws2.send(JSON.stringify({ error: "Invalid message format" }));
      }
    });
    ws2.on("close", () => {
      this.removeConnection(ws2);
    });
    ws2.on("error", (error) => {
      console.error("WebSocket error:", error);
      this.removeConnection(ws2);
    });
    ws2.send(JSON.stringify({
      type: "connection_established",
      connectionId,
      timestamp: /* @__PURE__ */ new Date()
    }));
  }
  async handleMessage(ws2, message) {
    switch (message.type) {
      case "authenticate":
        await this.authenticateConnection(ws2, message.userId, message.token);
        break;
      case "subscribe_order":
        await this.subscribeToOrder(ws2, message.orderId);
        break;
      case "subscribe_notifications":
        await this.subscribeToNotifications(ws2);
        break;
      case "ping":
        ws2.send(JSON.stringify({ type: "pong", timestamp: /* @__PURE__ */ new Date() }));
        break;
      default:
        ws2.send(JSON.stringify({ error: "Unknown message type" }));
    }
  }
  async authenticateConnection(ws2, userId, token) {
    try {
      if (!userId) {
        ws2.send(JSON.stringify({ error: "Invalid authentication" }));
        return;
      }
      const user = await storage.getUser(userId);
      if (!user) {
        ws2.send(JSON.stringify({ error: "User not found" }));
        return;
      }
      ws2.userId = userId;
      if (!this.connections.has(userId)) {
        this.connections.set(userId, []);
      }
      this.connections.get(userId).push(ws2);
      await storage.createRealtimeConnection({
        userId,
        connectionId: ws2.connectionId,
        deviceInfo: { userAgent: "web" }
      });
      ws2.send(JSON.stringify({
        type: "authenticated",
        userId,
        timestamp: /* @__PURE__ */ new Date()
      }));
      console.log(`User ${userId} connected via WebSocket`);
    } catch (error) {
      console.error("Authentication error:", error);
      ws2.send(JSON.stringify({ error: "Authentication failed" }));
    }
  }
  async subscribeToOrder(ws2, orderId) {
    if (!ws2.userId) {
      ws2.send(JSON.stringify({ error: "Not authenticated" }));
      return;
    }
    const order = await storage.getOrderById(orderId);
    if (!order || order.userId !== ws2.userId) {
      ws2.send(JSON.stringify({ error: "Order not found or access denied" }));
      return;
    }
    const tracking = await storage.getOrderTracking(orderId);
    ws2.send(JSON.stringify({
      type: "order_subscribed",
      orderId,
      tracking,
      timestamp: /* @__PURE__ */ new Date()
    }));
  }
  async subscribeToNotifications(ws2) {
    if (!ws2.userId) {
      ws2.send(JSON.stringify({ error: "Not authenticated" }));
      return;
    }
    const notifications3 = await storage.getNotificationsByUserId(ws2.userId);
    const unreadNotifications = notifications3.filter((n) => !n.isRead);
    ws2.send(JSON.stringify({
      type: "notifications_subscribed",
      notifications: unreadNotifications,
      timestamp: /* @__PURE__ */ new Date()
    }));
  }
  // Public methods for broadcasting updates
  async broadcastOrderUpdate(orderId, tracking) {
    const order = await storage.getOrderById(orderId);
    if (!order) return;
    const message = {
      type: "tracking_update",
      data: { orderId, tracking, order },
      timestamp: /* @__PURE__ */ new Date()
    };
    await this.sendToUser(order.userId, message);
    const orderItems2 = await storage.getOrderItemsByOrder(orderId);
    for (const item of orderItems2) {
      const product = await storage.getProductById(item.productId);
      if (product) {
        const roaster = await storage.getRoasterById(product.roasterId);
        if (roaster) {
          await this.sendToUser(roaster.userId, message);
        }
      }
    }
  }
  async broadcastNotification(notification) {
    const message = {
      type: "notification",
      data: notification,
      timestamp: /* @__PURE__ */ new Date()
    };
    await this.sendToUser(notification.userId, message);
  }
  async broadcastOrderStatusChange(orderId, newStatus, oldStatus) {
    const order = await storage.getOrderById(orderId);
    if (!order) return;
    const message = {
      type: "status_change",
      data: { orderId, newStatus, oldStatus, order },
      timestamp: /* @__PURE__ */ new Date()
    };
    await this.sendToUser(order.userId, message);
  }
  async sendToUser(userId, message) {
    const userConnections = this.connections.get(userId);
    if (!userConnections || userConnections.length === 0) return;
    const messageStr = JSON.stringify(message);
    for (const ws2 of userConnections) {
      if (ws2.readyState === WebSocket.OPEN) {
        try {
          ws2.send(messageStr);
        } catch (error) {
          console.error("Error sending message to user:", error);
          this.removeConnection(ws2);
        }
      }
    }
  }
  removeConnection(ws2) {
    if (ws2.userId) {
      const userConnections = this.connections.get(ws2.userId);
      if (userConnections) {
        const index2 = userConnections.indexOf(ws2);
        if (index2 > -1) {
          userConnections.splice(index2, 1);
        }
        if (userConnections.length === 0) {
          this.connections.delete(ws2.userId);
        }
      }
    }
  }
  setupHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (!this.wss) return;
      this.wss.clients.forEach((ws2) => {
        if (ws2.isAlive === false) {
          this.removeConnection(ws2);
          return ws2.terminate();
        }
        ws2.isAlive = false;
        ws2.ping();
      });
    }, 3e4);
  }
  generateConnectionId() {
    return `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  getConnectedUsers() {
    return Array.from(this.connections.keys());
  }
  getUserConnectionCount(userId) {
    return this.connections.get(userId)?.length || 0;
  }
  shutdown() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    if (this.wss) {
      this.wss.close();
    }
  }
};
var realtimeService = new RealtimeService();

// server/routes.ts
init_schema();
import { z as z2 } from "zod";
var stripe = null;
async function registerRoutes(app2) {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("Missing required Stripe secret: STRIPE_SECRET_KEY");
  }
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-05-28.basil"
  });
  const { isAuthenticated: isAuthenticated2 } = await setupAuthentication(app2);
  app2.get("/api/config", async (req, res) => {
    try {
      const { getSecret: getSecret2 } = await Promise.resolve().then(() => (init_secrets(), secrets_exports));
      const stripePublicKey = await getSecret2("VITE_STRIPE_PUBLIC_KEY");
      if (!stripePublicKey) {
        console.error("VITE_STRIPE_PUBLIC_KEY not found in secrets");
        return res.status(500).json({ error: "Stripe configuration not available" });
      }
      res.json({
        stripe: {
          publicKey: stripePublicKey
        }
      });
    } catch (error) {
      console.error("Error loading configuration:", error);
      res.status(500).json({ error: "Failed to load configuration" });
    }
  });
  const medusaBridge = new MedusaBridge(app2);
  medusaBridge.setupRoutes();
  app2.get("/api/auth/user", async (req, res) => {
    try {
      const userId = req.session?.user?.sub || req.user?.id || req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      let roaster = null;
      if (user?.role === "roaster") {
        roaster = await storage.getRoasterByUserId(userId);
      }
      const response = {
        ...user,
        roaster,
        mfaRequired: !!(roaster || user?.role === "admin"),
        hasMFA: await hasMFAEnabled(userId)
      };
      res.json(response);
    } catch (error) {
      console.error("Error fetching user:", error);
      logSecurityEvent(req.user?.claims?.sub, "user_fetch_error", { error: String(error) }, req);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  app2.post("/api/auth/mfa/setup", authLimiter, enhancedAuthCheck, async (req, res) => {
    try {
      const userId = req.session.user?.sub || req.user?.id;
      const user = await storage.getUser(userId);
      if (!user?.email) {
        return res.status(400).json({ error: "Email required for MFA setup" });
      }
      if (user.mfaEnabled) {
        return res.status(400).json({ error: "MFA already enabled" });
      }
      const mfaSetup = await generateMFASetup(userId, user.email);
      await storage.updateUserMFA(userId, {
        mfaSecret: mfaSetup.secret,
        backupCodes: mfaSetup.backupCodes
      });
      logSecurityEvent(userId, "mfa_setup_initiated", {}, req);
      res.json({
        qrCodeUrl: mfaSetup.qrCodeUrl,
        backupCodes: mfaSetup.backupCodes,
        secret: mfaSetup.secret
        // For manual entry
      });
    } catch (error) {
      console.error("MFA setup error:", error);
      res.status(500).json({ error: "Failed to setup MFA" });
    }
  });
  app2.post("/api/auth/mfa/verify-setup", authLimiter, enhancedAuthCheck, async (req, res) => {
    try {
      const { token } = req.body;
      const userId = req.session.user?.sub || req.user?.id;
      const user = await storage.getUser(userId);
      if (!user?.mfaSecret) {
        return res.status(400).json({ error: "MFA setup not initiated" });
      }
      if (!verifyMFAToken(user.mfaSecret, token)) {
        logSecurityEvent(userId, "mfa_setup_failed", { token: token.substring(0, 2) + "****" }, req);
        return res.status(400).json({ error: "Invalid verification code" });
      }
      await storage.updateUserMFA(userId, { mfaEnabled: true });
      logSecurityEvent(userId, "mfa_enabled", {}, req);
      res.json({ success: true, message: "MFA enabled successfully" });
    } catch (error) {
      console.error("MFA verification error:", error);
      res.status(500).json({ error: "Failed to verify MFA" });
    }
  });
  app2.post("/api/auth/mfa/verify", authLimiter, enhancedAuthCheck, async (req, res) => {
    try {
      const { token, backupCode } = req.body;
      const userId = req.session.user?.sub || req.user?.id;
      const user = await storage.getUser(userId);
      if (!user?.mfaEnabled || !user?.mfaSecret) {
        return res.status(400).json({ error: "MFA not enabled" });
      }
      let verified = false;
      if (token) {
        verified = verifyMFAToken(user.mfaSecret, token);
      }
      if (!verified && backupCode) {
        verified = await verifyBackupCode(userId, backupCode);
      }
      if (!verified) {
        logSecurityEvent(userId, "mfa_verification_failed", {
          hasToken: !!token,
          hasBackupCode: !!backupCode
        }, req);
        return res.status(400).json({ error: "Invalid verification code" });
      }
      req.session.mfaVerified = true;
      req.session.mfaVerifiedAt = Date.now();
      logSecurityEvent(userId, "mfa_verified", {}, req);
      res.json({ success: true, message: "MFA verified successfully" });
    } catch (error) {
      console.error("MFA verification error:", error);
      res.status(500).json({ error: "Failed to verify MFA" });
    }
  });
  app2.post("/api/auth/mfa/disable", authLimiter, enhancedAuthCheck, requireStepUpAuth, async (req, res) => {
    try {
      const { token, backupCode } = req.body;
      const userId = req.session.user?.sub || req.user?.id;
      const user = await storage.getUser(userId);
      if (!user?.mfaEnabled) {
        return res.status(400).json({ error: "MFA not enabled" });
      }
      let verified = false;
      if (token && user.mfaSecret) {
        verified = verifyMFAToken(user.mfaSecret, token);
      }
      if (!verified && backupCode) {
        verified = await verifyBackupCode(userId, backupCode);
      }
      if (!verified) {
        logSecurityEvent(userId, "mfa_disable_failed", {}, req);
        return res.status(400).json({ error: "MFA verification required to disable" });
      }
      await storage.updateUserMFA(userId, {
        mfaEnabled: false,
        mfaSecret: void 0,
        backupCodes: void 0
      });
      req.session.mfaVerified = false;
      delete req.session.mfaVerifiedAt;
      logSecurityEvent(userId, "mfa_disabled", {}, req);
      res.json({ success: true, message: "MFA disabled successfully" });
    } catch (error) {
      console.error("MFA disable error:", error);
      res.status(500).json({ error: "Failed to disable MFA" });
    }
  });
  app2.post("/api/auth/step-up", authLimiter, enhancedAuthCheck, async (req, res) => {
    try {
      const { token, backupCode } = req.body;
      const userId = req.session.user?.sub || req.user?.id;
      const user = await storage.getUser(userId);
      if (user?.mfaEnabled) {
        let verified = false;
        if (token && user.mfaSecret) {
          verified = verifyMFAToken(user.mfaSecret, token);
        }
        if (!verified && backupCode) {
          verified = await verifyBackupCode(userId, backupCode);
        }
        if (!verified) {
          logSecurityEvent(userId, "step_up_failed", {}, req);
          return res.status(400).json({ error: "Invalid verification code" });
        }
      }
      req.session.stepUpVerifiedAt = Date.now();
      logSecurityEvent(userId, "step_up_verified", {}, req);
      res.json({ success: true, message: "Step-up authentication successful" });
    } catch (error) {
      console.error("Step-up auth error:", error);
      res.status(500).json({ error: "Failed to verify step-up authentication" });
    }
  });
  app2.get("/api/dev/check-adc", async (req, res) => {
    const isLocal = req.get("host")?.includes("localhost");
    const isReplit = process.env.REPL_ID !== void 0;
    const isCloudRunDev = process.env.K_SERVICE !== void 0 && req.get("host")?.includes("roastah-d");
    const isDev = isLocal || isReplit || isCloudRunDev;
    if (!isDev) {
      return res.status(404).json({ error: "Not found" });
    }
    if (req.get("host")?.includes("localhost")) {
      console.log("ADC check: Localhost detected, skipping Google Cloud credentials check");
      return res.json({ hasCredentials: true });
    }
    const isCloudRun3 = process.env.K_SERVICE !== void 0;
    if (isCloudRun3) {
      try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
          return res.json({ hasCredentials: false, requiresAuth: true });
        }
        const { OAuth2Client } = await import("google-auth-library");
        const client2 = new OAuth2Client();
        const token = authHeader.substring(7);
        const ticket = await client2.verifyIdToken({
          idToken: token
        });
        const payload = ticket.getPayload();
        if (!payload) {
          throw new Error("Invalid token payload");
        }
        const authorizedEmails = (process.env.DEV_AUTHORIZED_EMAILS || "").split(",").map((e) => e.trim());
        if (authorizedEmails.length > 0 && !authorizedEmails.includes(payload.email || "")) {
          return res.json({ hasCredentials: false, unauthorized: true });
        }
      } catch (error) {
        return res.json({ hasCredentials: false, authError: true });
      }
    }
    try {
      const { SecretManagerServiceClient: SecretManagerServiceClient2 } = await import("@google-cloud/secret-manager");
      const client2 = new SecretManagerServiceClient2();
      const testSecretName = `projects/${process.env.GOOGLE_CLOUD_PROJECT || "roastah-d"}/secrets/DATABASE_URL/versions/latest`;
      await client2.accessSecretVersion({ name: testSecretName });
      res.json({ hasCredentials: true });
    } catch (error) {
      console.log("ADC check failed:", error?.message || String(error));
      res.json({ hasCredentials: false });
    }
  });
  app2.post("/api/dev/impersonate", async (req, res) => {
    const isLocal = req.get("host")?.includes("localhost");
    const isReplit = process.env.REPL_ID !== void 0;
    const isCloudRunDev = process.env.K_SERVICE !== void 0 && req.get("host")?.includes("roastah-d");
    const isDev = isLocal || isReplit || isCloudRunDev;
    console.log("\u{1F527} Impersonation request - isLocal:", isLocal, "isReplit:", isReplit, "isCloudRunDev:", isCloudRunDev, "isDev:", isDev);
    if (!isDev) {
      return res.status(404).json({ error: "Not found" });
    }
    const isCloudRun3 = process.env.K_SERVICE !== void 0;
    if (isCloudRun3) {
      const isAuthenticated3 = req.user?.id || req.session?.user?.sub || req.session?.passport?.user;
      if (!isAuthenticated3) {
        return res.status(401).json({ error: "Please log in first to access impersonation features" });
      }
      const userInfo = req.user?.email || req.session?.user?.email || "authenticated user";
      console.log(`\u{1F510} Authenticated user accessing impersonation: ${userInfo}`);
    }
    try {
      const { userType } = req.body;
      if (!["buyer", "seller"].includes(userType)) {
        return res.status(400).json({ error: "Invalid user type" });
      }
      const devUserId = userType === "seller" ? "dev-seller-001" : "dev-buyer-001";
      const devUserData = {
        id: devUserId,
        email: userType === "seller" ? "dev-seller@roastah.com" : "dev-buyer@roastah.com",
        firstName: userType === "seller" ? "Development" : "Development",
        lastName: userType === "seller" ? "Seller" : "Buyer",
        role: userType === "seller" ? "roaster" : "user",
        isRoasterApproved: userType === "seller",
        mfaEnabled: false
      };
      await storage.upsertUser(devUserData);
      if (userType === "seller") {
        const existingRoaster = await storage.getRoasterByUserId(devUserId);
        if (!existingRoaster) {
          const roaster = await storage.createRoaster({
            userId: devUserId,
            businessName: "Development Coffee Roasters",
            businessType: "home_roaster",
            description: "A development roastery for testing purposes"
          });
          const sampleProducts = [
            {
              roasterId: roaster.id,
              name: "Ethiopia Yirgacheffe",
              description: "Bright and floral with notes of lemon and tea",
              price: "18.99",
              stockQuantity: 100,
              origin: "Ethiopia",
              roastLevel: "Light",
              process: "Washed",
              altitude: "1700-2100m",
              varietal: "Heirloom",
              tastingNotes: "Lemon, bergamot, floral, tea-like",
              state: "published",
              images: ["/images/sample-coffee-1.jpg"]
            },
            {
              roasterId: roaster.id,
              name: "Colombia Huila",
              description: "Sweet and balanced with chocolate notes",
              price: "16.99",
              stockQuantity: 85,
              origin: "Colombia",
              roastLevel: "Medium",
              process: "Washed",
              altitude: "1200-1800m",
              varietal: "Caturra, Typica",
              tastingNotes: "Milk chocolate, caramel, orange",
              state: "published",
              images: ["/images/sample-coffee-2.jpg"]
            },
            {
              roasterId: roaster.id,
              name: "Guatemala Antigua",
              description: "Full-bodied with smoky undertones",
              price: "17.99",
              stockQuantity: 60,
              origin: "Guatemala",
              roastLevel: "Dark",
              process: "Washed",
              altitude: "1500-1700m",
              varietal: "Bourbon, Typica",
              tastingNotes: "Dark chocolate, smoke, spice",
              state: "published",
              images: ["/images/sample-coffee-3.jpg"]
            }
          ];
          for (const product of sampleProducts) {
            await storage.createProduct(product);
          }
        }
      }
      if (req.session) {
        req.session.user = {
          id: devUserId,
          email: devUserData.email,
          name: `${devUserData.firstName} ${devUserData.lastName}`,
          sub: devUserId
        };
        req.session.tokens = {
          accessToken: "dev-access-token",
          refreshToken: "dev-refresh-token"
        };
        req.user = {
          claims: {
            sub: devUserId,
            email: devUserData.email,
            name: `${devUserData.firstName} ${devUserData.lastName}`,
            role: devUserData.role
          }
        };
      }
      res.json({
        success: true,
        user: {
          ...devUserData,
          name: `${devUserData.firstName} ${devUserData.lastName}`
        },
        message: `Successfully impersonating ${userType}`
      });
    } catch (error) {
      console.error("Impersonation error:", error);
      res.status(500).json({ error: "Failed to impersonate user" });
    }
  });
  app2.get("/api/products", async (req, res) => {
    try {
      const { roastLevel, origin, minPrice, maxPrice } = req.query;
      const filters = {};
      if (roastLevel) filters.roastLevel = roastLevel;
      if (origin) filters.origin = origin;
      if (minPrice) filters.minPrice = parseFloat(minPrice);
      if (maxPrice) filters.maxPrice = parseFloat(maxPrice);
      const products3 = await storage.getProducts(filters);
      res.json(products3);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });
  app2.get("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProductById(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });
  app2.post("/api/roaster/apply", authLimiter, enhancedAuthCheck, validateRoasterApplication, handleValidationErrors, async (req, res) => {
    try {
      const userId = req.session.user?.sub || req.user?.id;
      const validatedData = insertRoasterSchema.parse({
        ...req.body,
        userId
      });
      const roaster = await storage.createRoaster(validatedData);
      res.json(roaster);
    } catch (error) {
      console.error("Error creating roaster:", error);
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create roaster application" });
    }
  });
  app2.get("/api/roaster/products", isAuthenticated2, async (req, res) => {
    try {
      const userId = req.session.user?.sub || req.user?.id;
      const roaster = await storage.getRoasterByUserId(userId);
      if (!roaster) {
        return res.status(404).json({ message: "Roaster not found" });
      }
      const products3 = await storage.getProductsByRoaster(roaster.id);
      res.json(products3);
    } catch (error) {
      console.error("Error fetching roaster products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });
  app2.post("/api/roaster/products", authLimiter, enhancedAuthCheck, requireRole("roaster"), validateProductCreation, handleValidationErrors, async (req, res) => {
    try {
      const userId = req.session.user?.sub || req.user?.id;
      const roaster = await storage.getRoasterByUserId(userId);
      if (!roaster) {
        return res.status(404).json({ message: "Roaster not found" });
      }
      const validatedData = insertProductSchema.parse({
        ...req.body,
        roasterId: roaster.id
      });
      const product = await storage.createProduct(validatedData);
      res.json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create product" });
    }
  });
  app2.get("/api/roaster/products/:id", isAuthenticated2, async (req, res) => {
    try {
      const userId = req.session.user?.sub || req.user?.id;
      const productId = parseInt(req.params.id);
      const roaster = await storage.getRoasterByUserId(userId);
      if (!roaster) {
        return res.status(404).json({ message: "Roaster not found" });
      }
      const product = await storage.getProductById(productId);
      if (!product || product.roasterId !== roaster.id) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });
  app2.put("/api/roaster/products/:id", authLimiter, enhancedAuthCheck, requireRole("roaster"), validateProductCreation, handleValidationErrors, async (req, res) => {
    try {
      const userId = req.session.user?.sub || req.user?.id;
      const productId = parseInt(req.params.id);
      const roaster = await storage.getRoasterByUserId(userId);
      if (!roaster) {
        return res.status(404).json({ message: "Roaster not found" });
      }
      const existingProduct = await storage.getProductById(productId);
      if (!existingProduct || existingProduct.roasterId !== roaster.id) {
        return res.status(404).json({ message: "Product not found" });
      }
      const validatedData = insertProductSchema.partial().parse({
        ...req.body,
        roasterId: roaster.id
      });
      const product = await storage.updateProduct(productId, validatedData);
      res.json(product);
    } catch (error) {
      console.error("Error updating product:", error);
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update product" });
    }
  });
  app2.patch("/api/roaster/products/:id", authLimiter, enhancedAuthCheck, requireRole("roaster"), async (req, res) => {
    try {
      const userId = req.session.user?.sub || req.user?.id;
      const productId = parseInt(req.params.id);
      const roaster = await storage.getRoasterByUserId(userId);
      if (!roaster) {
        return res.status(404).json({ message: "Roaster not found" });
      }
      const existingProduct = await storage.getProductById(productId);
      if (!existingProduct || existingProduct.roasterId !== roaster.id) {
        return res.status(404).json({ message: "Product not found" });
      }
      const validatedData = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(productId, validatedData);
      res.json(product);
    } catch (error) {
      console.error("Error updating product:", error);
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update product" });
    }
  });
  app2.delete("/api/roaster/products/:id", isAuthenticated2, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteProduct(id);
      res.json({ message: "Product deleted" });
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: "Failed to delete product" });
    }
  });
  app2.patch("/api/roaster/products/:id/state", isAuthenticated2, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { state } = req.body;
      const userId = req.session.user?.sub || req.user?.id;
      const roaster = await storage.getRoasterByUserId(userId);
      if (!roaster) {
        return res.status(404).json({ message: "Roaster not found" });
      }
      const validStates = ["draft", "pending_review", "published", "archived", "rejected"];
      if (!validStates.includes(state)) {
        return res.status(400).json({ message: "Invalid state" });
      }
      const product = await storage.updateProduct(id, { state });
      res.json(product);
    } catch (error) {
      console.error("Error updating product state:", error);
      res.status(500).json({ message: "Failed to update product state" });
    }
  });
  app2.patch("/api/roaster/products/:id/tags", isAuthenticated2, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.session.user?.sub || req.user?.id;
      const roaster = await storage.getRoasterByUserId(userId);
      if (!roaster) {
        return res.status(404).json({ message: "Roaster not found" });
      }
      const validTags = ["isUnlisted", "isPreorder", "isPrivate", "isOutOfStock", "isScheduled"];
      const tagUpdates = {};
      for (const [key, value] of Object.entries(req.body)) {
        if (validTags.includes(key) && typeof value === "boolean") {
          tagUpdates[key] = value;
        }
      }
      if (Object.keys(tagUpdates).length === 0) {
        return res.status(400).json({ message: "No valid tag updates provided" });
      }
      const product = await storage.updateProduct(id, tagUpdates);
      res.json(product);
    } catch (error) {
      console.error("Error updating product tags:", error);
      res.status(500).json({ message: "Failed to update product tags" });
    }
  });
  app2.get("/api/cart", enhancedAuthCheck, async (req, res) => {
    try {
      const userId = req.session.user?.sub || req.user?.id;
      const cartItems3 = await storage.getCartByUserId(userId);
      res.json(cartItems3);
    } catch (error) {
      console.error("Error fetching cart:", error);
      res.status(500).json({ message: "Failed to fetch cart" });
    }
  });
  app2.post("/api/cart", enhancedAuthCheck, validateCartOperation, handleValidationErrors, async (req, res) => {
    try {
      const userId = req.session.user?.sub || req.user?.id;
      const validatedData = insertCartItemSchema.parse({
        ...req.body,
        userId
      });
      const cartItem = await storage.addToCart(validatedData);
      res.json(cartItem);
    } catch (error) {
      console.error("Error adding to cart:", error);
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to add to cart" });
    }
  });
  app2.put("/api/cart/:id", isAuthenticated2, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { quantity } = req.body;
      if (!quantity || quantity < 1) {
        return res.status(400).json({ message: "Invalid quantity" });
      }
      const cartItem = await storage.updateCartItem(id, quantity);
      res.json(cartItem);
    } catch (error) {
      console.error("Error updating cart item:", error);
      res.status(500).json({ message: "Failed to update cart item" });
    }
  });
  app2.delete("/api/cart/:id", isAuthenticated2, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.removeFromCart(id);
      res.json({ message: "Item removed from cart" });
    } catch (error) {
      console.error("Error removing from cart:", error);
      res.status(500).json({ message: "Failed to remove from cart" });
    }
  });
  app2.get("/api/orders", isAuthenticated2, async (req, res) => {
    try {
      const userId = req.session.user?.sub || req.user?.id;
      const orders3 = await storage.getOrdersByUserId(userId);
      res.json(orders3);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });
  app2.get("/api/roaster/orders", isAuthenticated2, async (req, res) => {
    try {
      const userId = req.session.user?.sub || req.user?.id;
      const roaster = await storage.getRoasterByUserId(userId);
      if (!roaster) {
        return res.status(404).json({ message: "Roaster not found" });
      }
      const orderItems2 = await storage.getOrderItemsByRoaster(roaster.id);
      res.json(orderItems2);
    } catch (error) {
      console.error("Error fetching roaster orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });
  app2.post("/api/create-payment-intent", paymentLimiter, enhancedAuthCheck, validatePaymentIntent, handleValidationErrors, async (req, res) => {
    try {
      const { amount, cartItems: cartItems3, metadata = {} } = req.body;
      if (!stripe) {
        throw new Error("Stripe not initialized");
      }
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        // Convert to cents
        currency: "usd",
        metadata: {
          cartItems: JSON.stringify(cartItems3 || []),
          userId: req.user?.claims?.sub || "",
          ...metadata
        }
      });
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
    }
  });
  app2.post("/api/stripe/webhook", async (req, res) => {
    try {
      const paymentIntent = req.body.data?.object;
      if (req.body.type === "payment_intent.succeeded" && paymentIntent) {
        await processCommissionsAndCreateOrder(paymentIntent);
      }
      res.json({ received: true });
    } catch (error) {
      console.error("Webhook error:", error);
      res.status(500).json({ error: error.message });
    }
  });
  async function processCommissionsAndCreateOrder(paymentIntent) {
    try {
      if (!paymentIntent.metadata.cartItems || !paymentIntent.metadata.userId) return;
      const cartItems3 = JSON.parse(paymentIntent.metadata.cartItems);
      const userId = paymentIntent.metadata.userId;
      const totalAmount = paymentIntent.amount / 100;
      const order = await storage.createOrder({
        userId,
        totalAmount: totalAmount.toString(),
        status: "confirmed",
        stripePaymentIntentId: paymentIntent.id,
        shippingAddress: {}
      });
      for (const item of cartItems3) {
        const product = await storage.getProductById(item.productId);
        if (!product) continue;
        const saleAmount = parseFloat(item.price) * item.quantity;
        const commissionRate = 0.085;
        const commissionAmount = saleAmount * commissionRate;
        const platformFee = commissionAmount;
        const roasterEarnings = saleAmount - platformFee;
        const orderItem = await getDb().insert(orderItems).values({
          orderId: order.id,
          productId: item.productId,
          roasterId: product.roasterId,
          quantity: item.quantity,
          price: item.price,
          status: "processing"
        }).returning();
        await storage.createCommission({
          roasterId: product.roasterId,
          orderId: order.id,
          orderItemId: orderItem[0].id,
          saleAmount: saleAmount.toString(),
          commissionRate: commissionRate.toString(),
          commissionAmount: commissionAmount.toString(),
          platformFee: platformFee.toString(),
          roasterEarnings: roasterEarnings.toString(),
          status: "pending"
        });
        const today = /* @__PURE__ */ new Date();
        today.setHours(0, 0, 0, 0);
        await storage.updateSellerAnalytics(product.roasterId, today, {
          totalSales: saleAmount.toString(),
          totalOrders: 1,
          avgOrderValue: saleAmount.toString()
        });
      }
      await storage.clearCart(userId);
    } catch (error) {
      console.error("Error processing commissions:", error);
    }
  }
  app2.post("/api/admin/process-payouts", isAuthenticated2, async (req, res) => {
    try {
      const pendingCommissions = await getDb().select().from(commissions).where(eq2(commissions.status, "pending"));
      const payoutsByRoaster = /* @__PURE__ */ new Map();
      for (const commission of pendingCommissions) {
        if (!payoutsByRoaster.has(commission.roasterId)) {
          payoutsByRoaster.set(commission.roasterId, []);
        }
        payoutsByRoaster.get(commission.roasterId).push(commission);
      }
      const payoutResults = [];
      for (const [roasterId, roasterCommissions] of Array.from(payoutsByRoaster)) {
        const roaster = await storage.getRoasterByUserId(roasterId.toString());
        if (!roaster) continue;
        const totalPayout = roasterCommissions.reduce((sum, c) => sum + parseFloat(c.roasterEarnings), 0);
        if (totalPayout < 10) continue;
        try {
          console.log(`Processing payout of $${totalPayout} for roaster ${roasterId}`);
          for (const commission of roasterCommissions) {
            await storage.updateCommissionStatus(commission.id, "paid", /* @__PURE__ */ new Date());
          }
          payoutResults.push({
            roasterId,
            roasterName: roaster.businessName,
            amount: totalPayout,
            commissionCount: roasterCommissions.length,
            status: "success"
          });
        } catch (error) {
          payoutResults.push({
            roasterId,
            amount: totalPayout,
            error: error.message,
            status: "failed"
          });
        }
      }
      res.json({
        message: `Processed ${payoutResults.length} payouts`,
        payouts: payoutResults
      });
    } catch (error) {
      res.status(500).json({ message: "Error processing payouts: " + error.message });
    }
  });
  const upload = multer({
    dest: "uploads/",
    limits: {
      fileSize: 10 * 1024 * 1024
      // 10MB limit
    },
    fileFilter: (req, file, cb) => {
      if (file.mimetype === "text/csv" || file.originalname.endsWith(".csv")) {
        cb(null, true);
      } else {
        cb(new Error("Only CSV files are allowed"));
      }
    }
  });
  app2.post("/api/roaster/bulk-upload", isAuthenticated2, upload.single("file"), async (req, res) => {
    try {
      const roaster = await storage.getRoasterByUserId(req.session.user?.sub || req.user?.id);
      if (!roaster) {
        return res.status(403).json({ message: "Roaster profile required" });
      }
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      const bulkUpload = await storage.createBulkUpload({
        roasterId: roaster.id,
        fileName: req.file.originalname,
        status: "processing"
      });
      processCsvFile(req.file.path, bulkUpload.id, roaster.id);
      res.json({
        uploadId: bulkUpload.id,
        message: "File upload started. Processing in background."
      });
    } catch (error) {
      res.status(500).json({ message: "Upload failed: " + error.message });
    }
  });
  async function processCsvFile(filePath, uploadId, roasterId) {
    const results = [];
    const errors = [];
    let totalRows = 0;
    let processedRows = 0;
    let successfulRows = 0;
    try {
      const fileContent = fs.readFileSync(filePath, "utf8");
      const lines = fileContent.split("\n").filter((line) => line.trim());
      totalRows = lines.length - 1;
      await storage.updateBulkUploadStatus(uploadId, "processing", {
        totalRows
      });
      for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(",").map((cell) => cell.trim().replace(/"/g, ""));
        if (row.length < 5) {
          errors.push(`Row ${i}: Insufficient columns`);
          processedRows++;
          continue;
        }
        try {
          const [name, description, price, roastLevel, origin, process2, stockQuantity, tastingNotes] = row;
          if (!name || !description || !price) {
            errors.push(`Row ${i}: Missing required fields (name, description, price)`);
            processedRows++;
            continue;
          }
          const priceNum = parseFloat(price);
          const stockNum = parseInt(stockQuantity) || 0;
          if (isNaN(priceNum) || priceNum <= 0) {
            errors.push(`Row ${i}: Invalid price format`);
            processedRows++;
            continue;
          }
          await storage.createProduct({
            roasterId,
            name,
            description,
            price: priceNum.toString(),
            roastLevel: roastLevel || "medium",
            origin: origin || "",
            process: process2 || "",
            stockQuantity: stockNum,
            tastingNotes: tastingNotes || "",
            isActive: true,
            images: []
          });
          successfulRows++;
        } catch (productError) {
          errors.push(`Row ${i}: ${productError.message}`);
        }
        processedRows++;
        if (processedRows % 10 === 0) {
          await storage.updateBulkUploadStatus(uploadId, "processing", {
            processedRows,
            successfulRows,
            errors: errors.slice(-50)
            // Keep last 50 errors
          });
        }
      }
      await storage.updateBulkUploadStatus(uploadId, "completed", {
        processedRows,
        successfulRows,
        errors
      });
    } catch (error) {
      await storage.updateBulkUploadStatus(uploadId, "failed", {
        processedRows,
        successfulRows,
        errors: [...errors, `Processing error: ${error.message}`]
      });
    } finally {
      try {
        fs.unlinkSync(filePath);
      } catch (cleanupError) {
        console.error("Failed to clean up file:", cleanupError);
      }
    }
  }
  app2.get("/api/roaster/bulk-uploads", isAuthenticated2, async (req, res) => {
    try {
      const roaster = await storage.getRoasterByUserId(req.session.user?.sub || req.user?.id);
      if (!roaster) {
        return res.status(403).json({ message: "Roaster profile required" });
      }
      const uploads = await storage.getBulkUploadsByRoaster(roaster.id);
      res.json(uploads);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch uploads: " + error.message });
    }
  });
  app2.get("/api/csv-template", (req, res) => {
    const csvTemplate = `name,description,price,roastLevel,origin,process,stockQuantity,tastingNotes
Ethiopian Yirgacheffe,Bright and floral single origin,24.99,light,Ethiopia,washed,50,citrus and floral notes
Colombian Supremo,Rich and balanced,22.99,medium,Colombia,washed,75,chocolate and caramel
French Roast Dark,Bold and smoky,19.99,dark,Brazil,natural,100,smoky and bold`;
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=bulk-upload-template.csv");
    res.send(csvTemplate);
  });
  app2.post("/api/products/:id/reviews", isAuthenticated2, async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const userId = req.session.user?.sub || req.user?.id;
      const reviewData = { ...req.body, userId, productId };
      const review = await storage.createReview(reviewData);
      res.json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      res.status(500).json({ message: "Failed to create review" });
    }
  });
  app2.get("/api/products/:id/reviews", async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const reviews3 = await storage.getReviewsByProductId(productId);
      res.json(reviews3);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });
  app2.get("/api/wishlist", isAuthenticated2, async (req, res) => {
    try {
      const userId = req.session.user?.sub || req.user?.id;
      const wishlistItems = await storage.getWishlistByUserId(userId);
      res.json(wishlistItems);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      res.status(500).json({ message: "Failed to fetch wishlist" });
    }
  });
  app2.post("/api/wishlist", isAuthenticated2, async (req, res) => {
    try {
      const userId = req.session.user?.sub || req.user?.id;
      const { productId } = req.body;
      const wishlistItem = await storage.addToWishlist({ userId, productId });
      res.json(wishlistItem);
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      res.status(500).json({ message: "Failed to add to wishlist" });
    }
  });
  app2.delete("/api/wishlist/:productId", isAuthenticated2, async (req, res) => {
    try {
      const userId = req.session.user?.sub || req.user?.id;
      const productId = parseInt(req.params.productId);
      await storage.removeFromWishlist(userId, productId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      res.status(500).json({ message: "Failed to remove from wishlist" });
    }
  });
  app2.get("/api/notifications", isAuthenticated2, async (req, res) => {
    try {
      const userId = req.session.user?.sub || req.user?.id;
      const notifications3 = await storage.getNotificationsByUserId(userId);
      res.json(notifications3);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });
  app2.get("/api/analytics/:roasterId", isAuthenticated2, async (req, res) => {
    try {
      const roasterId = parseInt(req.params.roasterId);
      const { startDate, endDate } = req.query;
      const start = startDate ? new Date(startDate) : void 0;
      const end = endDate ? new Date(endDate) : void 0;
      const analytics = await storage.getSellerAnalyticsByRoaster(roasterId, start, end);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });
  app2.get("/api/commissions/:roasterId", isAuthenticated2, async (req, res) => {
    try {
      const roasterId = parseInt(req.params.roasterId);
      const commissions2 = await storage.getCommissionsByRoaster(roasterId);
      res.json(commissions2);
    } catch (error) {
      console.error("Error fetching commissions:", error);
      res.status(500).json({ message: "Failed to fetch commissions" });
    }
  });
  app2.post("/api/commissions", isAuthenticated2, async (req, res) => {
    try {
      const commission = await storage.createCommission(req.body);
      res.json(commission);
    } catch (error) {
      console.error("Error creating commission:", error);
      res.status(500).json({ message: "Failed to create commission" });
    }
  });
  app2.get("/api/campaigns/:roasterId", isAuthenticated2, async (req, res) => {
    try {
      const roasterId = parseInt(req.params.roasterId);
      const campaigns3 = await storage.getCampaignsByRoaster(roasterId);
      res.json(campaigns3);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      res.status(500).json({ message: "Failed to fetch campaigns" });
    }
  });
  app2.post("/api/campaigns", isAuthenticated2, async (req, res) => {
    try {
      const campaign = await storage.createCampaign(req.body);
      res.json(campaign);
    } catch (error) {
      console.error("Error creating campaign:", error);
      res.status(500).json({ message: "Failed to create campaign" });
    }
  });
  app2.put("/api/campaigns/:id", isAuthenticated2, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const campaign = await storage.updateCampaign(id, req.body);
      res.json(campaign);
    } catch (error) {
      console.error("Error updating campaign:", error);
      res.status(500).json({ message: "Failed to update campaign" });
    }
  });
  app2.get("/api/bulk-uploads/:roasterId", isAuthenticated2, async (req, res) => {
    try {
      const roasterId = parseInt(req.params.roasterId);
      const uploads = await storage.getBulkUploadsByRoaster(roasterId);
      res.json(uploads);
    } catch (error) {
      console.error("Error fetching bulk uploads:", error);
      res.status(500).json({ message: "Failed to fetch bulk uploads" });
    }
  });
  app2.post("/api/bulk-upload", isAuthenticated2, async (req, res) => {
    try {
      const upload2 = await storage.createBulkUpload({
        roasterId: parseInt(req.body.roasterId),
        fileName: req.body.fileName || "products.csv",
        status: "processing",
        totalRows: 0,
        processedRows: 0,
        successfulRows: 0
      });
      res.json(upload2);
    } catch (error) {
      console.error("Error creating bulk upload:", error);
      res.status(500).json({ message: "Failed to create bulk upload" });
    }
  });
  app2.get("/api/disputes/roaster/:roasterId", isAuthenticated2, async (req, res) => {
    try {
      const roasterId = parseInt(req.params.roasterId);
      const disputes3 = await storage.getDisputesByRoaster(roasterId);
      res.json(disputes3);
    } catch (error) {
      console.error("Error fetching disputes:", error);
      res.status(500).json({ message: "Failed to fetch disputes" });
    }
  });
  app2.get("/api/disputes/customer/:customerId", isAuthenticated2, async (req, res) => {
    try {
      const customerId = req.params.customerId;
      const disputes3 = await storage.getDisputesByCustomer(customerId);
      res.json(disputes3);
    } catch (error) {
      console.error("Error fetching customer disputes:", error);
      res.status(500).json({ message: "Failed to fetch customer disputes" });
    }
  });
  app2.post("/api/disputes", isAuthenticated2, async (req, res) => {
    try {
      const dispute = await storage.createDispute(req.body);
      res.json(dispute);
    } catch (error) {
      console.error("Error creating dispute:", error);
      res.status(500).json({ message: "Failed to create dispute" });
    }
  });
  app2.put("/api/disputes/:id/status", isAuthenticated2, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status, resolution } = req.body;
      await storage.updateDisputeStatus(id, status, resolution);
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating dispute:", error);
      res.status(500).json({ message: "Failed to update dispute" });
    }
  });
  app2.get("/api/leaderboard", async (req, res) => {
    try {
      const { dateRange = "all", limit = "10" } = req.query;
      const leaderboard = await storage.getLeaderboard(
        dateRange,
        parseInt(limit)
      );
      res.json(leaderboard);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });
  app2.post("/api/roasters/:id/update-metrics", isAuthenticated2, async (req, res) => {
    try {
      const roasterId = parseInt(req.params.id);
      await storage.updateRoasterMetrics(roasterId);
      const score = await storage.calculateLeaderboardScore(roasterId);
      res.json({ success: true, leaderboardScore: score });
    } catch (error) {
      console.error("Error updating roaster metrics:", error);
      res.status(500).json({ message: "Failed to update metrics" });
    }
  });
  app2.post("/api/favorites/roasters/:id", isAuthenticated2, async (req, res) => {
    try {
      const userId = req.session.user?.sub || req.user?.id;
      const roasterId = parseInt(req.params.id);
      console.log(`Toggle favorite - User: ${userId}, Roaster: ${roasterId}`);
      if (!roasterId || isNaN(roasterId)) {
        return res.status(400).json({ message: "Invalid roaster ID" });
      }
      const roasterExists = await storage.getRoasterById(roasterId);
      if (!roasterExists) {
        return res.status(404).json({ message: "Roaster not found" });
      }
      const isAlreadyFavorite = await storage.isFavoriteRoaster(userId, roasterId);
      if (isAlreadyFavorite) {
        await storage.removeFavoriteRoaster(userId, roasterId);
        console.log(`Favorite removed successfully for roaster ${roasterId}`);
        res.json({ action: "removed", isFavorite: false });
      } else {
        const favorite = await storage.addFavoriteRoaster(userId, roasterId);
        console.log(`Favorite added successfully:`, favorite);
        res.json({ action: "added", isFavorite: true, favorite });
      }
    } catch (error) {
      console.error("Error toggling favorite roaster:", error);
      console.error("Error stack:", error.stack);
      res.status(500).json({ message: "Failed to toggle favorite roaster", error: error.message });
    }
  });
  app2.get("/api/favorites/roasters/:id/check", isAuthenticated2, async (req, res) => {
    try {
      const userId = req.session.user?.sub || req.user?.id;
      const roasterId = parseInt(req.params.id);
      if (!roasterId || isNaN(roasterId)) {
        return res.status(400).json({ message: "Invalid roaster ID" });
      }
      const isFavorite = await storage.isFavoriteRoaster(userId, roasterId);
      res.json({ isFavorite });
    } catch (error) {
      console.error("Error checking favorite roaster:", error);
      res.status(500).json({ message: "Failed to check favorite roaster" });
    }
  });
  app2.delete("/api/favorites/roasters/:id", isAuthenticated2, async (req, res) => {
    try {
      const userId = req.session.user?.sub || req.user?.id;
      const roasterId = parseInt(req.params.id);
      await storage.removeFavoriteRoaster(userId, roasterId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error removing favorite roaster:", error);
      res.status(500).json({ message: "Failed to remove favorite roaster" });
    }
  });
  app2.get("/api/favorites/roasters", isAuthenticated2, async (req, res) => {
    try {
      const userId = req.session.user?.sub || req.user?.id;
      const favorites = await storage.getFavoriteRoastersByUser(userId);
      res.json(favorites);
    } catch (error) {
      console.error("Error fetching favorite roasters:", error);
      res.status(500).json({ message: "Failed to fetch favorite roasters" });
    }
  });
  app2.get("/api/favorites/roasters/:id/check", isAuthenticated2, async (req, res) => {
    try {
      const userId = req.session.user?.sub || req.user?.id;
      const roasterId = parseInt(req.params.id);
      const isFavorite = await storage.isFavoriteRoaster(userId, roasterId);
      res.json({ isFavorite });
    } catch (error) {
      console.error("Error checking favorite status:", error);
      res.status(500).json({ message: "Failed to check favorite status" });
    }
  });
  app2.get("/api/orders/:id/tracking", isAuthenticated2, async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const tracking = await storage.getOrderTracking(orderId);
      res.json(tracking);
    } catch (error) {
      console.error("Error fetching order tracking:", error);
      res.status(500).json({ message: "Failed to fetch order tracking" });
    }
  });
  app2.post("/api/orders/:id/tracking", isAuthenticated2, async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const trackingData = { ...req.body, orderId };
      const tracking = await storage.createOrderTracking(trackingData);
      await realtimeService.broadcastOrderUpdate(orderId, tracking);
      res.json(tracking);
    } catch (error) {
      console.error("Error creating order tracking:", error);
      res.status(500).json({ message: "Failed to create order tracking" });
    }
  });
  app2.put("/api/orders/:id/status", isAuthenticated2, async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const { status } = req.body;
      const order = await storage.getOrderById(orderId);
      const oldStatus = order?.status;
      await storage.updateOrderStatus(orderId, status);
      if (oldStatus && oldStatus !== status) {
        await realtimeService.broadcastOrderStatusChange(orderId, status, oldStatus);
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({ message: "Failed to update order status" });
    }
  });
  app2.get("/api/notifications", isAuthenticated2, async (req, res) => {
    try {
      const userId = req.session.user?.sub || req.user?.id;
      const notifications3 = await storage.getNotificationsByUserId(userId);
      res.json(notifications3);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });
  app2.post("/api/notifications", isAuthenticated2, async (req, res) => {
    try {
      const notification = await storage.createNotification(req.body);
      await realtimeService.broadcastNotification(notification);
      res.json(notification);
    } catch (error) {
      console.error("Error creating notification:", error);
      res.status(500).json({ message: "Failed to create notification" });
    }
  });
  app2.put("/api/notifications/:id/read", isAuthenticated2, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.markNotificationAsRead(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });
  app2.post("/api/gift-cards", isAuthenticated2, async (req, res) => {
    try {
      const userId = req.session.user?.sub || req.user?.id;
      const giftCardData = {
        ...req.body,
        purchaserId: userId,
        deliveryDate: new Date(req.body.deliveryDate)
      };
      const giftCard = await storage.createGiftCard(giftCardData);
      res.json(giftCard);
    } catch (error) {
      console.error("Error creating gift card:", error);
      res.status(500).json({ message: "Failed to create gift card" });
    }
  });
  app2.get("/api/gift-cards", isAuthenticated2, async (req, res) => {
    try {
      const userId = req.session.user?.sub || req.user?.id;
      const giftCards2 = await storage.getGiftCardsByPurchaser(userId);
      res.json(giftCards2);
    } catch (error) {
      console.error("Error fetching gift cards:", error);
      res.status(500).json({ message: "Failed to fetch gift cards" });
    }
  });
  app2.get("/api/gift-cards/:id", isAuthenticated2, async (req, res) => {
    try {
      const giftCardId = parseInt(req.params.id);
      const giftCard = await storage.getGiftCardById(giftCardId);
      if (!giftCard) {
        return res.status(404).json({ message: "Gift card not found" });
      }
      res.json(giftCard);
    } catch (error) {
      console.error("Error fetching gift card:", error);
      res.status(500).json({ message: "Failed to fetch gift card" });
    }
  });
  app2.post("/api/gift-cards/redeem", isAuthenticated2, async (req, res) => {
    try {
      const userId = req.session.user?.sub || req.user?.id;
      const { code, amount } = req.body;
      const giftCard = await storage.getGiftCardByCode(code);
      if (!giftCard) {
        return res.status(404).json({ message: "Gift card not found" });
      }
      if (giftCard.status === "redeemed") {
        return res.status(400).json({ message: "Gift card has already been fully redeemed" });
      }
      if (giftCard.status === "expired") {
        return res.status(400).json({ message: "Gift card has expired" });
      }
      if (giftCard.expiresAt && /* @__PURE__ */ new Date() > new Date(giftCard.expiresAt)) {
        await storage.updateGiftCardStatus(giftCard.id, "expired");
        return res.status(400).json({ message: "Gift card has expired" });
      }
      const remainingBalance = parseFloat(giftCard.remainingBalance || giftCard.amount);
      if (amount > remainingBalance) {
        return res.status(400).json({
          message: "Insufficient balance",
          remainingBalance
        });
      }
      const updatedGiftCard = await storage.redeemGiftCard(code, userId, amount);
      res.json(updatedGiftCard);
    } catch (error) {
      console.error("Error redeeming gift card:", error);
      res.status(500).json({ message: "Failed to redeem gift card" });
    }
  });
  app2.post("/api/validate-address", isAuthenticated2, async (req, res) => {
    try {
      const { addressLine1, addressLine2, city, state, zipCode } = req.body;
      const userId = req.session.user?.sub || req.user?.id;
      if (!addressLine1 || !city || !state || !zipCode) {
        return res.status(400).json({
          isValid: false,
          error: "Address line 1, city, state, and ZIP code are required"
        });
      }
      if (zipCode.length < 5) {
        return res.status(400).json({
          isValid: false,
          error: "Invalid ZIP code format"
        });
      }
      const invalidPatterns = [
        /^123\s/i,
        // Starts with "123 "
        /test/i,
        /fake/i,
        /invalid/i,
        /example/i
      ];
      const isInvalidAddress = invalidPatterns.some(
        (pattern) => pattern.test(addressLine1) || pattern.test(city) || addressLine2 && pattern.test(addressLine2)
      );
      if (isInvalidAddress) {
        return res.status(400).json({
          isValid: false,
          error: "Please enter a valid address"
        });
      }
      const addressData = {
        addressLine1: addressLine1.trim(),
        addressLine2: addressLine2 ? addressLine2.trim() : "",
        city: city.trim(),
        state: state.toUpperCase(),
        zipCode: zipCode.trim()
      };
      await storage.updateUserAddress(userId, addressData);
      const validationResult2 = {
        isValid: true,
        standardizedAddress: addressData,
        deliveryPoint: true,
        suggestions: []
      };
      res.json(validationResult2);
    } catch (error) {
      console.error("Address validation error:", error);
      res.status(500).json({ message: "Failed to validate address" });
    }
  });
  app2.post("/api/seed/message-subjects", async (req, res) => {
    try {
      const defaultSubjects = [
        { name: "General Announcements", description: "General updates and announcements" },
        { name: "New Product Launches", description: "Notifications about new coffee offerings" },
        { name: "Sales & Promotions", description: "Special offers and discount announcements" },
        { name: "Seasonal Collections", description: "Seasonal coffee releases and limited editions" },
        { name: "Pre-orders Available", description: "Early access to upcoming coffee releases" }
      ];
      const existingSubjects = await storage.getAllMessageSubjects();
      if (existingSubjects.length > 0) {
        return res.json({ message: "Message subjects already exist", count: existingSubjects.length });
      }
      for (const subject of defaultSubjects) {
        await storage.createMessageSubject(subject);
      }
      res.json({ message: "Default message subjects created successfully", count: defaultSubjects.length });
    } catch (error) {
      console.error("Error seeding message subjects:", error);
      res.status(500).json({ message: "Failed to seed message subjects" });
    }
  });
  app2.get("/api/message-subjects", isAuthenticated2, async (req, res) => {
    try {
      const subjects = await storage.getAllMessageSubjects();
      res.json(subjects);
    } catch (error) {
      console.error("Error fetching message subjects:", error);
      res.status(500).json({ message: "Failed to fetch message subjects" });
    }
  });
  app2.post("/api/seller/messages", isAuthenticated2, async (req, res) => {
    try {
      const userId = req.session.user?.sub || req.user?.id;
      const roaster = await storage.getRoasterByUserId(userId);
      if (!roaster) {
        return res.status(403).json({ message: "Only sellers can send messages" });
      }
      const { subjectId, title, content } = req.body;
      if (!subjectId || !title || !content) {
        return res.status(400).json({ message: "Subject, title, and content are required" });
      }
      const message = await storage.createSellerMessage({
        sellerId: roaster.id,
        subjectId: parseInt(subjectId),
        title,
        content
      });
      const recipientIds = await storage.getMessageRecipients(roaster.id);
      if (recipientIds.length === 0) {
        return res.json({
          message,
          recipientsCount: 0,
          note: "No recipients found. Users who favorite your products or purchase from you will receive future messages."
        });
      }
      const recipients = recipientIds.map((userId2) => ({
        messageId: message.id,
        userId: userId2
      }));
      await storage.createMessageRecipients(recipients);
      for (const recipientId of recipientIds) {
        try {
          await storage.markEmailAsSent(recipientId, message.id);
          console.log(`Email notification sent to user ${recipientId} for message ${message.id}`);
        } catch (emailError) {
          console.error(`Failed to send email to user ${recipientId}:`, emailError);
        }
      }
      res.json({
        message,
        recipientsCount: recipientIds.length,
        success: true
      });
    } catch (error) {
      console.error("Error creating seller message:", error);
      res.status(500).json({ message: "Failed to create message" });
    }
  });
  app2.get("/api/seller/messages", isAuthenticated2, async (req, res) => {
    try {
      const userId = req.session.user?.sub || req.user?.id;
      const roaster = await storage.getRoasterByUserId(userId);
      if (!roaster) {
        return res.status(403).json({ message: "Only sellers can view sent messages" });
      }
      const messages = await storage.getSellerMessages(roaster.id);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching seller messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });
  app2.get("/api/buyer/messages", isAuthenticated2, async (req, res) => {
    try {
      const userId = req.session.user?.sub || req.user?.id;
      const roaster = await storage.getRoasterByUserId(userId);
      if (roaster) {
        return res.status(403).json({ message: "Sellers cannot view buyer messages" });
      }
      const messages = await storage.getUserMessages(userId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching buyer messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });
  app2.get("/api/buyer/messages/unread-count", isAuthenticated2, async (req, res) => {
    try {
      const userId = req.session.user?.sub || req.user?.id;
      const roaster = await storage.getRoasterByUserId(userId);
      if (roaster) {
        return res.json({ count: 0 });
      }
      const count = await storage.getUnreadMessageCount(userId);
      res.json({ count });
    } catch (error) {
      console.error("Error fetching unread message count:", error);
      res.status(500).json({ message: "Failed to fetch unread count" });
    }
  });
  app2.post("/api/buyer/messages/:messageId/read", isAuthenticated2, async (req, res) => {
    try {
      const userId = req.session.user?.sub || req.user?.id;
      const messageId = parseInt(req.params.messageId);
      const roaster = await storage.getRoasterByUserId(userId);
      if (roaster) {
        return res.status(403).json({ message: "Sellers cannot mark messages as read" });
      }
      if (!messageId || isNaN(messageId)) {
        return res.status(400).json({ message: "Invalid message ID" });
      }
      await storage.markMessageAsRead(userId, messageId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking message as read:", error);
      res.status(500).json({ message: "Failed to mark message as read" });
    }
  });
  app2.get("/api/messages/:messageId", isAuthenticated2, async (req, res) => {
    try {
      const userId = req.session.user?.sub || req.user?.id;
      const messageId = parseInt(req.params.messageId);
      if (!messageId || isNaN(messageId)) {
        return res.status(400).json({ message: "Invalid message ID" });
      }
      const message = await storage.getSellerMessageById(messageId);
      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }
      const roaster = await storage.getRoasterByUserId(userId);
      if (roaster) {
        if (message.sellerId !== roaster.id) {
          return res.status(403).json({ message: "Access denied" });
        }
      } else {
        const userMessages = await storage.getUserMessages(userId);
        const hasAccess = userMessages.some((um) => um.messageId === messageId);
        if (!hasAccess) {
          return res.status(403).json({ message: "Access denied" });
        }
        await storage.markMessageAsRead(userId, messageId);
      }
      res.json(message);
    } catch (error) {
      console.error("Error fetching message details:", error);
      res.status(500).json({ message: "Failed to fetch message" });
    }
  });
  const httpServer = createServer(app2);
  realtimeService.initialize(httpServer);
  return httpServer;
}

// server/index.ts
init_secrets();
import fs2 from "fs";
import path from "path";
import { fileURLToPath } from "url";
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var app = express();
app.set("trust proxy", 1);
setupSecurity(app);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    environment: process.env.NODE_ENV,
    port: process.env.PORT || 5e3
  });
});
app.use((req, res, next) => {
  const start = Date.now();
  const path2 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path2.startsWith("/api")) {
      let logLine = `${req.method} ${path2} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      console.log(logLine);
    }
  });
  next();
});
(async () => {
  try {
    console.log("Starting Roastah server...");
    console.log("Environment:", process.env.NODE_ENV);
    console.log("Port:", process.env.PORT || 5e3);
    await loadSecrets();
    const httpServer = await registerRoutes(app);
    const serverPort = process.env.PORT || 5e3;
    process.env.PORT = serverPort.toString();
    app.use((err, _req, res, _next) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      console.error("Express error:", err);
      res.status(status).json({ message });
      throw err;
    });
    const distPath = path.resolve(__dirname, "../dist/public");
    if (fs2.existsSync(distPath)) {
      console.log("\u2705 Found dist/public directory, serving static files from:", distPath);
      app.use(express.static(distPath));
      app.get("*", (req, res, next) => {
        if (req.path.startsWith("/api") || req.path.includes(".")) {
          return next();
        }
        const indexPath = path.resolve(distPath, "index.html");
        console.log("\u{1F4C4} Serving SPA route:", req.path, "-> index.html");
        if (fs2.existsSync(indexPath)) {
          res.sendFile(indexPath);
        } else {
          console.error("\u274C index.html not found at:", indexPath);
          res.status(404).send("index.html not found");
        }
      });
    } else {
      console.warn("\u274C No dist/public directory found at:", distPath);
      console.warn('   Make sure to run "npm run build" first');
    }
    const port = serverPort;
    httpServer.listen({
      port,
      host: "0.0.0.0"
    }, () => {
      console.log(`\u2705 Roastah server started successfully on port ${port}`);
    });
  } catch (error) {
    console.error("\u274C Failed to start server:", error);
    process.exit(1);
  }
})();
