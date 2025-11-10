CREATE TABLE `api_keys` (
	`id` varchar(64) NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`keyHash` varchar(255) NOT NULL,
	`permissions` text NOT NULL,
	`rateLimit` int,
	`isActive` boolean NOT NULL DEFAULT true,
	`lastUsedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `api_keys_id` PRIMARY KEY(`id`),
	CONSTRAINT `api_keys_keyHash_unique` UNIQUE(`keyHash`)
);
--> statement-breakpoint
CREATE TABLE `audit_logs` (
	`id` varchar(64) NOT NULL,
	`entityType` varchar(50) NOT NULL,
	`entityId` varchar(64) NOT NULL,
	`action` varchar(100) NOT NULL,
	`userId` int,
	`oldValues` text,
	`newValues` text,
	`ipAddress` varchar(45),
	`userAgent` text,
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `blacklist` (
	`id` varchar(64) NOT NULL,
	`entryType` varchar(50) NOT NULL,
	`entryValue` varchar(255) NOT NULL,
	`reason` text,
	`source` varchar(100),
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `blacklist_id` PRIMARY KEY(`id`),
	CONSTRAINT `entry_idx` UNIQUE(`entryType`,`entryValue`)
);
--> statement-breakpoint
CREATE TABLE `dispute_messages` (
	`id` varchar(64) NOT NULL,
	`disputeId` varchar(64) NOT NULL,
	`senderId` int NOT NULL,
	`message` text NOT NULL,
	`attachments` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `dispute_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `disputes` (
	`id` varchar(64) NOT NULL,
	`escrowId` varchar(64) NOT NULL,
	`initiatedBy` int NOT NULL,
	`initiatedAgainst` int NOT NULL,
	`mediatorId` int,
	`reason` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`status` enum('open','in_review','mediation','escalated','resolved','closed') NOT NULL DEFAULT 'open',
	`resolution` enum('pending','split','full_refund','full_release','custom') DEFAULT 'pending',
	`resolutionDetails` text,
	`resolutionNotes` text,
	`buyerEvidence` text,
	`sellerEvidence` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`resolvedAt` timestamp,
	`closedAt` timestamp,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `disputes_id` PRIMARY KEY(`id`),
	CONSTRAINT `disputes_escrowId_unique` UNIQUE(`escrowId`),
	CONSTRAINT `escrow_dispute_idx` UNIQUE(`escrowId`)
);
--> statement-breakpoint
CREATE TABLE `escrow_wallets` (
	`id` varchar(64) NOT NULL,
	`escrowId` varchar(64) NOT NULL,
	`totalFunded` int NOT NULL DEFAULT 0,
	`totalReleased` int NOT NULL DEFAULT 0,
	`totalRefunded` int NOT NULL DEFAULT 0,
	`currentBalance` int NOT NULL DEFAULT 0,
	`buyerAmount` int NOT NULL DEFAULT 0,
	`sellerAmount` int NOT NULL DEFAULT 0,
	`platformAmount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `escrow_wallets_id` PRIMARY KEY(`id`),
	CONSTRAINT `escrow_wallets_escrowId_unique` UNIQUE(`escrowId`),
	CONSTRAINT `escrow_id_idx` UNIQUE(`escrowId`)
);
--> statement-breakpoint
CREATE TABLE `escrows` (
	`id` varchar(64) NOT NULL,
	`buyerId` int NOT NULL,
	`sellerId` int NOT NULL,
	`mediatorId` int,
	`title` varchar(255) NOT NULL,
	`description` text,
	`amount` int NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'IDR',
	`itemTitle` varchar(255),
	`itemDescription` text,
	`itemImages` text,
	`itemPrice` int,
	`status` enum('created','pending_payment','funded','in_progress','completed','disputed','cancelled','refunded') NOT NULL DEFAULT 'created',
	`paymentMethod` varchar(50),
	`paymentId` varchar(255),
	`paymentUrl` text,
	`paidAt` timestamp,
	`releaseCondition` enum('manual','confirmation','delivery_proof','milestone','auto') NOT NULL DEFAULT 'manual',
	`releaseProofRequired` boolean NOT NULL DEFAULT false,
	`milestones` text,
	`currentMilestone` int NOT NULL DEFAULT 0,
	`platformFee` int NOT NULL DEFAULT 0,
	`serviceFee` int NOT NULL DEFAULT 0,
	`totalFee` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`fundedAt` timestamp,
	`completedAt` timestamp,
	`expiresAt` timestamp,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`sourceUrl` text,
	`sourceMetadata` text,
	CONSTRAINT `escrows_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `fee_configs` (
	`id` varchar(64) NOT NULL,
	`transactionType` varchar(50),
	`region` varchar(10) DEFAULT 'ID',
	`userTier` varchar(50) DEFAULT 'standard',
	`platformFeePercentage` decimal(5,2) DEFAULT '2.5',
	`platformFeeFixed` int DEFAULT 0,
	`serviceFeePercentage` decimal(5,2) DEFAULT '0',
	`serviceFeeFixed` int DEFAULT 0,
	`minAmount` int DEFAULT 0,
	`maxAmount` int,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `fee_configs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` varchar(64) NOT NULL,
	`userId` int NOT NULL,
	`type` varchar(50) NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`relatedEntityType` varchar(50),
	`relatedEntityId` varchar(64),
	`isRead` boolean NOT NULL DEFAULT false,
	`emailSent` boolean NOT NULL DEFAULT false,
	`smsSent` boolean NOT NULL DEFAULT false,
	`pushSent` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`readAt` timestamp,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payment_methods` (
	`id` varchar(64) NOT NULL,
	`userId` int NOT NULL,
	`type` varchar(50) NOT NULL,
	`provider` varchar(50),
	`encryptedData` text NOT NULL,
	`displayName` varchar(255),
	`lastFourDigits` varchar(4),
	`isDefault` boolean NOT NULL DEFAULT false,
	`isActive` boolean NOT NULL DEFAULT true,
	`isVerified` boolean NOT NULL DEFAULT false,
	`verifiedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payment_methods_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` varchar(64) NOT NULL,
	`escrowId` varchar(64) NOT NULL,
	`reviewerId` int NOT NULL,
	`revieweeId` int NOT NULL,
	`rating` int NOT NULL,
	`title` varchar(255),
	`comment` text,
	`communicationRating` int,
	`reliabilityRating` int,
	`productQualityRating` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `reviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` varchar(64) NOT NULL,
	`escrowId` varchar(64) NOT NULL,
	`type` enum('fund','release','refund','fee','payout','adjustment') NOT NULL,
	`amount` int NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'IDR',
	`fromUserId` int,
	`toUserId` int,
	`paymentGateway` varchar(50),
	`paymentGatewayId` varchar(255),
	`status` enum('pending','completed','failed','cancelled') NOT NULL DEFAULT 'pending',
	`description` text,
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `webhooks` (
	`id` varchar(64) NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`url` text NOT NULL,
	`events` text NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`maxRetries` int NOT NULL DEFAULT 3,
	`retryInterval` int NOT NULL DEFAULT 300,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `webhooks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','agent_admin','mediator') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `users` ADD `phone` varchar(20);--> statement-breakpoint
ALTER TABLE `users` ADD `profileImage` text;--> statement-breakpoint
ALTER TABLE `users` ADD `bio` text;--> statement-breakpoint
ALTER TABLE `users` ADD `kycStatus` enum('pending','verified','rejected','expired') DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `kycVerifiedAt` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `kycExpiresAt` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `kycData` text;--> statement-breakpoint
ALTER TABLE `users` ADD `isActive` boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `isFrozen` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `freezeReason` text;--> statement-breakpoint
ALTER TABLE `users` ADD `totalDeals` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `completedDeals` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `ratingScore` decimal(3,2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE `users` ADD `reviewCount` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_email_unique` UNIQUE(`email`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `api_keys` (`userId`);--> statement-breakpoint
CREATE INDEX `active_idx` ON `api_keys` (`isActive`);--> statement-breakpoint
CREATE INDEX `entity_idx` ON `audit_logs` (`entityType`,`entityId`);--> statement-breakpoint
CREATE INDEX `action_idx` ON `audit_logs` (`action`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `audit_logs` (`userId`);--> statement-breakpoint
CREATE INDEX `active_idx` ON `blacklist` (`isActive`);--> statement-breakpoint
CREATE INDEX `dispute_id_idx` ON `dispute_messages` (`disputeId`);--> statement-breakpoint
CREATE INDEX `sender_idx` ON `dispute_messages` (`senderId`);--> statement-breakpoint
CREATE INDEX `dispute_status_idx` ON `disputes` (`status`);--> statement-breakpoint
CREATE INDEX `buyer_idx` ON `escrows` (`buyerId`);--> statement-breakpoint
CREATE INDEX `seller_idx` ON `escrows` (`sellerId`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `escrows` (`status`);--> statement-breakpoint
CREATE INDEX `created_at_idx` ON `escrows` (`createdAt`);--> statement-breakpoint
CREATE INDEX `type_idx` ON `fee_configs` (`transactionType`);--> statement-breakpoint
CREATE INDEX `region_idx` ON `fee_configs` (`region`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `notifications` (`userId`);--> statement-breakpoint
CREATE INDEX `type_idx` ON `notifications` (`type`);--> statement-breakpoint
CREATE INDEX `is_read_idx` ON `notifications` (`isRead`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `payment_methods` (`userId`);--> statement-breakpoint
CREATE INDEX `type_idx` ON `payment_methods` (`type`);--> statement-breakpoint
CREATE INDEX `escrow_review_idx` ON `reviews` (`escrowId`);--> statement-breakpoint
CREATE INDEX `reviewer_idx` ON `reviews` (`reviewerId`);--> statement-breakpoint
CREATE INDEX `reviewee_idx` ON `reviews` (`revieweeId`);--> statement-breakpoint
CREATE INDEX `escrow_id_idx` ON `transactions` (`escrowId`);--> statement-breakpoint
CREATE INDEX `type_idx` ON `transactions` (`type`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `transactions` (`status`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `webhooks` (`userId`);--> statement-breakpoint
CREATE INDEX `active_idx` ON `webhooks` (`isActive`);--> statement-breakpoint
CREATE INDEX `email_idx` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `phone_idx` ON `users` (`phone`);--> statement-breakpoint
CREATE INDEX `kyc_status_idx` ON `users` (`kycStatus`);