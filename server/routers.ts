import { COOKIE_NAME } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import {
  createEscrow,
  createEscrowWallet,
  createNotification,
  createTransaction,
  getEscrowById,
  getEscrowWallet,
  getUserById,
  getUserEscrows,
  markEscrowFunded,
  updateEscrowPayment,
  updateEscrowStatus,
  updateEscrowWalletBalance,
  updateUserProfile,
  getUserPaymentMethods,
  createPaymentMethod,
  getDisputeByEscrowId,
  createDispute,
  addDisputeMessage,
  getDisputeMessages,
  createReview,
  updateUserKYC,
  getAllUsers,
  getAllEscrows,
  getAllDisputes,
  getEscrowStats,
  createAuditLog,
  getEntityAuditLogs,
  freezeUser,
  unfreezeUser,
  completeEscrow,
} from "./db";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const CreateEscrowSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  amount: z.number().int().positive(),
  itemTitle: z.string().optional(),
  itemDescription: z.string().optional(),
  itemImages: z.string().optional(),
  itemPrice: z.number().int().optional(),
  sellerId: z.number().int().positive(),
  releaseCondition: z.enum(["manual", "confirmation", "delivery_proof", "milestone", "auto"]),
  sourceUrl: z.string().optional(),
  sourceMetadata: z.string().optional(),
});

const UpdateProfileSchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
  profileImage: z.string().optional(),
  bio: z.string().optional(),
});

const CreateDisputeSchema = z.object({
  escrowId: z.string(),
  reason: z.string().min(1).max(255),
  description: z.string().min(1),
});

const AddDisputeMessageSchema = z.object({
  disputeId: z.string(),
  message: z.string().min(1),
  attachments: z.string().optional(),
});

const CreateReviewSchema = z.object({
  escrowId: z.string(),
  revieweeId: z.number().int(),
  rating: z.number().int().min(1).max(5),
  title: z.string().optional(),
  comment: z.string().optional(),
  communicationRating: z.number().int().min(1).max(5).optional(),
  reliabilityRating: z.number().int().min(1).max(5).optional(),
  productQualityRating: z.number().int().min(1).max(5).optional(),
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function logAuditAction(
  entityType: string,
  entityId: string,
  action: string,
  userId: number | undefined,
  oldValues?: any,
  newValues?: any
) {
  await createAuditLog({
    id: uuidv4(),
    entityType,
    entityId,
    action,
    userId,
    oldValues: oldValues ? JSON.stringify(oldValues) : undefined,
    newValues: newValues ? JSON.stringify(newValues) : undefined,
  });
}

async function notifyUser(
  userId: number,
  type: string,
  title: string,
  message: string,
  relatedEntityType?: string,
  relatedEntityId?: string
) {
  await createNotification({
    id: uuidv4(),
    userId,
    type,
    title,
    message,
    relatedEntityType,
    relatedEntityId,
  });
}

// ============================================================================
// ADMIN PROCEDURE
// ============================================================================

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

// ============================================================================
// ROUTERS
// ============================================================================

export const appRouter = router({
  system: systemRouter,

  // ========================================================================
  // AUTH ROUTER
  // ========================================================================
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ========================================================================
  // USER ROUTER
  // ========================================================================
  user: router({
    getProfile: protectedProcedure.query(async ({ ctx }) => {
      const user = await getUserById(ctx.user.id);
      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }
      return user;
    }),

    updateProfile: protectedProcedure.input(UpdateProfileSchema).mutation(async ({ ctx, input }) => {
      await updateUserProfile(ctx.user.id, input);
      await logAuditAction("user", ctx.user.id.toString(), "profile_updated", ctx.user.id, {}, input);
      return { success: true };
    }),

    getPaymentMethods: protectedProcedure.query(async ({ ctx }) => {
      return await getUserPaymentMethods(ctx.user.id);
    }),

    addPaymentMethod: protectedProcedure
      .input(
        z.object({
          type: z.string(),
          provider: z.string().optional(),
          encryptedData: z.string(),
          displayName: z.string().optional(),
          lastFourDigits: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const method = await createPaymentMethod({
          id: uuidv4(),
          userId: ctx.user.id,
          type: input.type,
          provider: input.provider,
          encryptedData: input.encryptedData,
          displayName: input.displayName,
          lastFourDigits: input.lastFourDigits,
        });

        await logAuditAction("payment_method", method!.id, "created", ctx.user.id, {}, input);
        return method;
      }),

    submitKYC: protectedProcedure
      .input(
        z.object({
          idType: z.string(),
          idNumber: z.string(),
          fullName: z.string(),
          dateOfBirth: z.string(),
          address: z.string(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const kycData = JSON.stringify(input);
        await updateUserKYC(ctx.user.id, "pending", kycData);
        await logAuditAction("user_kyc", ctx.user.id.toString(), "submitted", ctx.user.id, {}, input);
        return { success: true, message: "KYC submitted for verification" };
      }),
  }),

  // ========================================================================
  // ESCROW ROUTER
  // ========================================================================
  escrow: router({
    create: protectedProcedure.input(CreateEscrowSchema).mutation(async ({ ctx, input }) => {
      const escrowId = uuidv4();
      const walletId = uuidv4();

      // Create escrow
      const escrow = await createEscrow({
        id: escrowId,
        buyerId: ctx.user.id,
        sellerId: input.sellerId,
        title: input.title,
        description: input.description,
        amount: input.amount,
        itemTitle: input.itemTitle,
        itemDescription: input.itemDescription,
        itemImages: input.itemImages,
        itemPrice: input.itemPrice,
        releaseCondition: input.releaseCondition as any,
        sourceUrl: input.sourceUrl,
        sourceMetadata: input.sourceMetadata,
      });

      // Create wallet
      await createEscrowWallet({
        id: walletId,
        escrowId,
        totalFunded: 0,
        totalReleased: 0,
        totalRefunded: 0,
        currentBalance: 0,
        buyerAmount: 0,
        sellerAmount: 0,
        platformAmount: 0,
      });

      // Log action
      await logAuditAction("escrow", escrowId, "created", ctx.user.id, {}, input);

      // Notify seller
      await notifyUser(
        input.sellerId,
        "escrow_created",
        "New Escrow Transaction",
        `A new escrow transaction has been created for "${input.title}"`,
        "escrow",
        escrowId
      );

      return escrow;
    }),

    getById: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
      const escrow = await getEscrowById(input.id);
      if (!escrow) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Escrow not found" });
      }

      // Check access
      if (escrow.buyerId !== ctx.user.id && escrow.sellerId !== ctx.user.id && ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
      }

      return escrow;
    }),

    getMyEscrows: protectedProcedure
      .input(
        z.object({
          role: z.enum(["buyer", "seller"]),
          limit: z.number().int().default(20),
          offset: z.number().int().default(0),
        })
      )
      .query(async ({ ctx, input }) => {
        return await getUserEscrows(ctx.user.id, input.role, input.limit, input.offset);
      }),

    initiatePayment: protectedProcedure
      .input(
        z.object({
          escrowId: z.string(),
          paymentMethod: z.string(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const escrow = await getEscrowById(input.escrowId);
        if (!escrow) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Escrow not found" });
        }

        if (escrow.buyerId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Only buyer can initiate payment" });
        }

        // Generate payment ID (in real implementation, integrate with Mayar)
        const paymentId = `PAY-${uuidv4().substring(0, 8)}`;
        const paymentUrl = `https://payment.rekberpay.com/pay/${paymentId}`;

        await updateEscrowPayment(input.escrowId, input.paymentMethod, paymentId, paymentUrl);
        await logAuditAction("escrow", input.escrowId, "payment_initiated", ctx.user.id);

        return { paymentId, paymentUrl };
      }),

    confirmPayment: protectedProcedure
      .input(z.object({ escrowId: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const escrow = await getEscrowById(input.escrowId);
        if (!escrow) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Escrow not found" });
        }

        // Update escrow status
        await markEscrowFunded(input.escrowId);

        // Update wallet
        const wallet = await getEscrowWallet(input.escrowId);
        if (wallet) {
          await updateEscrowWalletBalance(
            input.escrowId,
            escrow.amount,
            0,
            0
          );
        }

        // Create transaction record
        await createTransaction({
          id: uuidv4(),
          escrowId: input.escrowId,
          type: "fund",
          amount: escrow.amount,
          fromUserId: ctx.user.id,
          toUserId: escrow.sellerId,
          status: "completed",
          completedAt: new Date(),
        });

        await logAuditAction("escrow", input.escrowId, "payment_confirmed", ctx.user.id);

        // Notify seller
        await notifyUser(
          escrow.sellerId,
          "escrow_funded",
          "Escrow Funded",
          `Escrow for "${escrow.title}" has been funded`,
          "escrow",
          input.escrowId
        );

        return { success: true };
      }),

    releasePayment: protectedProcedure
      .input(z.object({ escrowId: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const escrow = await getEscrowById(input.escrowId);
        if (!escrow) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Escrow not found" });
        }

        if (escrow.buyerId !== ctx.user.id && ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Only buyer can release payment" });
        }

        // Update escrow status
        await completeEscrow(input.escrowId);

        // Create transaction record
        await createTransaction({
          id: uuidv4(),
          escrowId: input.escrowId,
          type: "release",
          amount: escrow.amount,
          fromUserId: ctx.user.id,
          toUserId: escrow.sellerId,
          status: "completed",
          completedAt: new Date(),
        });

        await logAuditAction("escrow", input.escrowId, "payment_released", ctx.user.id);

        // Notify seller
        await notifyUser(
          escrow.sellerId,
          "escrow_released",
          "Payment Released",
          `Payment for "${escrow.title}" has been released`,
          "escrow",
          input.escrowId
        );

        return { success: true };
      }),
  }),

  // ========================================================================
  // DISPUTE ROUTER
  // ========================================================================
  dispute: router({
    create: protectedProcedure.input(CreateDisputeSchema).mutation(async ({ ctx, input }) => {
      const escrow = await getEscrowById(input.escrowId);
      if (!escrow) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Escrow not found" });
      }

      // Check if user is involved
      if (escrow.buyerId !== ctx.user.id && escrow.sellerId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Only involved parties can create dispute" });
      }

      const disputeId = uuidv4();
      const dispute = await createDispute({
        id: disputeId,
        escrowId: input.escrowId,
        initiatedBy: ctx.user.id,
        initiatedAgainst: escrow.buyerId === ctx.user.id ? escrow.sellerId : escrow.buyerId,
        reason: input.reason,
        description: input.description,
      });

      // Update escrow status
      await updateEscrowStatus(input.escrowId, "disputed");

      await logAuditAction("dispute", disputeId, "created", ctx.user.id, {}, input);

      // Notify other party
      const otherPartyId = escrow.buyerId === ctx.user.id ? escrow.sellerId : escrow.buyerId;
      await notifyUser(
        otherPartyId,
        "dispute_created",
        "Dispute Created",
        `A dispute has been created for escrow "${escrow.title}"`,
        "dispute",
        disputeId
      );

      return dispute;
    }),

    getByEscrowId: protectedProcedure
      .input(z.object({ escrowId: z.string() }))
      .query(async ({ ctx, input }) => {
        return await getDisputeByEscrowId(input.escrowId);
      }),

    addMessage: protectedProcedure.input(AddDisputeMessageSchema).mutation(async ({ ctx, input }) => {
      const message = await addDisputeMessage({
        id: uuidv4(),
        disputeId: input.disputeId,
        senderId: ctx.user.id,
        message: input.message,
        attachments: input.attachments,
      });

      await logAuditAction("dispute_message", message!.id, "created", ctx.user.id);
      return message;
    }),

    getMessages: protectedProcedure
      .input(z.object({ disputeId: z.string() }))
      .query(async ({ ctx, input }) => {
        return await getDisputeMessages(input.disputeId);
      }),
  }),

  // ========================================================================
  // REVIEW ROUTER
  // ========================================================================
  review: router({
    create: protectedProcedure.input(CreateReviewSchema).mutation(async ({ ctx, input }) => {
      const review = await createReview({
        id: uuidv4(),
        escrowId: input.escrowId,
        reviewerId: ctx.user.id,
        revieweeId: input.revieweeId,
        rating: input.rating,
        title: input.title,
        comment: input.comment,
        communicationRating: input.communicationRating,
        reliabilityRating: input.reliabilityRating,
        productQualityRating: input.productQualityRating,
      });

      await logAuditAction("review", review!.id, "created", ctx.user.id);
      return review;
    }),
  }),

  // ========================================================================
  // ADMIN ROUTER
  // ========================================================================
  admin: router({
    getUsers: adminProcedure
      .input(z.object({ limit: z.number().int().default(50), offset: z.number().int().default(0) }))
      .query(async ({ input }) => {
        return await getAllUsers(input.limit, input.offset);
      }),

    getEscrows: adminProcedure
      .input(z.object({ limit: z.number().int().default(50), offset: z.number().int().default(0) }))
      .query(async ({ input }) => {
        return await getAllEscrows(input.limit, input.offset);
      }),

    getDisputes: adminProcedure
      .input(z.object({ limit: z.number().int().default(50), offset: z.number().int().default(0) }))
      .query(async ({ input }) => {
        return await getAllDisputes(input.limit, input.offset);
      }),

    getStats: adminProcedure.query(async () => {
      return await getEscrowStats();
    }),

    freezeUser: adminProcedure
      .input(z.object({ userId: z.number().int(), reason: z.string() }))
      .mutation(async ({ ctx, input }) => {
        await freezeUser(input.userId, input.reason);
        await logAuditAction("user", input.userId.toString(), "frozen", ctx.user.id, {}, { reason: input.reason });
        return { success: true };
      }),

    unfreezeUser: adminProcedure
      .input(z.object({ userId: z.number().int() }))
      .mutation(async ({ ctx, input }) => {
        await unfreezeUser(input.userId);
        await logAuditAction("user", input.userId.toString(), "unfrozen", ctx.user.id);
        return { success: true };
      }),

    getAuditLogs: adminProcedure
      .input(z.object({ entityType: z.string(), entityId: z.string() }))
      .query(async ({ input }) => {
        return await getEntityAuditLogs(input.entityType, input.entityId);
      }),
  }),
});

export type AppRouter = typeof appRouter;
