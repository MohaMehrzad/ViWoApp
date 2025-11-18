-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "username" VARCHAR(30) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "display_name" VARCHAR(100),
    "avatar_url" TEXT,
    "bio" TEXT,
    "wallet_address" VARCHAR(42),
    "verification_tier" VARCHAR(20),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "posts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "media_type" VARCHAR(20),
    "media_url" TEXT,
    "media_thumbnail" TEXT,
    "likes_count" INTEGER NOT NULL DEFAULT 0,
    "shares_count" INTEGER NOT NULL DEFAULT 0,
    "reposts_count" INTEGER NOT NULL DEFAULT 0,
    "comments_count" INTEGER NOT NULL DEFAULT 0,
    "views_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shorts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" VARCHAR(255),
    "video_url" TEXT NOT NULL,
    "thumbnail_url" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "views_count" INTEGER NOT NULL DEFAULT 0,
    "likes_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shorts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comments" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "parent_id" TEXT,
    "content" TEXT NOT NULL,
    "likes_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_interactions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "interaction_type" VARCHAR(20) NOT NULL,
    "vcoin_earned" DECIMAL(18,8) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "post_interactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "follows" (
    "id" TEXT NOT NULL,
    "follower_id" TEXT NOT NULL,
    "following_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "follows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "thread_id" TEXT NOT NULL,
    "sender_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "media_url" TEXT,
    "read_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message_threads" (
    "id" TEXT NOT NULL,
    "participant_ids" TEXT[],
    "last_message_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "message_threads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "actor_id" TEXT,
    "post_id" TEXT,
    "amount" DECIMAL(18,8),
    "message" TEXT,
    "read_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fcm_tokens" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "device_type" VARCHAR(20),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fcm_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vcoin_balances" (
    "user_id" TEXT NOT NULL,
    "available_balance" DECIMAL(18,8) NOT NULL DEFAULT 0,
    "staked_balance" DECIMAL(18,8) NOT NULL DEFAULT 0,
    "earned_total" DECIMAL(18,8) NOT NULL DEFAULT 0,
    "spent_total" DECIMAL(18,8) NOT NULL DEFAULT 0,
    "last_reward_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vcoin_balances_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "vcoin_transactions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "amount" DECIMAL(18,8) NOT NULL,
    "type" VARCHAR(20) NOT NULL,
    "source" VARCHAR(50),
    "related_post_id" TEXT,
    "related_user_id" TEXT,
    "tx_hash" VARCHAR(66),
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vcoin_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_activities" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "posts_count" INTEGER NOT NULL DEFAULT 0,
    "likes_count" INTEGER NOT NULL DEFAULT 0,
    "comments_count" INTEGER NOT NULL DEFAULT 0,
    "shares_count" INTEGER NOT NULL DEFAULT 0,
    "follows_count" INTEGER NOT NULL DEFAULT 0,
    "total_points" INTEGER NOT NULL DEFAULT 0,
    "bot_penalty_applied" DECIMAL(3,2) NOT NULL DEFAULT 1.0,
    "quality_multiplier" DECIMAL(4,2) NOT NULL DEFAULT 1.0,
    "reputation_multiplier" DECIMAL(4,2) NOT NULL DEFAULT 1.0,
    "final_points" INTEGER NOT NULL DEFAULT 0,
    "vcn_earned" DECIMAL(18,8) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "daily_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_quality_scores" (
    "id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "engagement_rate" DECIMAL(6,4) NOT NULL,
    "retention_score" DECIMAL(4,2) NOT NULL,
    "virality_score" DECIMAL(4,2) NOT NULL,
    "comment_quality" DECIMAL(4,2) NOT NULL,
    "overall_score" DECIMAL(4,2) NOT NULL,
    "multiplier" DECIMAL(4,2) NOT NULL,
    "calculated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "content_quality_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_reputation_scores" (
    "user_id" TEXT NOT NULL,
    "account_age_score" DECIMAL(4,2) NOT NULL DEFAULT 1.0,
    "historical_quality_score" DECIMAL(4,2) NOT NULL DEFAULT 1.0,
    "verification_score" DECIMAL(4,2) NOT NULL DEFAULT 1.0,
    "community_standing_score" DECIMAL(4,2) NOT NULL DEFAULT 1.0,
    "overall_reputation" DECIMAL(4,2) NOT NULL DEFAULT 1.0,
    "last_calculated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_reputation_scores_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "vcoin_stakes" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "amount" DECIMAL(18,8) NOT NULL,
    "feature_type" VARCHAR(50) NOT NULL,
    "lock_period_days" INTEGER NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unlock_date" TIMESTAMP(3) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    "apy" DECIMAL(5,2),
    "rewards_earned" DECIMAL(18,8) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vcoin_stakes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vcoin_burns" (
    "id" TEXT NOT NULL,
    "amount" DECIMAL(18,8) NOT NULL,
    "source" VARCHAR(50) NOT NULL,
    "tx_hash" VARCHAR(66),
    "burned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vcoin_burns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vcoin_buybacks" (
    "id" TEXT NOT NULL,
    "usd_spent" DECIMAL(18,2) NOT NULL,
    "vcn_bought" DECIMAL(18,8) NOT NULL,
    "vcn_burned" DECIMAL(18,8) NOT NULL,
    "vcn_locked" DECIMAL(18,8) NOT NULL,
    "avg_price" DECIMAL(18,8),
    "dex_used" VARCHAR(50),
    "tx_hash" VARCHAR(66),
    "executed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vcoin_buybacks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_reward_distributions" (
    "id" TEXT NOT NULL,
    "distribution_date" DATE NOT NULL,
    "total_pool" DECIMAL(18,8) NOT NULL,
    "active_users_count" INTEGER NOT NULL,
    "total_points" BIGINT NOT NULL,
    "vcn_distributed" DECIMAL(18,8) NOT NULL,
    "avg_reward_per_user" DECIMAL(18,8),
    "top_earner_user_id" TEXT,
    "top_earner_amount" DECIMAL(18,8),
    "executed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "daily_reward_distributions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "module_revenues" (
    "id" TEXT NOT NULL,
    "module_name" VARCHAR(50) NOT NULL,
    "month" DATE NOT NULL,
    "revenue_usd" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "costs_usd" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "profit_usd" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "vcn_fees_collected" DECIMAL(18,8) NOT NULL DEFAULT 0,
    "vcn_burned" DECIMAL(18,8) NOT NULL DEFAULT 0,
    "vcn_staked" DECIMAL(18,8) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "module_revenues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bot_detection_flags" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "flag_type" VARCHAR(50) NOT NULL,
    "severity" VARCHAR(20) NOT NULL,
    "description" TEXT,
    "penalty_applied" DECIMAL(3,2),
    "flagged_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" TIMESTAMP(3),
    "status" VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "bot_detection_flags_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_wallet_address_key" ON "users"("wallet_address");

-- CreateIndex
CREATE INDEX "posts_user_id_idx" ON "posts"("user_id");

-- CreateIndex
CREATE INDEX "posts_created_at_idx" ON "posts"("created_at" DESC);

-- CreateIndex
CREATE INDEX "comments_post_id_idx" ON "comments"("post_id");

-- CreateIndex
CREATE INDEX "comments_user_id_idx" ON "comments"("user_id");

-- CreateIndex
CREATE INDEX "post_interactions_user_id_idx" ON "post_interactions"("user_id");

-- CreateIndex
CREATE INDEX "post_interactions_post_id_idx" ON "post_interactions"("post_id");

-- CreateIndex
CREATE UNIQUE INDEX "post_interactions_user_id_post_id_interaction_type_key" ON "post_interactions"("user_id", "post_id", "interaction_type");

-- CreateIndex
CREATE INDEX "follows_follower_id_idx" ON "follows"("follower_id");

-- CreateIndex
CREATE INDEX "follows_following_id_idx" ON "follows"("following_id");

-- CreateIndex
CREATE UNIQUE INDEX "follows_follower_id_following_id_key" ON "follows"("follower_id", "following_id");

-- CreateIndex
CREATE INDEX "messages_thread_id_created_at_idx" ON "messages"("thread_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "notifications_user_id_created_at_idx" ON "notifications"("user_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "vcoin_transactions_user_id_created_at_idx" ON "vcoin_transactions"("user_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "daily_activities_date_user_id_idx" ON "daily_activities"("date" DESC, "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "daily_activities_user_id_date_key" ON "daily_activities"("user_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "content_quality_scores_post_id_key" ON "content_quality_scores"("post_id");

-- CreateIndex
CREATE INDEX "content_quality_scores_post_id_idx" ON "content_quality_scores"("post_id");

-- CreateIndex
CREATE INDEX "vcoin_stakes_user_id_status_idx" ON "vcoin_stakes"("user_id", "status");

-- CreateIndex
CREATE INDEX "vcoin_stakes_unlock_date_idx" ON "vcoin_stakes"("unlock_date");

-- CreateIndex
CREATE UNIQUE INDEX "daily_reward_distributions_distribution_date_key" ON "daily_reward_distributions"("distribution_date");

-- CreateIndex
CREATE INDEX "daily_reward_distributions_distribution_date_idx" ON "daily_reward_distributions"("distribution_date" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "module_revenues_module_name_month_key" ON "module_revenues"("module_name", "month");

-- CreateIndex
CREATE INDEX "bot_detection_flags_user_id_status_idx" ON "bot_detection_flags"("user_id", "status");

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_interactions" ADD CONSTRAINT "post_interactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_interactions" ADD CONSTRAINT "post_interactions_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follows" ADD CONSTRAINT "follows_follower_id_fkey" FOREIGN KEY ("follower_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follows" ADD CONSTRAINT "follows_following_id_fkey" FOREIGN KEY ("following_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fcm_tokens" ADD CONSTRAINT "fcm_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vcoin_balances" ADD CONSTRAINT "vcoin_balances_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vcoin_transactions" ADD CONSTRAINT "vcoin_transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_activities" ADD CONSTRAINT "daily_activities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_quality_scores" ADD CONSTRAINT "content_quality_scores_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_reputation_scores" ADD CONSTRAINT "user_reputation_scores_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vcoin_stakes" ADD CONSTRAINT "vcoin_stakes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bot_detection_flags" ADD CONSTRAINT "bot_detection_flags_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

