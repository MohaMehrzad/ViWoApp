import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { GlassCard } from '@/components/GlassCard';
import { LoadingSpinner } from '@/components/LoadingState';
import { ErrorView } from '@/components/ErrorView';
import { useThreadMessages } from '@/hooks/useMessages';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, Typography } from '@/constants/theme';
import { socketService } from '@/services/websocket/socket';
import { LucideIcons } from '@/utils/iconMapping';
import { Message } from '@/services/api/messages';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.messageBubble,
        isOwn ? styles.ownMessage : styles.otherMessage,
      ]}
    >
      <View
        style={[
          styles.bubbleContent,
          {
            backgroundColor: isOwn ? colors.accent : colors.glassFill,
          },
        ]}
      >
        <Text
          style={[
            styles.messageText,
            {
              color: isOwn ? colors.background : colors.textPrimary,
              fontSize: Typography.size.body2,
            },
          ]}
        >
          {message.content}
        </Text>
      </View>
      <Text
        style={[
          styles.messageTime,
          {
            color: colors.textSecondary,
            fontSize: Typography.size.caption,
          },
        ]}
      >
        {new Date(message.createdAt).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </Text>
    </View>
  );
}

export default function ChatScreen() {
  const { threadId } = useLocalSearchParams<{ threadId: string }>();
  const { colors } = useTheme();
  const { user: currentUser } = useAuth();
  const flatListRef = useRef<FlatList>(null);

  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const { data: initialMessages, isLoading, isError, refetch } = useThreadMessages(threadId);

  useEffect(() => {
    if (initialMessages) {
      setMessages(initialMessages);
    }
  }, [initialMessages]);

  useEffect(() => {
    if (!threadId) return;

    // Join thread
    socketService.joinThread(threadId);

    // Listen for new messages
    const handleNewMessage = (data: any) => {
      if (data.threadId === threadId) {
        setMessages((prev) => [...prev, data.message]);
        // Scroll to bottom
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    };

    // Listen for typing
    const handleTyping = (data: any) => {
      if (data.threadId === threadId && data.userId !== currentUser?.id) {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 3000);
      }
    };

    socketService.onNewMessage(handleNewMessage);
    socketService.onUserTyping(handleTyping);

    // Cleanup
    return () => {
      socketService.leaveThread(threadId);
      socketService.off('new_message', handleNewMessage);
      socketService.off('user_typing', handleTyping);
    };
  }, [threadId, currentUser?.id]);

  const handleSendMessage = () => {
    if (!messageText.trim()) return;

    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      threadId: threadId,
      senderId: currentUser?.id || '',
      content: messageText.trim(),
      createdAt: new Date().toISOString(),
    };

    // Optimistic update
    setMessages((prev) => [...prev, tempMessage]);
    setMessageText('');

    // Send via WebSocket
    socketService.sendMessage(threadId, messageText.trim());

    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    // Stop typing indicator
    socketService.stopTyping(threadId);
  };

  const handleTyping = () => {
    socketService.startTyping(threadId);
  };

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
          onRetry={() => refetch()}
          message="Failed to load messages."
        />
      </View>
    );
  }

  const renderMessage = ({ item }: { item: Message }) => (
    <MessageBubble message={item} isOwn={item.senderId === currentUser?.id} />
  );

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        ListEmptyComponent={
          <View style={styles.emptyState}>
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
              No messages yet. Start the conversation!
            </Text>
          </View>
        }
      />

      {/* Typing Indicator */}
      {isTyping && (
        <View style={styles.typingContainer}>
          <Text
            style={[
              styles.typingText,
              {
                color: colors.textSecondary,
                fontSize: Typography.size.caption,
              },
            ]}
          >
            Typing...
          </Text>
        </View>
      )}

      {/* Input Area */}
      <View style={[styles.inputContainer, { backgroundColor: colors.background }]}>
        <View
          style={[
            styles.inputWrapper,
            {
              backgroundColor: colors.glassFill,
              borderColor: colors.glassBorder,
            },
          ]}
        >
          <TextInput
            style={[
              styles.input,
              {
                color: colors.textPrimary,
                fontSize: Typography.size.body2,
              },
            ]}
            placeholder="Type a message..."
            placeholderTextColor={colors.placeholder}
            value={messageText}
            onChangeText={(text) => {
              setMessageText(text);
              if (text.length === 1) {
                handleTyping();
              }
            }}
            multiline
            maxLength={1000}
          />
          <Pressable
            onPress={handleSendMessage}
            disabled={!messageText.trim()}
            style={[
              styles.sendButton,
              { backgroundColor: messageText.trim() ? colors.accent : 'transparent' },
            ]}
          >
            <LucideIcons.send
              size={20}
              color={messageText.trim() ? colors.background : colors.textSecondary}
              strokeWidth={2}
            />
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messagesList: {
    padding: Spacing.md,
  },
  messageBubble: {
    marginBottom: Spacing.sm,
    maxWidth: '80%',
  },
  ownMessage: {
    alignSelf: 'flex-end',
  },
  otherMessage: {
    alignSelf: 'flex-start',
  },
  bubbleContent: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 16,
  },
  messageText: {
    lineHeight: 20,
  },
  messageTime: {
    marginTop: 4,
    marginHorizontal: Spacing.sm,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  emptyText: {
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  typingContainer: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xs,
  },
  typingText: {
    fontStyle: 'italic',
  },
  inputContainer: {
    padding: Spacing.md,
    paddingTop: Spacing.sm,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.xs,
  },
});

