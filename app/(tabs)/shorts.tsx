import { ShortsPlayer } from '@/components/ShortsPlayer';
import { LoadingSpinner } from '@/components/LoadingState';
import { ErrorView, EmptyState } from '@/components/ErrorView';
import { useTheme } from '@/hooks/useTheme';
import { useShorts } from '@/hooks/useShorts';
import { useScreenLayout } from '@/hooks/useScreenLayout';
import { Spacing } from '@/constants/theme';
import React, { useState, useMemo } from 'react';
import { FlatList, StyleSheet, View, Text, useWindowDimensions } from 'react-native';

export default function ShortsScreen() {
  const { colors } = useTheme();
  const { height: SCREEN_HEIGHT } = useWindowDimensions();
  const { headerHeight, contentPaddingBottom } = useScreenLayout();
  const [currentIndex, setCurrentIndex] = useState(0);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch,
  } = useShorts();

  // Flatten pages into a single array of shorts and filter out any undefined/null items
  const shorts = useMemo(() => {
    return data?.pages.flatMap((page) => page.shorts).filter(Boolean) ?? [];
  }, [data]);

  const handleRetry = () => {
    refetch();
  };

  const renderShort = ({ item, index }: { item: typeof shorts[0]; index: number }) => {
    if (!item || !item.user) {
      return null;
    }
    
    return (
      <ShortsPlayer
        id={item.id}
        videoUri={item.videoUrl}
        thumbnailUri={item.thumbnailUrl}
        author={{
          name: item.user.displayName,
          avatar: '', // Using Lucide icon instead
        }}
        title={item.title}
        initialLikes={item.likesCount}
        initialComments={item.commentsCount}
        isVisible={index === currentIndex}
      />
    );
  };

  const onViewableItemsChanged = ({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0);
    }
  };

  const getItemLayout = (_: any, index: number) => ({
    length: SCREEN_HEIGHT,
    offset: SCREEN_HEIGHT * index,
    index,
  });

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <LoadingSpinner />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ErrorView
          variant="network"
          onRetry={handleRetry}
          message="Unable to load shorts. Please try again."
        />
      </View>
    );
  }

  if (shorts.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <EmptyState
          icon="play-circle-outline"
          title="No Shorts Yet"
          message="No shorts available yet. Check back later!"
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        style={{ backgroundColor: colors.background }}
        contentContainerStyle={{
          paddingTop: headerHeight,
          paddingBottom: contentPaddingBottom,
        }}
        data={shorts}
        renderItem={renderShort}
        keyExtractor={(item, index) => item?.id ? `${item.id}-${index}` : `short-${index}`}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        decelerationRate="fast"
        getItemLayout={getItemLayout}
        // Performance optimizations
        removeClippedSubviews={true}
        maxToRenderPerBatch={3}
        initialNumToRender={2}
        windowSize={3}
        updateCellsBatchingPeriod={50}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{
          itemVisiblePercentThreshold: 50,
        }}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

