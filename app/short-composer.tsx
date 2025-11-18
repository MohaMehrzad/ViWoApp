import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Image,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { GlassCard } from '@/components/GlassCard';
import { GlassButton } from '@/components/GlassButton';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, Typography } from '@/constants/theme';
import { useCreateShort } from '@/hooks/useShorts';
import { useVideoPicker, useVideoUpload } from '@/hooks/useUpload';
import { LucideIcons } from '@/utils/iconMapping';

export default function ShortComposerScreen() {
  const [title, setTitle] = useState('');
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  const router = useRouter();
  const { colors } = useTheme();
  const createShortMutation = useCreateShort();
  const { pickVideo } = useVideoPicker();
  const videoUploadMutation = useVideoUpload();

  const handlePickVideo = async () => {
    try {
      const video = await pickVideo();
      if (video) {
        setSelectedVideo(video.uri);
      }
    } catch (error) {
      console.error('Failed to pick video:', error);
      Alert.alert('Error', 'Failed to pick video');
    }
  };

  const handlePost = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please add a title');
      return;
    }

    if (!selectedVideo) {
      Alert.alert('Error', 'Please select a video');
      return;
    }

    try {
      // Upload video
      const uploadResult = await videoUploadMutation.mutateAsync({
        uri: selectedVideo,
        name: `short_${Date.now()}.mp4`,
        type: 'video/mp4',
      });

      // Create short
      await createShortMutation.mutateAsync({
        title: title.trim(),
        videoUrl: uploadResult.url,
      });

      Alert.alert('Success', 'Short created successfully!', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      console.error('Failed to create short:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to create short');
    }
  };

  const isPosting = createShortMutation.isPending || videoUploadMutation.isPending;

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <GlassCard padding="lg" style={styles.formCard}>
          <Text
            style={[
              styles.title,
              {
                color: colors.textPrimary,
                fontSize: Typography.size.h3,
                fontWeight: Typography.weight.bold,
              },
            ]}
          >
            Create Short
          </Text>

          {/* Video Picker */}
          {!selectedVideo ? (
            <Pressable
              onPress={handlePickVideo}
              style={[
                styles.videoPicker,
                { backgroundColor: colors.glassFill, borderColor: colors.glassBorder },
              ]}
              disabled={isPosting}
            >
              <LucideIcons.video size={48} color={colors.accent} strokeWidth={2} />
              <Text
                style={[
                  styles.pickerText,
                  { color: colors.textPrimary, fontSize: Typography.size.body1 },
                ]}
              >
                Select Video
              </Text>
            </Pressable>
          ) : (
            <View style={styles.videoPreview}>
              <View
                style={[
                  styles.videoPlaceholder,
                  { backgroundColor: colors.glassFill },
                ]}
              >
                <LucideIcons.checkmarkCircle size={48} color={colors.success} strokeWidth={2} />
                <Text
                  style={[
                    styles.videoSelectedText,
                    { color: colors.textPrimary, fontSize: Typography.size.body2 },
                  ]}
                >
                  Video Selected
                </Text>
              </View>
              <Pressable
                onPress={() => setSelectedVideo(null)}
                style={[
                  styles.removeButton,
                  { backgroundColor: colors.background + 'E6' },
                ]}
                disabled={isPosting}
              >
                <LucideIcons.close size={20} color={colors.textPrimary} strokeWidth={2} />
              </Pressable>
            </View>
          )}

          {/* Title Input */}
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.glassFill,
                color: colors.textPrimary,
                borderColor: colors.glassBorder,
              },
            ]}
            placeholder="Add a catchy title..."
            placeholderTextColor={colors.placeholder}
            value={title}
            onChangeText={setTitle}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            maxLength={200}
            editable={!isPosting}
          />

          <Text
            style={[
              styles.charCount,
              { color: colors.textSecondary, fontSize: Typography.size.caption },
            ]}
          >
            {title.length} / 200
          </Text>

          {/* Info */}
          <View style={[styles.infoBox, { backgroundColor: colors.accent + '10' }]}>
            <LucideIcons.info size={20} color={colors.accent} strokeWidth={2} />
            <Text
              style={[
                styles.infoText,
                { color: colors.textSecondary, fontSize: Typography.size.caption },
              ]}
            >
              Shorts are vertical videos (9:16 aspect ratio recommended). Max duration: 60
              seconds.
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <GlassButton
              onPress={() => router.back()}
              variant="secondary"
              style={styles.actionButton}
              disabled={isPosting}
            >
              Cancel
            </GlassButton>
            <GlassButton
              onPress={handlePost}
              variant="primary"
              style={styles.actionButton}
              loading={isPosting}
              disabled={!title.trim() || !selectedVideo || isPosting}
            >
              Post
            </GlassButton>
          </View>
        </GlassCard>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
    flexGrow: 1,
    justifyContent: 'center',
  },
  formCard: {},
  title: {
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  videoPicker: {
    height: 200,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  pickerText: {},
  videoPreview: {
    position: 'relative',
    height: 200,
    marginBottom: Spacing.md,
    borderRadius: 12,
    overflow: 'hidden',
  },
  videoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  videoSelectedText: {},
  removeButton: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    minHeight: 80,
    borderRadius: 12,
    borderWidth: 1,
    padding: Spacing.md,
    fontSize: Typography.size.body1,
    marginBottom: Spacing.xs,
  },
  charCount: {
    textAlign: 'right',
    marginBottom: Spacing.md,
  },
  infoBox: {
    flexDirection: 'row',
    padding: Spacing.sm,
    borderRadius: 8,
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  infoText: {
    flex: 1,
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
});

