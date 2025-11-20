import { PostCard } from '@/components/PostCard';
import { LoadingPosts } from '@/components/LoadingState';
import { ErrorView, EmptyState } from '@/components/ErrorView';
import { Layout, Motion, Spacing } from '@/constants/theme';
import { useScreenLayout } from '@/hooks/useScreenLayout';
import { useTheme } from '@/hooks/useTheme';
import { usePosts } from '@/hooks/usePosts';
import { getRTLPosition } from '@/utils/rtl';
import { HapticFeedback } from '@/utils/haptics';
import { LucideIcons } from '@/utils/iconMapping';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useMemo, useRef, useEffect } from 'react';
import { Animated, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { BlurView } from '@react-native-community/blur';

export default function FeedScreen() {
  const { colors, isDark, blurType } = useTheme();
  const { headerHeight, contentPaddingBottom } = useScreenLayout();
  const router = useRouter();
  
  // FAB animations
  const fabScale = useRef(new Animated.Value(0)).current;
  const fabRotation = useRef(new Animated.Value(0)).current;
  const scrollY = useRef(0);
  const [showFAB, setShowFAB] = React.useState(true);
  
  // Fetch posts using React Query
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = usePosts();

  // Flatten pages into a single array of posts and filter out any undefined/null items
  const posts = useMemo(() => {
    return data?.pages.flatMap((page) => page.posts).filter(Boolean) ?? [];
  }, [data]);

  // Memoize gradient colors for performance
  const gradientColors = useMemo(
    () =>
      isDark
        ? [colors.accent + '25', colors.background, colors.background]
        : [colors.accent + '15', colors.background, colors.background],
    [isDark, colors.accent, colors.background]
  );
  
  // FAB entrance animation
  useEffect(() => {
    Animated.spring(fabScale, {
      toValue: 1,
      delay: 400,
      ...Motion.spring.bouncy,
      useNativeDriver: true,
    }).start();
  }, [fabScale]);

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const renderPost = ({ item }: { item: typeof posts[0] }) => {
    if (!item || !item.user) {
      return null;
    }
    
    return (
      <PostCard
        id={item.id}
        author={{
          name: item.user.displayName,
          avatar: '', // Using Lucide icon instead
        }}
        content={item.content}
        media={
          item.mediaUrl
            ? {
                type: item.mediaType || 'image',
                uri: item.mediaUrl,
                aspectRatio: item.aspectRatio,
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

  const handleCreatePost = () => {
    HapticFeedback.medium();
    // Press animation
    Animated.sequence([
      Animated.spring(fabScale, {
        toValue: 0.85,
        ...Motion.spring.snappy,
        useNativeDriver: true,
      }),
      Animated.spring(fabScale, {
        toValue: 1,
        ...Motion.spring.bouncy,
        useNativeDriver: true,
      }),
    ]).start();
    
    router.push('/post-composer');
  };

  const handleRetry = () => {
    refetch();
  };
  
  const handleScroll = (event: any) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    const delta = currentScrollY - scrollY.current;
    
    // Hide FAB when scrolling down, show when scrolling up
    if (delta > Motion.gesture.scroll.threshold && showFAB) {
      setShowFAB(false);
      Animated.parallel([
        Animated.spring(fabScale, {
          toValue: 0,
          ...Motion.spring.gentle,
          useNativeDriver: true,
        }),
        Animated.timing(fabRotation, {
          toValue: 1,
          duration: Motion.duration.default,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (delta < -Motion.gesture.scroll.threshold && !showFAB) {
      setShowFAB(true);
      Animated.parallel([
        Animated.spring(fabScale, {
          toValue: 1,
          ...Motion.spring.bouncy,
          useNativeDriver: true,
        }),
        Animated.timing(fabRotation, {
          toValue: 0,
          duration: Motion.duration.default,
          useNativeDriver: true,
        }),
      ]).start();
    }
    
    scrollY.current = currentScrollY;
  };

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={gradientColors}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 0.3 }}
        />
        <View style={[styles.loadingContainer, { paddingTop: headerHeight }]}>
          <LoadingPosts count={3} />
        </View>
      </View>
    );
  }

  // Error state
  if (isError) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={gradientColors}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 0.3 }}
        />
        <ErrorView
          variant="network"
          onRetry={handleRetry}
          message="Unable to load posts. Please check your connection and try again."
        />
      </View>
    );
  }

  // Empty state
  if (posts.length === 0) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={gradientColors}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 0.3 }}
        />
        <EmptyState
          icon="newspaper-outline"
          title="No Posts Yet"
          message="Be the first to share something with the community!"
          actionLabel="Create Post"
          onAction={handleCreatePost}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Gradient background that extends behind header */}
      <LinearGradient
        colors={gradientColors}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.3 }}
      />
      
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item, index) => item?.id ? `${item.id}-${index}` : `post-${index}`}
        contentContainerStyle={[
          styles.list,
          {
            paddingTop: headerHeight,
            paddingBottom: contentPaddingBottom,
          },
        ]}
        showsVerticalScrollIndicator={false}
        style={{ backgroundColor: 'transparent' }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        // Performance optimizations
        removeClippedSubviews={true}
        maxToRenderPerBatch={5}
        initialNumToRender={5}
        windowSize={5}
        updateCellsBatchingPeriod={50}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => refetch()}
            tintColor={colors.accent}
            colors={[colors.accent]}
            progressBackgroundColor={colors.background}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetchingNextPage ? (
            <View style={styles.loadingMore}>
              <Text style={{ color: colors.textSecondary }}>Loading more...</Text>
            </View>
          ) : null
        }
      />

      {/* Floating Create Button */}
      <Animated.View
        style={[
          styles.fabContainer,
          {
            bottom: contentPaddingBottom + Layout.fab.bottomOffset,
            transform: [
              { scale: fabScale },
              {
                rotate: fabRotation.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '45deg'],
                }),
              },
            ],
          },
        ]}
      >
        <Pressable
          onPress={handleCreatePost}
          style={[
            styles.fab,
            {
              shadowColor: '#000',
              overflow: 'hidden',
            },
          ]}
          accessibilityLabel="Create new post"
          accessibilityRole="button"
          accessibilityHint="Opens the post composer"
        >
          {/* Blur layer */}
          <BlurView
            blurType={blurType}
            blurAmount={20}
            reducedTransparencyFallbackColor={colors.create}
            style={StyleSheet.absoluteFill}
          />
          {/* Color overlay with transparency */}
          <View
            style={[
              StyleSheet.absoluteFill,
              {
                backgroundColor: colors.create,
                opacity: 0.7,
              },
            ]}
          />
          {/* Icon on top */}
          <LucideIcons.add size={Layout.fab.iconSize} color={colors.createContrast} strokeWidth={2.5} style={{ zIndex: 1 }} />
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
  },
  list: {
    padding: Spacing.md,
    // paddingTop and paddingBottom set dynamically via contentContainerStyle
  },
  loadingMore: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  fabContainer: {
    position: 'absolute',
    ...getRTLPosition(undefined, Layout.fab.rightOffset),
  },
  fab: {
    width: Layout.fab.size,
    height: Layout.fab.size,
    borderRadius: Layout.fab.size / 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 10,
  },
});
