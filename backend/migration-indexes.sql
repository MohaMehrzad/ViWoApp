-- ============================================
-- VIWOAPP BACKEND - PERFORMANCE INDEXES
-- ============================================
-- High-impact composite indexes for common queries
-- Run with: psql -U viwoapp -d viwoapp -f migration-indexes.sql
-- Use CONCURRENTLY to avoid locking tables in production

-- ==========================================
-- Posts Table Indexes
-- ==========================================

-- Composite index for user's posts ordered by date
-- Used in: findByUserId queries, profile page
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_user_created 
ON posts(user_id, created_at DESC);

-- Covering index for feed queries (includes frequently accessed columns)
-- Reduces need for table lookups
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_feed_data 
ON posts(created_at DESC) 
INCLUDE (user_id, content, media_url, media_thumbnail, likes_count, shares_count, comments_count, views_count);

-- ==========================================
-- Post Interactions Table Indexes
-- ==========================================

-- Composite index for checking user's interactions on a post
-- Used in: like/share/repost checks, interaction lookups
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_interactions_post_user 
ON post_interactions(post_id, user_id);

-- Index for querying all interactions by type
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_interactions_type 
ON post_interactions(interaction_type, created_at DESC);

-- ==========================================
-- Follows Table Indexes
-- ==========================================

-- Composite index for follow relationships
-- Used in: follow/unfollow checks, followers list
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_follows_composite 
ON follows(follower_id, following_id);

-- Reverse index for finding who follows a user
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_follows_following 
ON follows(following_id, follower_id);

-- ==========================================
-- Comments Table Indexes
-- ==========================================

-- Composite index for post comments ordered by date
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_comments_post_created 
ON comments(post_id, created_at DESC);

-- Index for nested replies
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_comments_parent 
ON comments(parent_id, created_at DESC) 
WHERE parent_id IS NOT NULL;

-- ==========================================
-- Notifications Table Indexes
-- ==========================================

-- Composite index for user notifications
-- Already exists: @@index([userId, createdAt(sort: Desc)])
-- Covering index for notification queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_user_unread 
ON notifications(user_id, read_at, created_at DESC);

-- ==========================================
-- VCoin Transactions Table Indexes
-- ==========================================

-- Composite index for user transaction history
-- Already exists: @@index([userId, createdAt(sort: Desc)])
-- Additional index for filtering by type
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_vcoin_tx_user_type 
ON vcoin_transactions(user_id, type, created_at DESC);

-- ==========================================
-- Messages Table Indexes
-- ==========================================

-- Composite index for thread messages
-- Already exists: @@index([threadId, createdAt(sort: Desc)])
-- Additional index for unread messages
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_unread 
ON messages(thread_id, read_at, created_at DESC) 
WHERE read_at IS NULL;

-- ==========================================
-- Shorts Table Indexes
-- ==========================================

-- Composite index for user's shorts
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_shorts_user_created 
ON shorts(user_id, created_at DESC);

-- Index for trending shorts (high views)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_shorts_trending 
ON shorts(views_count DESC, created_at DESC);

-- ==========================================
-- Verify Indexes
-- ==========================================

-- Run this query to verify all indexes are created:
-- SELECT schemaname, tablename, indexname 
-- FROM pg_indexes 
-- WHERE schemaname = 'public' 
-- ORDER BY tablename, indexname;

-- ==========================================
-- Performance Notes
-- ==========================================
-- 1. CONCURRENTLY creates indexes without locking the table
-- 2. IF NOT EXISTS prevents errors if index already exists
-- 3. Covering indexes (INCLUDE) reduce table lookups
-- 4. Partial indexes (WHERE clause) save space for filtered queries
-- 5. Monitor index usage: SELECT * FROM pg_stat_user_indexes;
