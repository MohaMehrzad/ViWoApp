import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { GlassCard } from './GlassCard';
import { GlassButton } from './GlassButton';
import { LoadingSpinner } from './LoadingState';
import { useComments, useCreateComment } from '@/hooks/useComments';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/hooks/useTheme';
import { useAutoUpdateTime } from '@/hooks/useAutoUpdateTime';
import { Spacing, Typography } from '@/constants/theme';
import { LucideIcons } from '@/utils/iconMapping';
import { Comment } from '@/types/comment';

interface CommentSheetProps {
  postId: string;
  isVisible: boolean;
  onClose: () => void;
}

interface CommentItemProps {
  comment: Comment;
}

function CommentItem({ comment }: CommentItemProps) {
  const { colors } = useTheme();
  const relativeTime = useAutoUpdateTime(new Date(comment.createdAt).getTime());

  return (
    <View style={styles.commentItem}>
      <View
        style={[
          styles.commentAvatar,
          { backgroundColor: colors.accent + '20' },
        ]}
      >
        <LucideIcons.user size={18} color={colors.accent} strokeWidth={2} />
      </View>
      <View style={styles.commentContent}>
        <View style={styles.commentHeader}>
          <Text
            style={[
              styles.commentAuthor,
              {
                color: colors.textPrimary,
                fontSize: Typography.size.body2,
                fontWeight: Typography.weight.semibold,
              },
            ]}
          >
            {comment.user.displayName}
          </Text>
          <Text
            style={[
              styles.commentTime,
              {
                color: colors.textSecondary,
                fontSize: Typography.size.caption,
              },
            ]}
          >
            {relativeTime}
          </Text>
        </View>
        <Text
          style={[
            styles.commentText,
            {
              color: colors.textPrimary,
              fontSize: Typography.size.body2,
            },
          ]}
        >
          {comment.content}
        </Text>
      </View>
    </View>
  );
}

export function CommentSheet({ postId, isVisible, onClose }: CommentSheetProps) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [commentText, setCommentText] = useState('');

  const { data: comments, isLoading } = useComments(postId);
  const createCommentMutation = useCreateComment(postId);

  const handleSubmitComment = async () => {
    if (!commentText.trim() || createCommentMutation.isPending) return;

    try {
      await createCommentMutation.mutateAsync({ content: commentText.trim() });
      setCommentText('');
    } catch (error) {
      console.error('Failed to create comment:', error);
    }
  };

  const renderComment = ({ item }: { item: Comment }) => (
    <CommentItem comment={item} />
  );

  if (!isVisible) return null;

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={0}
      snapPoints={['75%']}
      enablePanDownToClose
      onClose={onClose}
      backgroundStyle={{ backgroundColor: colors.background }}
      handleIndicatorStyle={{ backgroundColor: colors.textSecondary }}
    >
      <BottomSheetView style={styles.container}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.glassBorder }]}>
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
            Comments
          </Text>
          <Pressable onPress={onClose} hitSlop={12}>
            <LucideIcons.close size={24} color={colors.textSecondary} strokeWidth={2} />
          </Pressable>
        </View>

        {/* Comments List */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <LoadingSpinner />
          </View>
        ) : comments && comments.length > 0 ? (
          <FlatList
            data={comments}
            renderItem={renderComment}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.commentsList}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <LucideIcons.comment size={48} color={colors.textSecondary} strokeWidth={2} />
            <Text
              style={[
                styles.emptyText,
                {
                  color: colors.textSecondary,
                  fontSize: Typography.size.body2,
                },
              ]}
            >
              No comments yet. Be the first to comment!
            </Text>
          </View>
        )}

        {/* Input Area */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={100}
        >
          <View style={[styles.inputContainer, { borderTopColor: colors.glassBorder }]}>
            <View
              style={[
                styles.userAvatar,
                { backgroundColor: colors.accent + '20' },
              ]}
            >
              <LucideIcons.user size={16} color={colors.accent} strokeWidth={2} />
            </View>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.glassFill,
                  color: colors.textPrimary,
                  borderColor: colors.glassBorder,
                },
              ]}
              placeholder="Add a comment..."
              placeholderTextColor={colors.textSecondary + '80'}
              value={commentText}
              onChangeText={setCommentText}
              multiline
              maxLength={500}
            />
            <Pressable
              onPress={handleSubmitComment}
              disabled={!commentText.trim() || createCommentMutation.isPending}
              style={[
                styles.sendButton,
                (!commentText.trim() || createCommentMutation.isPending) && styles.sendButtonDisabled,
              ]}
            >
              <LucideIcons.send
                size={20}
                color={commentText.trim() && !createCommentMutation.isPending ? colors.accent : colors.textSecondary}
                strokeWidth={2}
              />
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </BottomSheetView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  title: {},
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  emptyText: {
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  commentsList: {
    padding: Spacing.md,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  commentAvatarText: {
    fontSize: 16,
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  commentAuthor: {
    marginRight: Spacing.xs,
  },
  commentTime: {},
  commentText: {
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: Spacing.md,
    borderTopWidth: 1,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  userAvatarText: {
    fontSize: 14,
  },
  input: {
    flex: 1,
    minHeight: 36,
    maxHeight: 100,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    marginRight: Spacing.sm,
    fontSize: Typography.size.body2,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});

