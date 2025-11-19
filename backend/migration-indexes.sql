-- ============================================
-- VIWOAPP BACKEND - PERFORMANCE INDEXES
-- ============================================
-- This SQL file contains indexes to optimize database performance
-- Run this after initial migration: psql -U viwoapp -d viwoapp -f migration-indexes.sql
-- Or run inside Prisma: npx prisma db execute --file migration-indexes.sql

-- ==========================================
-- POSTS TABLE INDEXES
-- ==========================================

-- Index for fetching user's posts sorted by creation date
CREATE INDEX IF NOT EXISTS idx_posts_user_created 
ON posts(user_id, created_at DESC);

-- Index for fetching posts by type (text, image, video)
CREATE INDEX IF NOT EXISTS idx_posts_type 
ON posts(type);

-- Index for content search (if using text search)
CREATE INDEX IF NOT EXISTS idx_posts_content 
ON posts USING gin(to_tsvector('english', content));

-- Composite index for filtering posts by visibility and date
CREATE INDEX IF NOT EXISTS idx_posts_visibility_created 
ON posts(visibility, created_at DESC);

-- ==========================================
-- VCOIN TRANSACTIONS TABLE INDEXES
-- ==========================================

-- Index for fetching user's transactions sorted by date
CREATE INDEX IF NOT EXISTS idx_vcoin_transactions_user_created 
ON vcoin_transactions(user_id, created_at DESC);

-- Index for transaction type filtering
CREATE INDEX IF NOT EXISTS idx_vcoin_transactions_type 
ON vcoin_transactions(type);

-- Index for transaction source filtering
CREATE INDEX IF NOT EXISTS idx_vcoin_transactions_source 
ON vcoin_transactions(source);

-- Index for transaction status
CREATE INDEX IF NOT EXISTS idx_vcoin_transactions_status 
ON vcoin_transactions(status);

-- Composite index for user + type + date
CREATE INDEX IF NOT EXISTS idx_vcoin_transactions_user_type_created 
ON vcoin_transactions(user_id, type, created_at DESC);

-- ==========================================
-- NOTIFICATIONS TABLE INDEXES
-- ==========================================

-- Index for fetching user's notifications sorted by date
CREATE INDEX IF NOT EXISTS idx_notifications_user_created 
ON notifications(user_id, created_at DESC);

-- Index for unread notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_read 
ON notifications(user_id, read_at);

-- Index for notification type
CREATE INDEX IF NOT EXISTS idx_notifications_type 
ON notifications(type);

-- Composite index for user + type + read status
CREATE INDEX IF NOT EXISTS idx_notifications_user_type_read 
ON notifications(user_id, type, read_at);

-- ==========================================
-- POST INTERACTIONS TABLE INDEXES
-- ==========================================

-- Index for user's interactions
CREATE INDEX IF NOT EXISTS idx_post_interactions_user 
ON post_interactions(user_id);

-- Index for post's interactions
CREATE INDEX IF NOT EXISTS idx_post_interactions_post 
ON post_interactions(post_id);

-- Unique composite index to prevent duplicate likes/reposts
CREATE UNIQUE INDEX IF NOT EXISTS idx_post_interactions_user_post_type 
ON post_interactions(user_id, post_id, type);

-- Index for interaction type
CREATE INDEX IF NOT EXISTS idx_post_interactions_type 
ON post_interactions(type);

-- ==========================================
-- COMMENTS TABLE INDEXES
-- ==========================================

-- Index for fetching post's comments
CREATE INDEX IF NOT EXISTS idx_comments_post_created 
ON comments(post_id, created_at DESC);

-- Index for user's comments
CREATE INDEX IF NOT EXISTS idx_comments_user_created 
ON comments(user_id, created_at DESC);

-- Index for parent comments (for replies)
CREATE INDEX IF NOT EXISTS idx_comments_parent 
ON comments(parent_comment_id);

-- ==========================================
-- FOLLOWS TABLE INDEXES
-- ==========================================

-- Index for follower's follows
CREATE INDEX IF NOT EXISTS idx_follows_follower 
ON follows(follower_id, created_at DESC);

-- Index for following's followers
CREATE INDEX IF NOT EXISTS idx_follows_following 
ON follows(following_id, created_at DESC);

-- Unique composite index to prevent duplicate follows
CREATE UNIQUE INDEX IF NOT EXISTS idx_follows_follower_following 
ON follows(follower_id, following_id);

-- ==========================================
-- MESSAGES TABLE INDEXES
-- ==========================================

-- Index for thread messages sorted by date
CREATE INDEX IF NOT EXISTS idx_messages_thread_created 
ON messages(thread_id, created_at DESC);

-- Index for sender's messages
CREATE INDEX IF NOT EXISTS idx_messages_sender 
ON messages(sender_id, created_at DESC);

-- Index for unread messages
CREATE INDEX IF NOT EXISTS idx_messages_read 
ON messages(read_at);

-- Composite index for thread + read status
CREATE INDEX IF NOT EXISTS idx_messages_thread_read 
ON messages(thread_id, read_at);

-- ==========================================
-- MESSAGE THREADS TABLE INDEXES
-- ==========================================

-- Index for user's threads
CREATE INDEX IF NOT EXISTS idx_message_threads_user 
ON message_thread_participants(user_id);

-- Index for thread participants
CREATE INDEX IF NOT EXISTS idx_message_threads_thread 
ON message_thread_participants(thread_id);

-- Composite index to prevent duplicate participants
CREATE UNIQUE INDEX IF NOT EXISTS idx_message_threads_user_thread 
ON message_thread_participants(user_id, thread_id);

-- ==========================================
-- VCOIN STAKES TABLE INDEXES
-- ==========================================

-- Index for user's stakes
CREATE INDEX IF NOT EXISTS idx_vcoin_stakes_user 
ON vcoin_stakes(user_id, created_at DESC);

-- Index for stake status
CREATE INDEX IF NOT EXISTS idx_vcoin_stakes_status 
ON vcoin_stakes(status);

-- Index for stake type
CREATE INDEX IF NOT EXISTS idx_vcoin_stakes_type 
ON vcoin_stakes(type);

-- Composite index for active stakes by user
CREATE INDEX IF NOT EXISTS idx_vcoin_stakes_user_status 
ON vcoin_stakes(user_id, status);

-- ==========================================
-- QUALITY SCORES TABLE INDEXES
-- ==========================================

-- Index for post quality scores
CREATE INDEX IF NOT EXISTS idx_quality_scores_post 
ON quality_scores(post_id);

-- Index for user quality scores
CREATE INDEX IF NOT EXISTS idx_quality_scores_user 
ON quality_scores(user_id, calculated_at DESC);

-- ==========================================
-- REPUTATION TABLE INDEXES
-- ==========================================

-- Index for user reputation
CREATE INDEX IF NOT EXISTS idx_reputation_user 
ON reputation(user_id);

-- Index for reputation sorted by score (for leaderboards)
CREATE INDEX IF NOT EXISTS idx_reputation_score 
ON reputation(reputation_score DESC);

-- Index for reputation tier
CREATE INDEX IF NOT EXISTS idx_reputation_tier 
ON reputation(tier);

-- ==========================================
-- SHORTS TABLE INDEXES
-- ==========================================

-- Index for user's shorts
CREATE INDEX IF NOT EXISTS idx_shorts_user_created 
ON shorts(user_id, created_at DESC);

-- Index for short visibility
CREATE INDEX IF NOT EXISTS idx_shorts_visibility 
ON shorts(visibility, created_at DESC);

-- Index for shorts sorted by views (for trending)
CREATE INDEX IF NOT EXISTS idx_shorts_views 
ON shorts(views_count DESC);

-- ==========================================
-- USERS TABLE INDEXES
-- ==========================================

-- Index for email lookup (if not already unique)
CREATE INDEX IF NOT EXISTS idx_users_email 
ON users(email);

-- Index for username lookup
CREATE INDEX IF NOT EXISTS idx_users_username 
ON users(username);

-- Index for verification status
CREATE INDEX IF NOT EXISTS idx_users_verified 
ON users(is_verified);

-- Index for user tier
CREATE INDEX IF NOT EXISTS idx_users_tier 
ON users(verification_tier);

-- ==========================================
-- ACTIVITY LOGS TABLE INDEXES
-- ==========================================

-- Index for user's activity logs
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_date 
ON activity_logs(user_id, activity_date DESC);

-- Index for activity type
CREATE INDEX IF NOT EXISTS idx_activity_logs_type 
ON activity_logs(activity_type);

-- Composite index for user + type + date
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_type_date 
ON activity_logs(user_id, activity_type, activity_date DESC);

-- ==========================================
-- VERIFICATION APPLICATIONS TABLE INDEXES
-- ==========================================

-- Index for user's verification applications
CREATE INDEX IF NOT EXISTS idx_verification_applications_user 
ON verification_applications(user_id, created_at DESC);

-- Index for application status
CREATE INDEX IF NOT EXISTS idx_verification_applications_status 
ON verification_applications(status);

-- Index for pending applications
CREATE INDEX IF NOT EXISTS idx_verification_applications_status_created 
ON verification_applications(status, created_at DESC);

-- ==========================================
-- PERFORMANCE TIPS
-- ==========================================

-- Vacuum and analyze tables after creating indexes
VACUUM ANALYZE posts;
VACUUM ANALYZE vcoin_transactions;
VACUUM ANALYZE notifications;
VACUUM ANALYZE post_interactions;
VACUUM ANALYZE comments;
VACUUM ANALYZE follows;
VACUUM ANALYZE messages;
VACUUM ANALYZE vcoin_stakes;
VACUUM ANALYZE quality_scores;
VACUUM ANALYZE reputation;
VACUUM ANALYZE shorts;
VACUUM ANALYZE users;
VACUUM ANALYZE activity_logs;
VACUUM ANALYZE verification_applications;

-- ==========================================
-- VERIFY INDEXES
-- ==========================================

-- Run this query to see all indexes:
-- SELECT tablename, indexname, indexdef 
-- FROM pg_indexes 
-- WHERE schemaname = 'public' 
-- ORDER BY tablename, indexname;

-- Check index usage:
-- SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
-- FROM pg_stat_user_indexes
-- ORDER BY idx_scan;

-- Find unused indexes (after running in production for a while):
-- SELECT schemaname, tablename, indexname
-- FROM pg_stat_user_indexes
-- WHERE idx_scan = 0
-- AND indexname NOT LIKE 'pg_toast_%';

-- ==========================================
-- MAINTENANCE
-- ==========================================

-- Regular maintenance should include:
-- 1. VACUUM ANALYZE on active tables
-- 2. REINDEX CONCURRENTLY for heavily updated indexes
-- 3. Monitor index bloat
-- 4. Review slow query log

-- Example maintenance command:
-- REINDEX INDEX CONCURRENTLY idx_posts_user_created;

-- ==========================================
-- END OF INDEXES
-- ==========================================

