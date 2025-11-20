import { Layout, Spacing, Typography, Motion, Radius } from '@/constants/theme';
import { useVCoin } from '@/contexts/VCoinContext';
import { useTheme } from '@/hooks/useTheme';
import { useAutoUpdateTime } from '@/hooks/useAutoUpdateTime';
import { usePostActions } from '@/hooks/usePostActions';
import { formatNumber } from '@/utils/formatters';
import { HapticFeedback } from '@/utils/haptics';
import { LucideIcons } from '@/utils/iconMapping';
import React, { useState, useRef, useEffect } from 'react';
import { Image, Pressable, Share, StyleSheet, Text, View, Animated, LayoutAnimation, UIManager, Platform, Alert } from 'react-native';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
import { VCoinGainChip } from './VCoinGainChip';
import { ComingSoonModal } from './ComingSoonModal';
import { PostActionSheet } from './PostActionSheet';

interface PostCardProps {
  id: string;
  author: {
    name: string;
    avatar: string;
  };
  content: string;
  media?: {
    type: 'image' | 'video';
    uri: string;
    aspectRatio?: number;
  };
  timestamp: number;
  relativeTime?: string; // Precomputed from backend
  initialLikes?: number;
  initialLikesFormatted?: string; // Precomputed from backend
  initialShares?: number;
  initialSharesFormatted?: string; // Precomputed from backend
  initialReposts?: number;
  initialRepostsFormatted?: string; // Precomputed from backend
  initialComments?: number;
  initialCommentsFormatted?: string; // Precomputed from backend
  isLiked?: boolean;
  isShared?: boolean;
  isReposted?: boolean;
}

export function PostCard({
  id,
  author,
  content,
  media,
  timestamp,
  relativeTime: providedRelativeTime,
  initialLikes = 0,
  initialLikesFormatted,
  initialShares = 0,
  initialSharesFormatted,
  initialReposts = 0,
  initialRepostsFormatted,
  initialComments = 0,
  initialCommentsFormatted,
  isLiked = false,
  isShared = false,
  isReposted = false,
}: PostCardProps) {
  const { colors } = useTheme();
  const { earnVCoin } = useVCoin();
  // Use backend's precomputed time if available, fallback to client-side for old posts
  const clientRelativeTime = useAutoUpdateTime(timestamp);
  const relativeTime = providedRelativeTime || clientRelativeTime;
  const { like, unlike, share, repost, isLiking, isSharing, isReposting } = usePostActions(id);

  const [liked, setLiked] = useState(isLiked);
  const [shared, setShared] = useState(isShared);
  const [reposted, setReposted] = useState(isReposted);
  const [likes, setLikes] = useState(initialLikes);
  const [likesFormatted, setLikesFormatted] = useState(initialLikesFormatted || formatNumber(initialLikes));
  const [shares, setShares] = useState(initialShares);
  const [sharesFormatted, setSharesFormatted] = useState(initialSharesFormatted || formatNumber(initialShares));
  const [reposts, setReposts] = useState(initialReposts);
  const [repostsFormatted, setRepostsFormatted] = useState(initialRepostsFormatted || formatNumber(initialReposts));
  const [comments] = useState(initialComments);
  const [commentsFormatted] = useState(initialCommentsFormatted || formatNumber(initialComments));

  // Animated colors for smooth transitions
  const likeScale = useRef(new Animated.Value(1)).current;
  const shareScale = useRef(new Animated.Value(1)).current;
  const repostScale = useRef(new Animated.Value(1)).current;

  const [showVCoinChip, setShowVCoinChip] = useState(false);
  const [vcoinEarned, setVcoinEarned] = useState(0);
  const [chipPosition, setChipPosition] = useState({ x: 0, y: 0 });
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [comingSoonFeature, setComingSoonFeature] = useState('');
  const [showActionSheet, setShowActionSheet] = useState(false);
  
  // Image loading state
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  
  // Text truncation state
  const [expanded, setExpanded] = useState(false);
  const TRUNCATE_LENGTH = 280;
  const needsTruncation = content.length > TRUNCATE_LENGTH;
  
  // Feature flags
  const commentsEnabled = false; // To be implemented
  const isOwnPost = false; // In production: author.id === currentUser.id
  
  // Enforce aspect ratio constraints
  const getConstrainedAspectRatio = (ratio?: number) => {
    if (!ratio) return 16 / 9; // Default fallback for legacy posts
    // Clamp to reasonable range (0.5 to 2.0)
    return Math.max(0.5, Math.min(ratio, 2.0));
  };

  const handleLike = async () => {
    if (isLiking) return; // Prevent double-clicks
    
    HapticFeedback.light();
    
    // Smoother spring animation for button
    Animated.sequence([
      Animated.spring(likeScale, {
        toValue: 1.25,
        ...Motion.spring.bouncy,
        useNativeDriver: true,
      }),
      Animated.spring(likeScale, {
        toValue: 1,
        ...Motion.spring.snappy,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Optimistic update
    const wasLiked = liked;
    const previousLikes = likes;
    
    try {
      if (!wasLiked) {
        setLiked(true);
        const newLikes = likes + 1;
        setLikes(newLikes);
        setLikesFormatted(formatNumber(newLikes));
        
        const response = await like();
        
        // Earn VCoin - use amount from backend response
        if (response?.vcoinEarned) {
          earnVCoin(response.vcoinEarned, 'like', id);
          showEarnChip(response.vcoinEarned, 'like');
        }
      } else {
        setLiked(false);
        const newLikes = likes - 1;
        setLikes(newLikes);
        setLikesFormatted(formatNumber(newLikes));
        
        await unlike();
      }
    } catch (error) {
      // Revert on error
      setLiked(wasLiked);
      setLikes(previousLikes);
      setLikesFormatted(formatNumber(previousLikes));
      console.error('Failed to like/unlike post:', error);
      Alert.alert('Error', 'Failed to update like. Please try again.');
    }
  };

  const handleShare = async () => {
    if (isSharing) return;
    
    HapticFeedback.medium();
    
    try {
      // Use system Share API
      const result = await Share.share({
        message: content,
        url: `viwo://posts/${id}`,
        title: `Post by ${author.name}`,
      });

      if (result.action === Share.sharedAction && !shared) {
        const previousShares = shares;
        
        try {
          setShared(true);
          const newShares = shares + 1;
          setShares(newShares);
          setSharesFormatted(formatNumber(newShares));
          
          const response = await share();
          
          // Earn VCoin - use amount from backend response
          if (response?.vcoinEarned) {
            earnVCoin(response.vcoinEarned, 'share', id);
            showEarnChip(response.vcoinEarned, 'share');
          }
        } catch (error) {
          // Revert on error
          setShared(false);
          setShares(previousShares);
          setSharesFormatted(formatNumber(previousShares));
          console.error('Failed to record share:', error);
        }
      }
    } catch (error) {
      console.error('Failed to share post:', error);
    }
  };

  const handleComment = () => {
    HapticFeedback.light();
    if (!commentsEnabled) {
      setComingSoonFeature('Comments');
      setShowComingSoon(true);
    }
    // Comment functionality will be implemented when backend is ready
  };

  const handleOverflowMenu = () => {
    HapticFeedback.light();
    setShowActionSheet(true);
  };

  const handleEdit = () => {
    setComingSoonFeature('Edit Post');
    setShowComingSoon(true);
  };

  const handleDelete = () => {
    setComingSoonFeature('Delete Post');
    setShowComingSoon(true);
  };

  const handleReport = () => {
    setComingSoonFeature('Report Post');
    setShowComingSoon(true);
  };

  const handleRepost = async () => {
    if (isReposting || reposted) return; // Can only repost once
    
    HapticFeedback.medium();
    
    const previousReposts = reposts;
    
    try {
      setReposted(true);
      const newReposts = reposts + 1;
      setReposts(newReposts);
      setRepostsFormatted(formatNumber(newReposts));
      
      const response = await repost();
      
      // Earn VCoin - use amount from backend response
      if (response?.vcoinEarned) {
        earnVCoin(response.vcoinEarned, 'repost', id);
        showEarnChip(response.vcoinEarned, 'repost');
      }
    } catch (error) {
      // Revert on error
      setReposted(false);
      setReposts(previousReposts);
      setRepostsFormatted(formatNumber(previousReposts));
      console.error('Failed to repost:', error);
      Alert.alert('Error', 'Failed to repost. Please try again.');
    }
  };

  const showEarnChip = (amount: number, action: string) => {
    setVcoinEarned(amount);
    setShowVCoinChip(true);
    
    // Position chip near the action button
    // In a real implementation, use onLayout to get button position
    setChipPosition({ x: 0, y: -20 });
  };

  return (
    <View 
      style={[
        styles.card, 
        {
          backgroundColor: colors.card,
          borderRadius: Radius.xl,
          borderWidth: 1,
          borderColor: colors.border,
          padding: Spacing.md,
        }
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View
          style={[
            styles.avatar,
            { backgroundColor: colors.accent + '20' },
          ]}
        >
          <LucideIcons.user 
            size={Layout.avatar.small * 0.5} 
            color={colors.accent} 
            strokeWidth={2}
          />
        </View>
        <View style={styles.headerText}>
          <Text
            style={[
              styles.authorName,
              {
                color: colors.textPrimary,
                fontSize: Typography.size.body,
                fontWeight: Typography.weight.semibold,
              },
            ]}
            numberOfLines={1}
            ellipsizeMode="tail"
            selectable={false}
          >
            {author.name}
          </Text>
          <Text
            style={[
              styles.timestamp,
              {
                color: colors.textSecondary,
                fontSize: Typography.size.caption,
              },
            ]}
            numberOfLines={1}
            selectable={false}
          >
            {relativeTime}
          </Text>
        </View>
        <Pressable 
          hitSlop={12}
          onPress={handleOverflowMenu}
          accessibilityLabel="Post options"
          accessibilityRole="button"
          accessibilityHint="Opens menu for post actions"
        >
          <LucideIcons.more
            size={20}
            color={colors.textSecondary}
            strokeWidth={2}
          />
        </Pressable>
      </View>

      {/* Content */}
      <View>
        <Text
          style={[
            styles.content,
            {
              color: colors.textPrimary,
              fontSize: Typography.size.body,
              lineHeight: Typography.lineHeight.body,
            },
          ]}
          numberOfLines={expanded ? undefined : 10}
        >
          {expanded || !needsTruncation
            ? content
            : `${content.slice(0, TRUNCATE_LENGTH)}...`}
        </Text>
        {needsTruncation && (
          <Pressable
            onPress={() => {
              LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
              setExpanded(!expanded);
            }}
            hitSlop={8}
            style={styles.seeMoreButton}
          >
            <Text
              style={[
                styles.seeMoreText,
                {
                  color: colors.accent,
                  fontSize: Typography.size.body2,
                  fontWeight: Typography.weight.semibold,
                },
              ]}
            >
              {expanded ? 'See less' : 'See more'}
            </Text>
          </Pressable>
        )}
      </View>

      {/* Media */}
      {media && !imageError && (
        <View style={styles.mediaContainer}>
          <Image
            source={{ uri: media.uri }}
            style={[
              styles.media,
              {
                aspectRatio: getConstrainedAspectRatio(media.aspectRatio),
              },
            ]}
            resizeMode="cover"
            onLoadStart={() => setImageLoading(true)}
            onLoadEnd={() => setImageLoading(false)}
            onError={() => {
              setImageError(true);
              setImageLoading(false);
            }}
          />
          {imageLoading && (
            <View style={[styles.imagePlaceholder, { backgroundColor: colors.glassFill }]}>
              <LucideIcons.image size={48} color={colors.textSecondary} strokeWidth={2} />
            </View>
          )}
        </View>
      )}
      
      {media && imageError && (
        <View style={[styles.imageErrorContainer, { backgroundColor: colors.glassFill }]}>
          <LucideIcons.image size={48} color={colors.textSecondary} strokeWidth={2} />
          <Text style={[styles.imageErrorText, { color: colors.textSecondary }]}>
            Image failed to load
          </Text>
        </View>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        <Animated.View style={{ transform: [{ scale: likeScale }] }}>
          <Pressable
            onPress={handleLike}
            style={styles.actionButton}
            hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
            accessibilityLabel={liked ? 'Unlike post' : 'Like post'}
            accessibilityRole="button"
            accessibilityState={{ selected: liked }}
            accessibilityHint={`${likes} likes`}
          >
            <LucideIcons.heart
              size={Layout.icon.sm}
              color={liked ? colors.danger : colors.textSecondary}
              strokeWidth={2}
              fill={liked ? colors.danger : 'none'}
            />
            <Text
              style={[
                styles.actionCount,
                {
                  color: liked ? colors.danger : colors.textSecondary,
                  opacity: likes > 0 ? 1 : 0.5,
                },
              ]}
              selectable={false}
            >
              {likes > 0 ? likesFormatted : '0'}
            </Text>
          </Pressable>
        </Animated.View>

        <Pressable
          onPress={handleComment}
          style={[
            styles.actionButton,
            !commentsEnabled && styles.disabledButton,
          ]}
          hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
          accessibilityLabel="Comments"
          accessibilityRole="button"
          accessibilityState={{ disabled: !commentsEnabled }}
          accessibilityHint={`${comments} comments${!commentsEnabled ? '. Coming soon' : ''}`}
        >
          <LucideIcons.comment
            size={Layout.icon.sm}
            color={colors.textSecondary}
            strokeWidth={2}
          />
          <Text
            style={[
              styles.actionCount,
              {
                color: colors.textSecondary,
                opacity: comments > 0 ? 1 : 0.5,
              },
            ]}
            selectable={false}
          >
            {comments > 0 ? commentsFormatted : '0'}
          </Text>
        </Pressable>

        <Pressable
          onPress={handleRepost}
          style={styles.actionButton}
          hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
          accessibilityLabel={reposted ? 'Unrepost' : 'Repost'}
          accessibilityRole="button"
          accessibilityState={{ selected: reposted }}
          accessibilityHint={`${reposts} reposts`}
        >
          <LucideIcons.repost
            size={Layout.icon.sm}
            color={reposted ? colors.success : colors.textSecondary}
            strokeWidth={reposted ? 2.5 : 2}
          />
          <Text
            style={[
              styles.actionCount,
              {
                color: reposted ? colors.success : colors.textSecondary,
                opacity: reposts > 0 ? 1 : 0.5,
              },
            ]}
            selectable={false}
          >
            {reposts > 0 ? repostsFormatted : '0'}
          </Text>
        </Pressable>

        <Pressable
          onPress={handleShare}
          style={styles.actionButton}
          hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
          accessibilityLabel="Share post"
          accessibilityRole="button"
          accessibilityState={{ selected: shared }}
          accessibilityHint={`${shares} shares`}
        >
          <LucideIcons.share
            size={Layout.icon.sm}
            color={shared ? colors.accent : colors.textSecondary}
            strokeWidth={shared ? 2.5 : 2}
          />
          <Text
            style={[
              styles.actionCount,
              {
                color: shared ? colors.accent : colors.textSecondary,
                opacity: shares > 0 ? 1 : 0.5,
              },
            ]}
            selectable={false}
          >
            {shares > 0 ? sharesFormatted : '0'}
          </Text>
        </Pressable>
      </View>

      {/* VCoin Gain Chip */}
      {showVCoinChip && (
        <View
          style={[
            styles.vcoinChipContainer,
            {
              top: chipPosition.y,
              left: chipPosition.x,
            },
          ]}
        >
          <VCoinGainChip
            amount={vcoinEarned}
            onComplete={() => setShowVCoinChip(false)}
          />
        </View>
      )}

      {/* Coming Soon Modal */}
      <ComingSoonModal
        visible={showComingSoon}
        onClose={() => setShowComingSoon(false)}
        featureName={comingSoonFeature}
        description="We're working hard to bring you this feature. Stay tuned for updates!"
      />

      {/* Post Action Sheet */}
      <PostActionSheet
        visible={showActionSheet}
        onClose={() => setShowActionSheet(false)}
        isOwnPost={isOwnPost}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onReport={handleReport}
        onShare={handleShare}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  avatar: {
    width: Layout.avatar.small,
    height: Layout.avatar.small,
    borderRadius: Layout.avatar.small / 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  avatarText: {
    fontSize: Layout.avatar.small * 0.5, // 50% of container
  },
  headerText: {
    flex: 1,
  },
  authorName: {
    marginBottom: 4,
  },
  timestamp: {
    marginTop: 4,
    opacity: 0.7,
  },
  content: {
    marginBottom: 0,
  },
  seeMoreButton: {
    marginTop: Spacing.xs,
    alignSelf: 'flex-start',
  },
  seeMoreText: {
    letterSpacing: 0.3,
  },
  mediaContainer: {
    marginVertical: Spacing.md,
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  media: {
    width: '100%',
  },
  imagePlaceholder: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: Radius.md,
  },
  imageErrorContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: Spacing.md,
  },
  imageErrorText: {
    marginTop: Spacing.md,
    fontSize: Typography.size.body2,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    gap: Spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    minWidth: 60,
  },
  actionCount: {
    marginLeft: 2,
    fontSize: Typography.size.caption,
    fontWeight: Typography.weight.medium,
  },
  disabledButton: {
    opacity: 0.4,
  },
  vcoinChipContainer: {
    position: 'absolute',
    bottom: 50,
    right: 24,
  },
});

