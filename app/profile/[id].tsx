import { ErrorView } from '@/components/ErrorView';
import { GlassButton } from '@/components/GlassButton';
import { LoadingSpinner } from '@/components/LoadingState';
import { PostCard } from '@/components/PostCard';
import { ProfileHeader } from '@/components/ProfileHeader';
import { ProfileStatsGrid } from '@/components/ProfileStatsGrid';
import { ProfileTab, ProfileTabs } from '@/components/ProfileTabs';
import { SocialLinks } from '@/components/SocialLinks';
import { LiquidGlass, Spacing, Typography } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useFollowActions } from '@/hooks/useFollowActions';
import { useProfileView } from '@/hooks/useProfileView';
import { useTheme } from '@/hooks/useTheme';
import { LucideIcons } from '@/utils/iconMapping';
import { BlurView } from '@react-native-community/blur';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, blurType, glassFill, hairlineBorder } = useTheme();
  const { user: currentUser } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [activeTab, setActiveTab] = useState<ProfileTab>('posts');
  const [refreshing, setRefreshing] = useState(false);

  // Use aggregated profile view endpoint - reduces 3 API calls to 1
  const { data: profileView, isLoading, error, refetch } = useProfileView(id);
  
  // Extract data from aggregated response
  const user = profileView?.user;
  const stats = profileView?.stats;
  const posts = profileView?.recentPosts ?? [];
  
  const { follow, unfollow, isFollowing, isUnfollowing } = useFollowActions(id);
  const { logout } = useAuth();

  const isOwnProfile = currentUser?.id === id;

  const handleFollowToggle = async () => {
    try {
      if (user?.isFollowing) {
        await unfollow();
      } else {
        await follow();
      }
      refetch();
    } catch (error) {
      console.error('Failed to follow/unfollow:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  };

  const handleEditProfile = () => {
    router.push('/profile/edit');
  };

  const handleMessage = () => {
    // TODO: Implement messaging
    console.log('Message user');
  };

  const handleShare = () => {
    // TODO: Implement profile sharing
    console.log('Share profile');
  };

  const handleStatPress = (stat: string) => {
    console.log('Stat pressed:', stat);
    // TODO: Navigate to detailed stat views
  };

  if (isLoading || !user) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <LoadingSpinner />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ErrorView
          variant="network"
          onRetry={() => refetch()}
          message="Failed to load profile."
        />
      </View>
    );
  }

  const renderPost = ({ item }: { item: any }) => {
    if (!item || !item.user) {
      return null;
    }
    
    return (
      <PostCard
        id={item.id}
        author={{
          name: item.user.displayName,
          avatar: '',
        }}
        content={item.content}
        media={
          item.mediaUrl
            ? {
                type: item.mediaType || 'image',
                uri: item.mediaUrl,
                // aspectRatio will be detected automatically by PostCard
              }
            : undefined
        }
        timestamp={new Date(item.createdAt).getTime()}
        initialLikes={item.likesCount}
        initialShares={item.sharesCount}
        initialReposts={item.repostsCount}
        initialComments={item.commentsCount}
        isLiked={item.isLiked}
        isShared={item.isShared}
        isReposted={item.isReposted}
      />
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'posts':
        return (
          <View>
            {posts.length > 0 ? (
              <View>
                {posts.map((post: any) => {
                  if (!post?.id) return null;
                  return (
                    <View key={post.id}>{renderPost({ item: post })}</View>
                  );
                })}
              </View>
            ) : (
              <View style={styles.emptyCard}>
                <LucideIcons.document size={32} color={colors.textTertiary} strokeWidth={2} />
                <Text
                  style={[
                    styles.emptyText,
                    {
                      color: colors.textTertiary,
                      fontSize: Typography.size.caption,
                    },
                  ]}
                >
                  No posts yet
                </Text>
              </View>
            )}
          </View>
        );
      case 'shorts':
        return (
          <View style={styles.emptyCard}>
            <LucideIcons.video size={32} color={colors.textTertiary} strokeWidth={2} />
            <Text style={[styles.emptyText, { color: colors.textTertiary, fontSize: Typography.size.caption }]}>
              No shorts yet
            </Text>
          </View>
        );
      case 'media':
        return (
          <View style={styles.emptyCard}>
            <LucideIcons.image size={32} color={colors.textTertiary} strokeWidth={2} />
            <Text style={[styles.emptyText, { color: colors.textTertiary, fontSize: Typography.size.caption }]}>
              No media yet
            </Text>
          </View>
        );
      case 'replies':
        return (
          <View style={styles.emptyCard}>
            <LucideIcons.messageCircle size={32} color={colors.textTertiary} strokeWidth={2} />
            <Text style={[styles.emptyText, { color: colors.textTertiary, fontSize: Typography.size.caption }]}>
              No replies yet
            </Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Glass Blur Header - Same as Feed Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top,
            backgroundColor: 'transparent',
          },
        ]}
      >
        {/* Background - Pure glass blur like iOS Control Center */}
        <View style={StyleSheet.absoluteFill}>
          <BlurView
            blurType={blurType}
            blurAmount={LiquidGlass.blur.intensity.appleGlass}
            reducedTransparencyFallbackColor="transparent"
            style={StyleSheet.absoluteFill}
          />
          
          {/* Bottom border */}
          <View
            style={[
              styles.bottomBorder,
              { backgroundColor: hairlineBorder },
            ]}
          />
        </View>

        {/* Content */}
        <View style={styles.headerContent}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.headerButton,
              {
                backgroundColor: glassFill(LiquidGlass.fillIntensity.subtle),
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: hairlineBorder,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <LucideIcons.arrowLeft size={20} color={colors.textPrimary} strokeWidth={2} />
          </Pressable>
          
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            {isOwnProfile ? 'My Profile' : user.displayName}
          </Text>
          
          <View style={styles.headerActions}>
            {!isOwnProfile && (
              <Pressable
                onPress={handleShare}
                style={({ pressed }) => [
                  styles.headerButton,
                  {
                    backgroundColor: glassFill(LiquidGlass.fillIntensity.subtle),
                    borderWidth: StyleSheet.hairlineWidth,
                    borderColor: hairlineBorder,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                <LucideIcons.share size={20} color={colors.textPrimary} strokeWidth={2} />
              </Pressable>
            )}
            {isOwnProfile && (
              <>
                <Pressable
                  onPress={handleEditProfile}
                  style={({ pressed }) => [
                    styles.headerButton,
                    {
                      backgroundColor: glassFill(LiquidGlass.fillIntensity.subtle),
                      borderWidth: StyleSheet.hairlineWidth,
                      borderColor: hairlineBorder,
                      opacity: pressed ? 0.8 : 1,
                    },
                  ]}
                >
                  <LucideIcons.edit size={18} color={colors.accent} strokeWidth={2} />
                </Pressable>
                <Pressable
                  onPress={handleLogout}
                  style={({ pressed }) => [
                    styles.headerButton,
                    {
                      backgroundColor: glassFill(LiquidGlass.fillIntensity.subtle),
                      borderWidth: StyleSheet.hairlineWidth,
                      borderColor: hairlineBorder,
                      opacity: pressed ? 0.8 : 1,
                    },
                  ]}
                >
                  <LucideIcons.logout size={18} color={colors.error} strokeWidth={2} />
                </Pressable>
              </>
            )}
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 48 }
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.accent}
          />
        }
      >
        {/* Profile Header with Cover & Avatar */}
        <ProfileHeader
          coverPhotoUrl={user.coverPhotoUrl}
          avatarUrl={user.avatarUrl}
          displayName={user.displayName}
          username={user.username}
          verificationTier={user.verificationTier}
          memberSince={user.createdAt}
        />

        {/* Bio - Compact */}
        {user.bio && (
          <View style={styles.bioSection}>
            <Text
              style={[
                styles.bio,
                {
                  color: colors.textPrimary,
                  fontSize: Typography.size.caption,
                },
              ]}
              numberOfLines={2}
            >
              {user.bio}
            </Text>
          </View>
        )}

        {/* Social Links & Location - Inline */}
        <SocialLinks
          location={user.location}
          website={user.website}
          socialLinks={user.socialLinks}
        />

        {/* Wallet Address - Compact */}
        {user.walletAddress && (
          <View style={styles.walletSection}>
            <LucideIcons.wallet size={14} color={colors.accent} strokeWidth={2} />
            <Text
              style={[
                styles.walletAddress,
                {
                  color: colors.textSecondary,
                  fontSize: Typography.size.caption,
                },
              ]}
              numberOfLines={1}
              ellipsizeMode="middle"
            >
              {user.walletAddress}
            </Text>
          </View>
        )}

        {/* Stats Grid */}
        {stats && (
          <ProfileStatsGrid stats={stats} onStatPress={handleStatPress} />
        )}

        {/* Action Buttons - Compact */}
        {!isOwnProfile && (
          <View style={styles.actions}>
            <GlassButton
              onPress={handleFollowToggle}
              variant={user.isFollowing ? 'secondary' : 'primary'}
              loading={isFollowing || isUnfollowing}
              style={styles.followButton}
            >
              <View style={styles.buttonContent}>
                <LucideIcons.userPlus size={16} color={user.isFollowing ? colors.textPrimary : colors.background} strokeWidth={2} />
                <Text style={[styles.buttonText, { color: user.isFollowing ? colors.textPrimary : colors.background }]}>
                  {user.isFollowing ? 'Following' : 'Follow'}
                </Text>
              </View>
            </GlassButton>
            <GlassButton
              onPress={handleMessage}
              variant="secondary"
              style={styles.messageButton}
            >
              <LucideIcons.messageCircle size={16} color={colors.textPrimary} strokeWidth={2} />
            </GlassButton>
          </View>
        )}

        {/* Content Tabs */}
        <ProfileTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          counts={{
            posts: user.postsCount,
            shorts: user.shortsCount,
          }}
        />

        {/* Tab Content */}
        {renderTabContent()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    overflow: 'hidden',
  },
  bottomBorder: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    height: 48,
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: Typography.size.body,
    fontWeight: Typography.weight.bold,
    flex: 1,
    marginHorizontal: Spacing.sm,
  },
  headerActions: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.md,
  },
  bioSection: {
    paddingHorizontal: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  bio: {
    lineHeight: 16,
  },
  walletSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  walletAddress: {
    fontFamily: 'monospace',
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    marginBottom: Spacing.xs,
    marginTop: Spacing.xs,
  },
  followButton: {
    flex: 1,
  },
  messageButton: {
    width: 44,
    paddingHorizontal: 0,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  buttonText: {
    fontSize: Typography.size.caption,
    fontWeight: Typography.weight.semibold,
  },
  loadingContainer: {
    padding: Spacing.md,
    alignItems: 'center',
  },
  loadingMore: {
    padding: Spacing.sm,
    alignItems: 'center',
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    marginHorizontal: Spacing.sm,
  },
  emptyText: {
    marginTop: Spacing.xs,
  },
});
