import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { GlassCard } from '@/components/GlassCard';
import { LoadingSpinner } from '@/components/LoadingState';
import { useUserSearch } from '@/hooks/useUser';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, Typography } from '@/constants/theme';
import { LucideIcons } from '@/utils/iconMapping';
import { User } from '@/types/user';

interface UserItemProps {
  user: User;
  onPress: () => void;
}

function UserItem({ user, onPress }: UserItemProps) {
  const { colors } = useTheme();

  return (
    <Pressable onPress={onPress}>
      <GlassCard padding="md" style={styles.userCard}>
      <View
        style={[
          styles.avatar,
          { backgroundColor: colors.accent + '20' },
        ]}
      >
        <LucideIcons.user size={20} color={colors.accent} strokeWidth={2} />
      </View>
        <View style={styles.userInfo}>
          <Text
            style={[
              styles.displayName,
              {
                color: colors.textPrimary,
                fontSize: Typography.size.body,
                fontWeight: Typography.weight.semibold,
              },
            ]}
          >
            {user.displayName}
          </Text>
          <Text
            style={[
              styles.username,
              {
                color: colors.textSecondary,
                fontSize: Typography.size.body2,
              },
            ]}
          >
            @{user.username}
          </Text>
          {user.bio && (
            <Text
              style={[
                styles.bio,
                {
                  color: colors.textSecondary,
                  fontSize: Typography.size.caption,
                },
              ]}
              numberOfLines={2}
            >
              {user.bio}
            </Text>
          )}
        </View>
        <LucideIcons.chevronRight size={20} color={colors.textSecondary} strokeWidth={2} />
      </GlassCard>
    </Pressable>
  );
}

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const { colors } = useTheme();
  const router = useRouter();

  const { data: users, isLoading } = useUserSearch(query);

  const handleUserPress = (userId: string) => {
    router.push(`/profile/${userId}`);
  };

  const renderUser = ({ item }: { item: User }) => (
    <UserItem user={item} onPress={() => handleUserPress(item.id)} />
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search Input */}
      <View style={styles.searchContainer}>
        <View
          style={[
            styles.searchInputContainer,
            {
              backgroundColor: colors.glassFill,
              borderColor: colors.glassBorder,
            },
          ]}
        >
          <LucideIcons.search size={20} color={colors.textSecondary} strokeWidth={2} />
          <TextInput
            style={[
              styles.searchInput,
              {
                color: colors.textPrimary,
                fontSize: Typography.size.body1,
              },
            ]}
            placeholder="Search users..."
            placeholderTextColor={colors.placeholder}
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')} hitSlop={12}>
              <LucideIcons.close size={20} color={colors.textSecondary} strokeWidth={2} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Results */}
      {query.length === 0 ? (
        <View style={styles.emptyState}>
          <LucideIcons.search size={64} color={colors.textSecondary} strokeWidth={2} />
          <Text
            style={[
              styles.emptyText,
              {
                color: colors.textSecondary,
                fontSize: Typography.size.body2,
              },
            ]}
          >
            Search for users by name or username
          </Text>
        </View>
      ) : isLoading ? (
        <View style={styles.loadingContainer}>
          <LoadingSpinner />
        </View>
      ) : users && users.length > 0 ? (
        <FlatList
          data={users}
          renderItem={renderUser}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
        />
      ) : (
        <View style={styles.emptyState}>
          <LucideIcons.search size={64} color={colors.textSecondary} strokeWidth={2} />
          <Text
            style={[
              styles.emptyText,
              {
                color: colors.textSecondary,
                fontSize: Typography.size.body2,
              },
            ]}
          >
            No users found for "{query}"
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    padding: Spacing.md,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    height: 50,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    height: '100%',
  },
  list: {
    padding: Spacing.md,
    paddingTop: 0,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
  },
  userInfo: {
    flex: 1,
  },
  displayName: {},
  username: {
    marginTop: 2,
  },
  bio: {
    marginTop: 4,
    lineHeight: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
});

