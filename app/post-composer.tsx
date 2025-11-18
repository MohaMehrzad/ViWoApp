import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Pressable,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { GlassCard } from '@/components/GlassCard';
import { GlassButton } from '@/components/GlassButton';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, Typography } from '@/constants/theme';
import { useCreatePost } from '@/hooks/usePostActions';
import { useImagePicker, useImageUpload } from '@/hooks/useUpload';
import { LucideIcons } from '@/utils/iconMapping';

export default function PostComposerScreen() {
  const [content, setContent] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<{
    uri: string;
    type: 'image' | 'video';
  } | null>(null);

  const router = useRouter();
  const { colors } = useTheme();
  const createPostMutation = useCreatePost();
  const { pickImage } = useImagePicker();
  const imageUploadMutation = useImageUpload();

  const handlePickImage = async () => {
    try {
      const image = await pickImage();
      if (image) {
        setSelectedMedia({
          uri: image.uri,
          type: 'image',
        });
      }
    } catch (error) {
      console.error('Failed to pick image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleRemoveMedia = () => {
    setSelectedMedia(null);
  };

  const handlePost = async () => {
    if (!content.trim() && !selectedMedia) {
      Alert.alert('Error', 'Please add some content or an image');
      return;
    }

    try {
      let mediaUrl: string | undefined;
      let mediaType: 'image' | 'video' | undefined;

      // Upload media if selected
      if (selectedMedia) {
        const uploadResult = await imageUploadMutation.mutateAsync({
          uri: selectedMedia.uri,
          name: `image_${Date.now()}.jpg`,
          type: 'image/jpeg',
        });
        mediaUrl = uploadResult.url;
        mediaType = uploadResult.type;
      }

      // Create post
      await createPostMutation.mutateAsync({
        content: content.trim(),
        mediaUrl,
        mediaType,
      });

      Alert.alert('Success', 'Post created successfully!', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      console.error('Failed to create post:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to create post');
    }
  };

  const isPosting = createPostMutation.isPending || imageUploadMutation.isPending;

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
            Create Post
          </Text>

          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.glassFill,
                color: colors.textPrimary,
                borderColor: colors.glassBorder,
              },
            ]}
            placeholder="What's on your mind?"
            placeholderTextColor={colors.placeholder}
            value={content}
            onChangeText={setContent}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            maxLength={1000}
            editable={!isPosting}
          />

          <Text
            style={[
              styles.charCount,
              {
                color: content.length >= 980 
                  ? colors.danger 
                  : content.length >= 900 
                    ? colors.warning 
                    : colors.textSecondary,
                fontSize: Typography.size.caption,
              },
            ]}
          >
            {content.length} / 1000
          </Text>

          {/* Media Preview */}
          {selectedMedia && (
            <View style={styles.mediaPreview}>
              <Image
                source={{ uri: selectedMedia.uri }}
                style={styles.previewImage}
                resizeMode="cover"
              />
              <Pressable
                onPress={handleRemoveMedia}
                style={[
                  styles.removeButton,
                  { backgroundColor: colors.background + 'E6' },
                ]}
              >
                <LucideIcons.close size={20} color={colors.textPrimary} strokeWidth={2} />
              </Pressable>
            </View>
          )}

          {/* Media Actions */}
          {!selectedMedia && (
            <View style={styles.mediaActions}>
              <Pressable
                onPress={handlePickImage}
                style={[
                  styles.mediaButton,
                  { backgroundColor: colors.glassFill },
                ]}
                disabled={isPosting}
              >
                <LucideIcons.image size={24} color={colors.accent} strokeWidth={2} />
                <Text
                  style={[
                    styles.mediaButtonText,
                    {
                      color: colors.textPrimary,
                      fontSize: Typography.size.body2,
                    },
                  ]}
                >
                  Add Image
                </Text>
              </Pressable>
            </View>
          )}

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
              disabled={(!content.trim() && !selectedMedia) || isPosting}
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
  input: {
    minHeight: 150,
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
  mediaPreview: {
    position: 'relative',
    marginBottom: Spacing.md,
    borderRadius: 12,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
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
  mediaActions: {
    marginBottom: Spacing.md,
  },
  mediaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    borderRadius: 12,
    gap: Spacing.sm,
  },
  mediaButtonText: {},
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
});

