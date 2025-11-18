import { LiquidGlass, Radius, Spacing, Typography, Layout } from '@/constants/theme';
import { useVCoin } from '@/contexts/VCoinContext';
import { useTheme } from '@/hooks/useTheme';
import { useScreenLayout } from '@/hooks/useScreenLayout';
import { formatNumber } from '@/utils/formatters';
import { getRTLPosition } from '@/utils/rtl';
import { LucideIcons } from '@/utils/iconMapping';
import { HapticFeedback } from '@/utils/haptics';
import { VideoView, useVideoPlayer } from 'expo-video';
import React, { useState, useRef, useEffect } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions, ActivityIndicator, ImageBackground } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { VCoinGainChip } from './VCoinGainChip';

interface ShortsPlayerProps {
  id: string;
  videoUri: string;
  thumbnailUri?: string;
  author: {
    name: string;
    avatar: string;
  };
  title: string;
  initialLikes?: number;
  initialComments?: number;
  isVisible?: boolean; // For auto-play control
}

const SOUND_STORAGE_KEY = '@viwo:sound_enabled';

export function ShortsPlayer({
  id,
  videoUri,
  thumbnailUri,
  author,
  title,
  initialLikes = 0,
  initialComments = 0,
  isVisible = true,
}: ShortsPlayerProps) {
  const { colors, glassFill } = useTheme();
  const { earnVCoin } = useVCoin();
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { contentPaddingBottom } = useScreenLayout();

  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(initialLikes);
  const [comments] = useState(initialComments);
  const [soundOn, setSoundOn] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const [showVCoinChip, setShowVCoinChip] = useState(false);
  const [vcoinEarned, setVcoinEarned] = useState(0);

  // Initialize video player only if we have a valid video URL
  const player = videoUri ? useVideoPlayer(videoUri, (player) => {
    player.loop = true;
    player.muted = !soundOn;
  }) : null;

  // Load sound preference from storage
  useEffect(() => {
    loadSoundPreference();
  }, []);

  // Update player muted state when soundOn changes
  useEffect(() => {
    if (player) {
      player.muted = !soundOn;
    }
  }, [soundOn, player]);

  // Auto-play when visible
  useEffect(() => {
    if (!player) return;
    
    if (isVisible) {
      player.play();
      setIsPlaying(true);
    } else {
      player.pause();
      setIsPlaying(false);
    }
  }, [isVisible, player]);

  // Listen to player status updates and errors with safe retry logic
  useEffect(() => {
    if (!player) return;

    let retryCount = 0;
    const maxRetries = 2;
    let retryTimer: NodeJS.Timeout | null = null;
    let hasSucceeded = false;
    let lastErrorTime = 0;

    // Add error listener with safe retry logic
    const errorListener = player.addListener('statusChange', (status) => {
      if (status.status === 'error' && !hasSucceeded) {
        const now = Date.now();
        // Prevent duplicate error logging within 500ms
        if (now - lastErrorTime < 500) {
          return;
        }
        lastErrorTime = now;

        const errorMessage = status.error?.message || 'Unknown error';
        const isAccessDenied = errorMessage.includes('403') || errorMessage.includes('Access Denied');
        const isNetworkError = errorMessage.includes('SocketTimeoutException') || errorMessage.includes('failed to connect');

        // Only log once per retry attempt
        if (retryCount === 0) {
          console.error('Video playback error:', {
            error: errorMessage,
            type: isAccessDenied ? 'Access Denied' : isNetworkError ? 'Network Timeout' : 'Unknown',
            videoUri,
          });
        }

        // Attempt retry for network errors only (not access denied)
        if (retryCount < maxRetries && (isNetworkError || !isAccessDenied)) {
          retryCount++;
          console.log(`Retrying video load... Attempt ${retryCount}/${maxRetries}`);
          
          // Clear any existing retry timer
          if (retryTimer) {
            clearTimeout(retryTimer);
          }
          
          // Schedule retry with exponential backoff
          retryTimer = setTimeout(async () => {
            try {
              await player.replace(videoUri);
              player.play();
            } catch (err) {
              // Silent fail - error will be caught by statusChange listener
            }
          }, 1000 * retryCount); // Delays: 1000ms, 2000ms
        } else {
          setHasError(true);
          setIsLoading(false);
          if (isAccessDenied) {
            console.warn('Video access denied - skipping retries');
          }
        }
      }
    });

    const statusInterval = setInterval(() => {
      if (!player) return;
      
      setIsPlaying(player.playing);
      
      if (player.duration > 0) {
        setDuration(player.duration * 1000); // Convert to milliseconds
        setProgress(player.currentTime / player.duration);
        setIsLoading(false);
        hasSucceeded = true; // Mark as successful
        retryCount = 0; // Reset retry count on successful playback
      }
    }, 100);

    return () => {
      // Clean up all timers on unmount
      clearInterval(statusInterval);
      if (retryTimer) {
        clearTimeout(retryTimer);
      }
      errorListener.remove();
    };
  }, [player, videoUri]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadSoundPreference = async () => {
    try {
      const saved = await AsyncStorage.getItem(SOUND_STORAGE_KEY);
      if (saved !== null) {
        setSoundOn(saved === 'true');
      }
    } catch (error) {
      // Error handling will be implemented with proper error tracking
    }
  };

  const saveSoundPreference = async (enabled: boolean) => {
    try {
      await AsyncStorage.setItem(SOUND_STORAGE_KEY, enabled.toString());
    } catch (error) {
      // Error handling will be implemented with proper error tracking
    }
  };

  const handleLike = async () => {
    HapticFeedback.light();
    
    if (!liked) {
      setLiked(true);
      setLikes(likes + 1);
      
      const amount = await earnVCoin('like', id);
      setVcoinEarned(amount);
      setShowVCoinChip(true);
    } else {
      setLiked(false);
      setLikes(likes - 1);
    }
  };

  const handleComment = () => {
    HapticFeedback.light();
    // Comment functionality will be implemented when backend is ready
  };

  const handleShare = async () => {
    HapticFeedback.medium();
    const amount = await earnVCoin('share', id);
    setVcoinEarned(amount);
    setShowVCoinChip(true);
  };

  const toggleSound = async () => {
    HapticFeedback.light();
    const newValue = !soundOn;
    setSoundOn(newValue);
    await saveSoundPreference(newValue);
    
    if (player) {
      player.muted = !newValue;
    }
  };

  const handleVideoPress = () => {
    if (!player) return;
    
    if (isPlaying) {
      player.pause();
    } else {
      player.play();
    }
  };

  return (
    <View style={styles.container}>
      {/* Video Player */}
      {!hasError && videoUri && player ? (
        <Pressable 
          style={styles.videoContainer} 
          onPress={handleVideoPress}
          accessibilityLabel={isPlaying ? 'Pause video' : 'Play video'}
          accessibilityRole="button"
        >
          {/* Thumbnail/Poster (shown while loading or as poster) */}
          {thumbnailUri && isLoading && (
            <ImageBackground
              source={{ uri: thumbnailUri }}
              style={[styles.video, { width: SCREEN_WIDTH, height: SCREEN_HEIGHT }]}
              resizeMode="cover"
            >
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color={colors.accent} />
                <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                  Loading video...
                </Text>
              </View>
            </ImageBackground>
          )}
          
          {/* Video View */}
          <VideoView
            player={player}
            style={[styles.video, { width: SCREEN_WIDTH, height: SCREEN_HEIGHT }]}
            contentFit="cover"
            nativeControls={false}
          />
          
          {/* Loading overlay without thumbnail */}
          {isLoading && !thumbnailUri && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={colors.accent} />
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                Loading video...
              </Text>
            </View>
          )}

          {/* Video Progress Bar */}
          {!isLoading && duration > 0 && (
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBarBackground, { backgroundColor: colors.glassFill }]}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${progress * 100}%`,
                      backgroundColor: colors.accent,
                    },
                  ]}
                />
              </View>
            </View>
          )}
        </Pressable>
      ) : (
        <ImageBackground
          source={{ uri: thumbnailUri || 'https://picsum.photos/400/600' }}
          style={[styles.videoPlaceholder, { width: SCREEN_WIDTH, height: SCREEN_HEIGHT }]}
          resizeMode="cover"
        >
          <View style={[styles.placeholderOverlay, { backgroundColor: 'rgba(0, 0, 0, 0.7)' }]}>
            <LucideIcons.play
              size={100}
              color={colors.accent}
              strokeWidth={2.5}
              fill={colors.accent}
              style={{ opacity: 0.95 }}
            />
            <Text
              style={[
                styles.placeholderText,
                {
                  color: colors.textPrimary,
                  fontSize: Typography.size.h2,
                  fontWeight: Typography.weight.bold,
                  marginTop: Spacing.xl,
                },
              ]}
            >
              {hasError ? '❌ Video Unavailable' : '📹 Preview Mode'}
            </Text>
            <Text
              style={[
                styles.errorDetails,
                {
                  color: colors.textSecondary,
                  fontSize: Typography.size.body,
                  marginTop: Spacing.md,
                  textAlign: 'center',
                  paddingHorizontal: Spacing.xl * 2,
                  lineHeight: Typography.lineHeight.body * 1.4,
                },
              ]}
            >
              {hasError 
                ? 'External video URLs are blocked. Upload your own videos to enable playback.' 
                : 'This is a placeholder. Use the upload feature to add real videos.'}
            </Text>
          </View>
        </ImageBackground>
      )}

      {/* Sound Toggle */}
      <Pressable
        onPress={toggleSound}
        style={[styles.soundToggle, { top: insets.top + Spacing.sm }]}
        accessibilityLabel={soundOn ? 'Mute' : 'Unmute'}
        accessibilityRole="button"
        accessibilityState={{ selected: soundOn }}
      >
        <View
          style={[
            styles.controlButton, 
            { 
              borderRadius: 20,
              backgroundColor: glassFill(LiquidGlass.fillIntensity.strong),
              borderWidth: 1,
              borderColor: colors.glassFill,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 4,
              elevation: 4,
            }
          ]}
        >
          {soundOn ? (
            <LucideIcons.volumeHigh
              size={Layout.icon.md}
              color={colors.textPrimary}
              strokeWidth={2}
            />
          ) : (
            <LucideIcons.volumeMute
              size={Layout.icon.md}
              color={colors.textPrimary}
              strokeWidth={2}
            />
          )}
        </View>
      </Pressable>

      {/* Right Controls Overlay */}
      <View style={[styles.rightControls, { bottom: contentPaddingBottom + Spacing.md }]}>
        {/* Author Avatar */}
        <View
          style={[
            styles.authorAvatar,
            { backgroundColor: colors.accent + '20' },
          ]}
        >
          <LucideIcons.user 
            size={Layout.avatar.mediumLarge * 0.5} 
            color={colors.accent} 
            strokeWidth={2}
          />
        </View>

        {/* Like */}
        <View style={styles.controlItem}>
          <Pressable 
            onPress={handleLike} 
            hitSlop={Layout.hitSlop}
            accessibilityLabel={liked ? 'Unlike' : 'Like'}
            accessibilityRole="button"
            accessibilityState={{ selected: liked }}
            accessibilityHint={`${formatNumber(likes)} likes`}
          >
            <View
              style={[
                styles.controlButton,
                { 
                  backgroundColor: glassFill(LiquidGlass.fillIntensity.strong),
                  borderWidth: 1,
                  borderColor: colors.glassFill,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 4,
                  elevation: 4,
                }
              ]}
            >
              <LucideIcons.heart
                size={Layout.icon.md}
                color={liked ? colors.danger : colors.textPrimary}
                strokeWidth={2}
                fill={liked ? colors.danger : 'none'}
              />
            </View>
          </Pressable>
          <Text style={[styles.controlCount, { color: colors.textPrimary }]} selectable={false}>
            {formatNumber(likes)}
          </Text>
        </View>

        {/* Comment */}
        <View style={styles.controlItem}>
          <Pressable 
            onPress={handleComment} 
            hitSlop={Layout.hitSlop}
            accessibilityLabel="Comment"
            accessibilityRole="button"
            accessibilityHint={`${formatNumber(comments)} comments`}
          >
            <View
              style={[
                styles.controlButton,
                { 
                  backgroundColor: glassFill(LiquidGlass.fillIntensity.strong),
                  borderWidth: 1,
                  borderColor: colors.glassFill,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 4,
                  elevation: 4,
                }
              ]}
            >
              <LucideIcons.comment
                size={Layout.icon.md}
                color={colors.textPrimary}
                strokeWidth={2}
              />
            </View>
          </Pressable>
          <Text style={[styles.controlCount, { color: colors.textPrimary }]} selectable={false}>
            {formatNumber(comments)}
          </Text>
        </View>

        {/* Share */}
        <View style={styles.controlItem}>
          <Pressable 
            onPress={handleShare} 
            hitSlop={Layout.hitSlop}
            accessibilityLabel="Share"
            accessibilityRole="button"
          >
            <View
              style={[
                styles.controlButton,
                { 
                  backgroundColor: glassFill(LiquidGlass.fillIntensity.strong),
                  borderWidth: 1,
                  borderColor: colors.glassFill,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 4,
                  elevation: 4,
                }
              ]}
            >
              <LucideIcons.share
                size={Layout.icon.md}
                color={colors.textPrimary}
                strokeWidth={2}
              />
            </View>
          </Pressable>
        </View>

        {/* VCoin Earned Badge */}
        <View style={[styles.vcoinBadge, { backgroundColor: colors.success + '30' }]}>
          <LucideIcons.bitcoin size={16} color={colors.success} strokeWidth={2} />
        </View>
      </View>

      {/* Bottom Info */}
      <View style={[styles.bottomInfo, { bottom: contentPaddingBottom - Spacing.md }]}>
        <Text
          style={[
            styles.authorName,
            {
              color: colors.textPrimary,
              fontSize: Typography.size.body,
              fontWeight: Typography.weight.bold,
            },
          ]}
        >
          @{author.name}
        </Text>
        <Text
          style={[
            styles.title,
            {
              color: colors.textPrimary,
              fontSize: Typography.size.body2,
            },
          ]}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {title}
        </Text>
      </View>

      {/* VCoin Gain Chip */}
      {showVCoinChip && (
        <View style={[styles.vcoinChipContainer, { bottom: contentPaddingBottom + 80 }]}>
          <VCoinGainChip
            amount={vcoinEarned}
            onComplete={() => setShowVCoinChip(false)}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  videoContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  video: {
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    gap: Spacing.md,
  },
  loadingText: {
    fontSize: Typography.size.body2,
  },
  progressBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 5,
  },
  progressBarBackground: {
    flex: 1,
    opacity: 0.3,
  },
  progressBarFill: {
    height: '100%',
  },
  videoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    textAlign: 'center',
    paddingHorizontal: Spacing.xl,
  },
  errorDetails: {
    textAlign: 'center',
    paddingHorizontal: Spacing.xl,
  },
  retryButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryButtonText: {
    fontWeight: Typography.weight.bold,
  },
  soundToggle: {
    position: 'absolute',
    // top is set dynamically based on safe area insets
    ...getRTLPosition(undefined, 20),
  },
  rightControls: {
    position: 'absolute',
    ...getRTLPosition(undefined, 16),
    // bottom is set dynamically based on content padding
    alignItems: 'center',
    gap: 20,
  },
  authorAvatar: {
    width: Layout.avatar.mediumLarge,
    height: Layout.avatar.mediumLarge,
    borderRadius: Layout.avatar.mediumLarge / 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  avatarText: {
    fontSize: Layout.avatar.mediumLarge * 0.5, // 50% of container
  },
  controlItem: {
    alignItems: 'center',
    gap: 4,
  },
  controlButton: {
    width: 48,
    height: 48,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  controlCount: {
    fontSize: Typography.size.caption,
    fontWeight: Typography.weight.bold,
    ...LiquidGlass.textShadow,
  },
  vcoinBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  bottomInfo: {
    position: 'absolute',
    // bottom is set dynamically based on content padding
    ...getRTLPosition(16, 80),
  },
  authorName: {
    marginBottom: 4,
    ...LiquidGlass.textShadow,
  },
  title: {
    ...LiquidGlass.textShadow,
  },
  vcoinChipContainer: {
    position: 'absolute',
    // bottom is set dynamically based on content padding
    ...getRTLPosition(undefined, 80),
  },
});

