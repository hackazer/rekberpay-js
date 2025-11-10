import { eq, and, or, gte, lte, desc, asc, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  InsertEscrow,
  escrows,
  InsertTransaction,
  transactions,
  InsertDispute,
  disputes,
  InsertReview,
  reviews,
  InsertNotification,
  notifications,
  InsertAuditLog,
  auditLogs,
  escrowWallets,
  InsertEscrowWallet,
  paymentMethods,
  InsertPaymentMethod,
  feeConfigs,
  InsertFeeConfig,
  blacklist,
  InsertBlacklist,
  apiKeys,
  InsertApiKey,
  webhooks,
  InsertWebhook,
  disputeMessages,
  InsertDisputeMessage,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============================================================================
// USER OPERATIONS
// ============================================================================

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod", "phone", "profileImage", "bio"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserProfile(userId: number, updates: Partial<InsertUser>) {
  const db = await getDb();
  if (!db) return;

  await db.update(users).set({ ...updates, updatedAt: new Date() }).where(eq(users.id, userId));
}

export async function updateUserKYC(
  userId: number,
  kycStatus: string,
  kycData?: string,
  expiresAt?: Date
) {
  const db = await getDb();
  if (!db) return;

  await db
    .update(users)
    .set({
      kycStatus: kycStatus as any,
      kycData,
      kycVerifiedAt: kycStatus === "verified" ? new Date() : undefined,
      kycExpiresAt: expiresAt,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));
}

export async function freezeUser(userId: number, reason: string) {
  const db = await getDb();
  if (!db) return;

  await db
    .update(users)
    .set({ isFrozen: true, freezeReason: reason, updatedAt: new Date() })
    .where(eq(users.id, userId));
}

export async function unfreezeUser(userId: number) {
  const db = await getDb();
  if (!db) return;

  await db
    .update(users)
    .set({ isFrozen: false, freezeReason: null, updatedAt: new Date() })
    .where(eq(users.id, userId));
}

// ============================================================================
// ESCROW OPERATIONS
// ============================================================================

export async function createEscrow(escrow: InsertEscrow) {
  const db = await getDb();
  if (!db) return null;

  await db.insert(escrows).values(escrow);
  return escrow;
}

export async function getEscrowById(escrowId: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(escrows).where(eq(escrows.id, escrowId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserEscrows(userId: number, role: "buyer" | "seller", limit = 20, offset = 0) {
  const db = await getDb();
  if (!db) return [];

  const condition = role === "buyer" ? eq(escrows.buyerId, userId) : eq(escrows.sellerId, userId);

  return await db
    .select()
    .from(escrows)
    .where(condition)
    .orderBy(desc(escrows.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function updateEscrowStatus(escrowId: string, status: string) {
  const db = await getDb();
  if (!db) return;

  await db
    .update(escrows)
    .set({ status: status as any, updatedAt: new Date() })
    .where(eq(escrows.id, escrowId));
}

export async function updateEscrowPayment(escrowId: string, paymentMethod: string, paymentId: string, paymentUrl: string) {
  const db = await getDb();
  if (!db) return;

  await db
    .update(escrows)
    .set({
      paymentMethod,
      paymentId,
      paymentUrl,
      status: "pending_payment",
      updatedAt: new Date(),
    })
    .where(eq(escrows.id, escrowId));
}

export async function markEscrowFunded(escrowId: string) {
  const db = await getDb();
  if (!db) return;

  await db
    .update(escrows)
    .set({ status: "funded", paidAt: new Date(), updatedAt: new Date() })
    .where(eq(escrows.id, escrowId));
}

export async function completeEscrow(escrowId: string) {
  const db = await getDb();
  if (!db) return;

  await db
    .update(escrows)
    .set({ status: "completed", completedAt: new Date(), updatedAt: new Date() })
    .where(eq(escrows.id, escrowId));
}

// ============================================================================
// ESCROW WALLET OPERATIONS
// ============================================================================

export async function createEscrowWallet(wallet: InsertEscrowWallet) {
  const db = await getDb();
  if (!db) return null;

  await db.insert(escrowWallets).values(wallet);
  return wallet;
}

export async function getEscrowWallet(escrowId: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(escrowWallets)
    .where(eq(escrowWallets.escrowId, escrowId))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateEscrowWalletBalance(
  escrowId: string,
  totalFunded: number,
  totalReleased: number,
  totalRefunded: number
) {
  const db = await getDb();
  if (!db) return;

  const currentBalance = totalFunded - totalReleased - totalRefunded;

  await db
    .update(escrowWallets)
    .set({
      totalFunded,
      totalReleased,
      totalRefunded,
      currentBalance,
      updatedAt: new Date(),
    })
    .where(eq(escrowWallets.escrowId, escrowId));
}

// ============================================================================
// TRANSACTION OPERATIONS
// ============================================================================

export async function createTransaction(transaction: InsertTransaction) {
  const db = await getDb();
  if (!db) return null;

  await db.insert(transactions).values(transaction);
  return transaction;
}

export async function getEscrowTransactions(escrowId: string) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(transactions)
    .where(eq(transactions.escrowId, escrowId))
    .orderBy(desc(transactions.createdAt));
}

export async function updateTransactionStatus(transactionId: string, status: string, completedAt?: Date) {
  const db = await getDb();
  if (!db) return;

  await db
    .update(transactions)
    .set({
      status: status as any,
      completedAt: completedAt || new Date(),
      updatedAt: new Date(),
    })
    .where(eq(transactions.id, transactionId));
}

// ============================================================================
// DISPUTE OPERATIONS
// ============================================================================

export async function createDispute(dispute: InsertDispute) {
  const db = await getDb();
  if (!db) return null;

  await db.insert(disputes).values(dispute);
  return dispute;
}

export async function getDisputeByEscrowId(escrowId: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(disputes)
    .where(eq(disputes.escrowId, escrowId))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateDisputeStatus(disputeId: string, status: string) {
  const db = await getDb();
  if (!db) return;

  await db
    .update(disputes)
    .set({ status: status as any, updatedAt: new Date() })
    .where(eq(disputes.id, disputeId));
}

export async function resolveDispute(
  disputeId: string,
  resolution: string,
  resolutionDetails: string,
  resolutionNotes: string
) {
  const db = await getDb();
  if (!db) return;

  await db
    .update(disputes)
    .set({
      resolution: resolution as any,
      resolutionDetails,
      resolutionNotes,
      status: "resolved",
      resolvedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(disputes.id, disputeId));
}

export async function addDisputeMessage(message: InsertDisputeMessage) {
  const db = await getDb();
  if (!db) return null;

  await db.insert(disputeMessages).values(message);
  return message;
}

export async function getDisputeMessages(disputeId: string) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(disputeMessages)
    .where(eq(disputeMessages.disputeId, disputeId))
    .orderBy(asc(disputeMessages.createdAt));
}

// ============================================================================
// REVIEW OPERATIONS
// ============================================================================

export async function createReview(review: InsertReview) {
  const db = await getDb();
  if (!db) return null;

  await db.insert(reviews).values(review);
  return review;
}

export async function getUserReviews(userId: number, limit = 20, offset = 0) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(reviews)
    .where(eq(reviews.revieweeId, userId))
    .orderBy(desc(reviews.createdAt))
    .limit(limit)
    .offset(offset);
}

// ============================================================================
// NOTIFICATION OPERATIONS
// ============================================================================

export async function createNotification(notification: InsertNotification) {
  const db = await getDb();
  if (!db) return null;

  await db.insert(notifications).values(notification);
  return notification;
}

export async function getUserNotifications(userId: number, limit = 20, offset = 0) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function markNotificationAsRead(notificationId: string) {
  const db = await getDb();
  if (!db) return;

  await db
    .update(notifications)
    .set({ isRead: true, readAt: new Date(), updatedAt: new Date() })
    .where(eq(notifications.id, notificationId));
}

// ============================================================================
// AUDIT LOG OPERATIONS
// ============================================================================

export async function createAuditLog(log: InsertAuditLog) {
  const db = await getDb();
  if (!db) return null;

  await db.insert(auditLogs).values(log);
  return log;
}

export async function getEntityAuditLogs(entityType: string, entityId: string) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(auditLogs)
    .where(and(eq(auditLogs.entityType, entityType), eq(auditLogs.entityId, entityId)))
    .orderBy(desc(auditLogs.createdAt));
}

// ============================================================================
// PAYMENT METHOD OPERATIONS
// ============================================================================

export async function createPaymentMethod(method: InsertPaymentMethod) {
  const db = await getDb();
  if (!db) return null;

  await db.insert(paymentMethods).values(method);
  return method;
}

export async function getUserPaymentMethods(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(paymentMethods)
    .where(and(eq(paymentMethods.userId, userId), eq(paymentMethods.isActive, true)))
    .orderBy(desc(paymentMethods.createdAt));
}

// ============================================================================
// FEE CONFIG OPERATIONS
// ============================================================================

export async function createFeeConfig(config: InsertFeeConfig) {
  const db = await getDb();
  if (!db) return null;

  await db.insert(feeConfigs).values(config);
  return config;
}

export async function getFeeConfig(transactionType: string, region: string, userTier: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(feeConfigs)
    .where(
      and(
        eq(feeConfigs.transactionType, transactionType),
        eq(feeConfigs.region, region),
        eq(feeConfigs.userTier, userTier),
        eq(feeConfigs.isActive, true)
      )
    )
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============================================================================
// BLACKLIST OPERATIONS
// ============================================================================

export async function addToBlacklist(entry: InsertBlacklist) {
  const db = await getDb();
  if (!db) return null;

  await db.insert(blacklist).values(entry);
  return entry;
}

export async function isBlacklisted(entryType: string, entryValue: string) {
  const db = await getDb();
  if (!db) return false;

  const result = await db
    .select()
    .from(blacklist)
    .where(
      and(
        eq(blacklist.entryType, entryType),
        eq(blacklist.entryValue, entryValue),
        eq(blacklist.isActive, true)
      )
    )
    .limit(1);

  return result.length > 0;
}

// ============================================================================
// API KEY OPERATIONS
// ============================================================================

export async function createApiKey(key: InsertApiKey) {
  const db = await getDb();
  if (!db) return null;

  await db.insert(apiKeys).values(key);
  return key;
}

export async function getUserApiKeys(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(apiKeys)
    .where(eq(apiKeys.userId, userId))
    .orderBy(desc(apiKeys.createdAt));
}

// ============================================================================
// WEBHOOK OPERATIONS
// ============================================================================

export async function createWebhook(webhook: InsertWebhook) {
  const db = await getDb();
  if (!db) return null;

  await db.insert(webhooks).values(webhook);
  return webhook;
}

export async function getUserWebhooks(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(webhooks)
    .where(eq(webhooks.userId, userId))
    .orderBy(desc(webhooks.createdAt));
}

// ============================================================================
// ADMIN OPERATIONS
// ============================================================================

export async function getAllUsers(limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(users)
    .orderBy(desc(users.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function getAllEscrows(limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(escrows)
    .orderBy(desc(escrows.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function getAllDisputes(limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(disputes)
    .orderBy(desc(disputes.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function getEscrowStats() {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select({
      totalEscrows: sql`COUNT(*)`,
      totalVolume: sql`SUM(amount)`,
      averageAmount: sql`AVG(amount)`,
      completedCount: sql`SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END)`,
      disputedCount: sql`SUM(CASE WHEN status = 'disputed' THEN 1 ELSE 0 END)`,
    })
    .from(escrows);

  return result[0];
}
