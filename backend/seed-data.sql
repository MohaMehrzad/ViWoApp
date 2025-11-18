-- Insert test users
INSERT INTO users (id, username, email, password_hash, display_name, bio, verification_tier, created_at, updated_at)
VALUES 
  ('a0000000-0000-0000-0000-000000000001', 'alice', 'alice@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Alice Johnson', 'Content creator and crypto enthusiast', 'VERIFIED', NOW(), NOW()),
  ('b0000000-0000-0000-0000-000000000002', 'bob', 'bob@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Bob Smith', 'Tech blogger and developer', 'PREMIUM', NOW(), NOW()),
  ('c0000000-0000-0000-0000-000000000003', 'charlie', 'charlie@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Charlie Brown', 'Just exploring ViWoApp', 'BASIC', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert VCoin balances
INSERT INTO vcoin_balances (user_id, available_balance, staked_balance, earned_total, spent_total, updated_at)
VALUES 
  ('a0000000-0000-0000-0000-000000000001', 1000.0, 0, 1000.0, 0, NOW()),
  ('b0000000-0000-0000-0000-000000000002', 500.0, 500.0, 1000.0, 0, NOW()),
  ('c0000000-0000-0000-0000-000000000003', 100.0, 0, 100.0, 0, NOW())
ON CONFLICT (user_id) DO NOTHING;

-- Insert user reputation scores
INSERT INTO user_reputation_scores (user_id, account_age_score, historical_quality_score, verification_score, community_standing_score, overall_reputation, last_calculated)
VALUES 
  ('a0000000-0000-0000-0000-000000000001', 1.2, 1.5, 1.4, 1.3, 1.6, NOW()),
  ('b0000000-0000-0000-0000-000000000002', 1.5, 1.8, 1.8, 1.6, 2.2, NOW()),
  ('c0000000-0000-0000-0000-000000000003', 1.0, 1.0, 1.0, 1.0, 1.0, NOW())
ON CONFLICT (user_id) DO NOTHING;

-- Insert sample posts
INSERT INTO posts (id, user_id, content, likes_count, shares_count, comments_count, views_count, created_at, updated_at)
VALUES 
  ('p0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Just joined ViWoApp! Excited to earn VCoin through quality content 🚀', 15, 3, 2, 100, NOW(), NOW()),
  ('p0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', 'The token economy here is revolutionary! Love how quality content gets rewarded.', 25, 5, 4, 150, NOW(), NOW()),
  ('p0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000003', 'Learning about blockchain and DeFi. Any resources to share?', 10, 1, 3, 75, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert sample comments
INSERT INTO comments (id, user_id, post_id, content, created_at)
VALUES 
  (gen_random_uuid(), 'b0000000-0000-0000-0000-000000000002', 'p0000000-0000-0000-0000-000000000001', 'Welcome Alice! You''ll love it here 👋', NOW()),
  (gen_random_uuid(), 'c0000000-0000-0000-0000-000000000003', 'p0000000-0000-0000-0000-000000000002', 'Agreed! The anti-bot system is really smart too.', NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert follows
INSERT INTO follows (id, follower_id, following_id, created_at)
VALUES 
  (gen_random_uuid(), 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002', NOW()),
  (gen_random_uuid(), 'c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', NOW()),
  (gen_random_uuid(), 'c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000002', NOW())
ON CONFLICT DO NOTHING;

SELECT 'Database seeded successfully!' as status;

