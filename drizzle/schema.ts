import {
  int,
  varchar,
  text,
  timestamp,
  mysqlEnum,
  mysqlTable,
  decimal,
  boolean,
  index,
  uniqueIndex,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow and user management.
 * Extended with additional fields for KYC and user profile.
 */
export const users = mysqlTable(
  "users",
  {
    id: int("id").autoincrement().primaryKey(),
    openId: varchar("openId", { length: 64 }).notNull().unique(),
    name: text("name"),
    email: varchar("email", { length: 320 }).unique(),
    phone: varchar("phone", { length: 20 }),
    loginMethod: varchar("loginMethod", { length: 64 }),
    role: mysqlEnum("role", ["user", "admin", "agent_admin", "mediator"]).default("user").notNull(),
    
    // Profile information
    profileImage: text("profileImage"),
    bio: text("bio"),
    
    // KYC/KYB Information
    kycStatus: mysqlEnum("kycStatus", ["pending", "verified", "rejected", "expired"]).default("pending").notNull(),
    kycVerifiedAt: timestamp("kycVerifiedAt"),
    kycExpiresAt: timestamp("kycExpiresAt"),
    kycData: text("kycData"), // JSON: { idType, idNumber, fullName, dateOfBirth, address, etc }
    
    // Account status
    isActive: boolean("isActive").default(true).notNull(),
    isFrozen: boolean("isFrozen").default(false).notNull(),
    freezeReason: text("freezeReason"),
    
    // Reputation system
    totalDeals: int("totalDeals").default(0).notNull(),
    completedDeals: int("completedDeals").default(0).notNull(),
    ratingScore: decimal("ratingScore", { precision: 3, scale: 2 }).default("0"),
    reviewCount: int("reviewCount").default(0).notNull(),
    
    // Timestamps
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
    lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
  },
  (table) => ({
    emailIdx: index("email_idx").on(table.email),
    phoneIdx: index("phone_idx").on(table.phone),
    kycStatusIdx: index("kyc_status_idx").on(table.kycStatus),
  })
);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Escrow transactions - core entity for the platform
 */
export const escrows = mysqlTable(
  "escrows",
  {
    id: varchar("id", { length: 64 }).primaryKey(), // UUID
    buyerId: int("buyerId").notNull(),
    sellerId: int("sellerId").notNull(),
    mediatorId: int("mediatorId"), // Optional mediator
    
    // Escrow details
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    amount: int("amount").notNull(), // In cents (IDR)
    currency: varchar("currency", { length: 3 }).default("IDR").notNull(),
    
    // Product/Item information
    itemTitle: varchar("itemTitle", { length: 255 }),
    itemDescription: text("itemDescription"),
    itemImages: text("itemImages"), // JSON array of image URLs
    itemPrice: int("itemPrice"), // Original item price in cents
    
    // Status and lifecycle
    status: mysqlEnum("status", [
      "created",
      "pending_payment",
      "funded",
      "in_progress",
      "completed",
      "disputed",
      "cancelled",
      "refunded",
    ])
      .default("created")
      .notNull(),
    
    // Payment information
    paymentMethod: varchar("paymentMethod", { length: 50 }), // "mayar", "qr", etc
    paymentId: varchar("paymentId", { length: 255 }), // External payment gateway ID
    paymentUrl: text("paymentUrl"), // Payment link for buyer
    paidAt: timestamp("paidAt"),
    
    // Release conditions
    releaseCondition: mysqlEnum("releaseCondition", [
      "manual",
      "confirmation",
      "delivery_proof",
      "milestone",
      "auto",
    ])
      .default("manual")
      .notNull(),
    releaseProofRequired: boolean("releaseProofRequired").default(false).notNull(),
    
    // Milestone information
    milestones: text("milestones"), // JSON array of milestone objects
    currentMilestone: int("currentMilestone").default(0).notNull(),
    
    // Fees
    platformFee: int("platformFee").default(0).notNull(),
    serviceFee: int("serviceFee").default(0).notNull(),
    totalFee: int("totalFee").default(0).notNull(),
    
    // Dates
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    fundedAt: timestamp("fundedAt"),
    completedAt: timestamp("completedAt"),
    expiresAt: timestamp("expiresAt"),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
    
    // Source tracking
    sourceUrl: text("sourceUrl"), // URL if created via smart URL feature
    sourceMetadata: text("sourceMetadata"), // JSON with extracted data
  },
  (table) => ({
    buyerIdx: index("buyer_idx").on(table.buyerId),
    sellerIdx: index("seller_idx").on(table.sellerId),
    statusIdx: index("status_idx").on(table.status),
    createdAtIdx: index("created_at_idx").on(table.createdAt),
  })
);

export type Escrow = typeof escrows.$inferSelect;
export type InsertEscrow = typeof escrows.$inferInsert;

/**
 * Escrow wallet - tracks funds for each transaction
 */
export const escrowWallets = mysqlTable(
  "escrow_wallets",
  {
    id: varchar("id", { length: 64 }).primaryKey(), // UUID
    escrowId: varchar("escrowId", { length: 64 }).notNull().unique(),
    
    // Balance tracking
    totalFunded: int("totalFunded").default(0).notNull(),
    totalReleased: int("totalReleased").default(0).notNull(),
    totalRefunded: int("totalRefunded").default(0).notNull(),
    currentBalance: int("currentBalance").default(0).notNull(),
    
    // Breakdown
    buyerAmount: int("buyerAmount").default(0).notNull(),
    sellerAmount: int("sellerAmount").default(0).notNull(),
    platformAmount: int("platformAmount").default(0).notNull(),
    
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    escrowIdx: uniqueIndex("escrow_id_idx").on(table.escrowId),
  })
);

export type EscrowWallet = typeof escrowWallets.$inferSelect;
export type InsertEscrowWallet = typeof escrowWallets.$inferInsert;

/**
 * Transactions - detailed record of all money movements
 */
export const transactions = mysqlTable(
  "transactions",
  {
    id: varchar("id", { length: 64 }).primaryKey(), // UUID
    escrowId: varchar("escrowId", { length: 64 }).notNull(),
    
    // Transaction details
    type: mysqlEnum("type", [
      "fund",
      "release",
      "refund",
      "fee",
      "payout",
      "adjustment",
    ])
      .notNull(),
    amount: int("amount").notNull(), // In cents
    currency: varchar("currency", { length: 3 }).default("IDR").notNull(),
    
    // Parties involved
    fromUserId: int("fromUserId"),
    toUserId: int("toUserId"),
    
    // Payment gateway reference
    paymentGateway: varchar("paymentGateway", { length: 50 }),
    paymentGatewayId: varchar("paymentGatewayId", { length: 255 }),
    
    // Status
    status: mysqlEnum("status", ["pending", "completed", "failed", "cancelled"])
      .default("pending")
      .notNull(),
    
    // Metadata
    description: text("description"),
    metadata: text("metadata"), // JSON with additional details
    
    // Timestamps
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    completedAt: timestamp("completedAt"),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    escrowIdx: index("escrow_id_idx").on(table.escrowId),
    typeIdx: index("type_idx").on(table.type),
    statusIdx: index("status_idx").on(table.status),
  })
);

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;

/**
 * Disputes - track disputes and mediation
 */
export const disputes = mysqlTable(
  "disputes",
  {
    id: varchar("id", { length: 64 }).primaryKey(), // UUID
    escrowId: varchar("escrowId", { length: 64 }).notNull().unique(),
    
    // Parties
    initiatedBy: int("initiatedBy").notNull(),
    initiatedAgainst: int("initiatedAgainst").notNull(),
    mediatorId: int("mediatorId"),
    
    // Dispute details
    reason: varchar("reason", { length: 255 }).notNull(),
    description: text("description").notNull(),
    
    // Status and resolution
    status: mysqlEnum("status", [
      "open",
      "in_review",
      "mediation",
      "escalated",
      "resolved",
      "closed",
    ])
      .default("open")
      .notNull(),
    
    resolution: mysqlEnum("resolution", [
      "pending",
      "split",
      "full_refund",
      "full_release",
      "custom",
    ]).default("pending"),
    
    // Resolution details
    resolutionDetails: text("resolutionDetails"), // JSON with split percentages, etc
    resolutionNotes: text("resolutionNotes"),
    
    // Evidence
    buyerEvidence: text("buyerEvidence"), // JSON array of evidence items
    sellerEvidence: text("sellerEvidence"), // JSON array of evidence items
    
    // Timestamps
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    resolvedAt: timestamp("resolvedAt"),
    closedAt: timestamp("closedAt"),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    escrowIdx: uniqueIndex("escrow_dispute_idx").on(table.escrowId),
    statusIdx: index("dispute_status_idx").on(table.status),
  })
);

export type Dispute = typeof disputes.$inferSelect;
export type InsertDispute = typeof disputes.$inferInsert;

/**
 * Dispute messages - secure chat between parties
 */
export const disputeMessages = mysqlTable(
  "dispute_messages",
  {
    id: varchar("id", { length: 64 }).primaryKey(), // UUID
    disputeId: varchar("disputeId", { length: 64 }).notNull(),
    
    // Message details
    senderId: int("senderId").notNull(),
    message: text("message").notNull(),
    
    // Attachments
    attachments: text("attachments"), // JSON array of file URLs
    
    // Timestamps
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    disputeIdx: index("dispute_id_idx").on(table.disputeId),
    senderIdx: index("sender_idx").on(table.senderId),
  })
);

export type DisputeMessage = typeof disputeMessages.$inferSelect;
export type InsertDisputeMessage = typeof disputeMessages.$inferInsert;

/**
 * Reviews and ratings
 */
export const reviews = mysqlTable(
  "reviews",
  {
    id: varchar("id", { length: 64 }).primaryKey(), // UUID
    escrowId: varchar("escrowId", { length: 64 }).notNull(),
    
    // Reviewer and reviewee
    reviewerId: int("reviewerId").notNull(),
    revieweeId: int("revieweeId").notNull(),
    
    // Rating and review
    rating: int("rating").notNull(), // 1-5
    title: varchar("title", { length: 255 }),
    comment: text("comment"),
    
    // Aspects
    communicationRating: int("communicationRating"),
    reliabilityRating: int("reliabilityRating"),
    productQualityRating: int("productQualityRating"),
    
    // Timestamps
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    escrowIdx: index("escrow_review_idx").on(table.escrowId),
    reviewerIdx: index("reviewer_idx").on(table.reviewerId),
    revieweeIdx: index("reviewee_idx").on(table.revieweeId),
  })
);

export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;

/**
 * Audit logs - immutable record of all actions
 */
export const auditLogs = mysqlTable(
  "audit_logs",
  {
    id: varchar("id", { length: 64 }).primaryKey(), // UUID
    
    // Entity being audited
    entityType: varchar("entityType", { length: 50 }).notNull(), // "escrow", "user", "dispute", etc
    entityId: varchar("entityId", { length: 64 }).notNull(),
    
    // Action details
    action: varchar("action", { length: 100 }).notNull(), // "created", "updated", "released", etc
    userId: int("userId"),
    
    // Changes
    oldValues: text("oldValues"), // JSON
    newValues: text("newValues"), // JSON
    
    // Metadata
    ipAddress: varchar("ipAddress", { length: 45 }),
    userAgent: text("userAgent"),
    metadata: text("metadata"), // JSON with additional context
    
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    entityIdx: index("entity_idx").on(table.entityType, table.entityId),
    actionIdx: index("action_idx").on(table.action),
    userIdx: index("user_idx").on(table.userId),
  })
);

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;

/**
 * Notifications
 */
export const notifications = mysqlTable(
  "notifications",
  {
    id: varchar("id", { length: 64 }).primaryKey(), // UUID
    userId: int("userId").notNull(),
    
    // Notification details
    type: varchar("type", { length: 50 }).notNull(), // "escrow_funded", "payment_received", etc
    title: varchar("title", { length: 255 }).notNull(),
    message: text("message").notNull(),
    
    // Related entity
    relatedEntityType: varchar("relatedEntityType", { length: 50 }),
    relatedEntityId: varchar("relatedEntityId", { length: 64 }),
    
    // Status
    isRead: boolean("isRead").default(false).notNull(),
    
    // Channels
    emailSent: boolean("emailSent").default(false).notNull(),
    smsSent: boolean("smsSent").default(false).notNull(),
    pushSent: boolean("pushSent").default(false).notNull(),
    
    // Timestamps
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    readAt: timestamp("readAt"),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userIdx: index("user_idx").on(table.userId),
    typeIdx: index("type_idx").on(table.type),
    isReadIdx: index("is_read_idx").on(table.isRead),
  })
);

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/**
 * Payment methods - user's saved payment information
 */
export const paymentMethods = mysqlTable(
  "payment_methods",
  {
    id: varchar("id", { length: 64 }).primaryKey(), // UUID
    userId: int("userId").notNull(),
    
    // Payment method details
    type: varchar("type", { length: 50 }).notNull(), // "bank_transfer", "e_wallet", "qr", etc
    provider: varchar("provider", { length: 50 }), // "mayar", "midtrans", etc
    
    // Sensitive data (encrypted)
    encryptedData: text("encryptedData").notNull(), // Encrypted payment details
    
    // Display info
    displayName: varchar("displayName", { length: 255 }),
    lastFourDigits: varchar("lastFourDigits", { length: 4 }),
    
    // Status
    isDefault: boolean("isDefault").default(false).notNull(),
    isActive: boolean("isActive").default(true).notNull(),
    
    // Verification
    isVerified: boolean("isVerified").default(false).notNull(),
    verifiedAt: timestamp("verifiedAt"),
    
    // Timestamps
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userIdx: index("user_idx").on(table.userId),
    typeIdx: index("type_idx").on(table.type),
  })
);

export type PaymentMethod = typeof paymentMethods.$inferSelect;
export type InsertPaymentMethod = typeof paymentMethods.$inferInsert;

/**
 * Fee configuration - platform fees by transaction type/region
 */
export const feeConfigs = mysqlTable(
  "fee_configs",
  {
    id: varchar("id", { length: 64 }).primaryKey(), // UUID
    
    // Fee scope
    transactionType: varchar("transactionType", { length: 50 }), // "general", "high_value", etc
    region: varchar("region", { length: 10 }).default("ID"), // ISO country code
    userTier: varchar("userTier", { length: 50 }).default("standard"), // "standard", "premium", etc
    
    // Fee structure
    platformFeePercentage: decimal("platformFeePercentage", { precision: 5, scale: 2 }).default("2.5"),
    platformFeeFixed: int("platformFeeFixed").default(0), // In cents
    serviceFeePercentage: decimal("serviceFeePercentage", { precision: 5, scale: 2 }).default("0"),
    serviceFeeFixed: int("serviceFeeFixed").default(0), // In cents
    
    // Limits
    minAmount: int("minAmount").default(0),
    maxAmount: int("maxAmount"),
    
    // Status
    isActive: boolean("isActive").default(true).notNull(),
    
    // Timestamps
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    typeIdx: index("type_idx").on(table.transactionType),
    regionIdx: index("region_idx").on(table.region),
  })
);

export type FeeConfig = typeof feeConfigs.$inferSelect;
export type InsertFeeConfig = typeof feeConfigs.$inferInsert;

/**
 * Blacklist - for AML/CFT compliance
 */
export const blacklist = mysqlTable(
  "blacklist",
  {
    id: varchar("id", { length: 64 }).primaryKey(), // UUID
    
    // Blacklist entry
    entryType: varchar("entryType", { length: 50 }).notNull(), // "user", "email", "phone", "name", etc
    entryValue: varchar("entryValue", { length: 255 }).notNull(),
    
    // Reason
    reason: text("reason"),
    source: varchar("source", { length: 100 }), // "manual", "aml_check", "fraud_detection", etc
    
    // Status
    isActive: boolean("isActive").default(true).notNull(),
    
    // Timestamps
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    expiresAt: timestamp("expiresAt"),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    entryIdx: uniqueIndex("entry_idx").on(table.entryType, table.entryValue),
    activeIdx: index("active_idx").on(table.isActive),
  })
);

export type Blacklist = typeof blacklist.$inferSelect;
export type InsertBlacklist = typeof blacklist.$inferInsert;

/**
 * API Keys - for webhook and external integrations
 */
export const apiKeys = mysqlTable(
  "api_keys",
  {
    id: varchar("id", { length: 64 }).primaryKey(), // UUID
    userId: int("userId").notNull(),
    
    // Key details
    name: varchar("name", { length: 255 }).notNull(),
    keyHash: varchar("keyHash", { length: 255 }).notNull().unique(), // Hashed API key
    
    // Permissions
    permissions: text("permissions").notNull(), // JSON array of permissions
    
    // Rate limiting
    rateLimit: int("rateLimit"), // Requests per minute
    
    // Status
    isActive: boolean("isActive").default(true).notNull(),
    lastUsedAt: timestamp("lastUsedAt"),
    
    // Timestamps
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    expiresAt: timestamp("expiresAt"),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userIdx: index("user_idx").on(table.userId),
    activeIdx: index("active_idx").on(table.isActive),
  })
);

export type ApiKey = typeof apiKeys.$inferSelect;
export type InsertApiKey = typeof apiKeys.$inferInsert;

/**
 * Webhooks - for external service integrations
 */
export const webhooks = mysqlTable(
  "webhooks",
  {
    id: varchar("id", { length: 64 }).primaryKey(), // UUID
    userId: int("userId").notNull(),
    
    // Webhook details
    name: varchar("name", { length: 255 }).notNull(),
    url: text("url").notNull(),
    
    // Events
    events: text("events").notNull(), // JSON array of event types
    
    // Status
    isActive: boolean("isActive").default(true).notNull(),
    
    // Retry policy
    maxRetries: int("maxRetries").default(3).notNull(),
    retryInterval: int("retryInterval").default(300).notNull(), // In seconds
    
    // Timestamps
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userIdx: index("user_idx").on(table.userId),
    activeIdx: index("active_idx").on(table.isActive),
  })
);

export type Webhook = typeof webhooks.$inferSelect;
export type InsertWebhook = typeof webhooks.$inferInsert;
