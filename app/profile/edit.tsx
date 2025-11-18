import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Switch,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/hooks/useTheme';
import { useThemeContext, ThemeMode } from '@/contexts/ThemeContext';
import { useImagePicker } from '@/hooks/useUpload';
import { usersApi } from '@/services/api/users';
import { uploadApi } from '@/services/api/upload';
import { GlassButton } from '@/components/GlassButton';
import { ImageUploadButton } from '@/components/ImageUploadButton';
import { VerificationBadge } from '@/components/VerificationBadge';
import { Spacing, Typography, LiquidGlass } from '@/constants/theme';
import { LucideIcons } from '@/utils/iconMapping';
import { UpdateUserDto, SocialLinks, PrivacySettings, EmailNotifications } from '@/types/user';

type EditTab = 'basic' | 'extended' | 'privacy' | 'notifications' | 'appearance';

export default function EditProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, glassFill, hairlineBorder } = useTheme();
  const { user: currentUser, refreshUser } = useAuth();
  const { themeMode, setThemeMode } = useThemeContext();
  const queryClient = useQueryClient();
  const { pickImage } = useImagePicker();

  const [activeTab, setActiveTab] = useState<EditTab>('basic');

  // Form state
  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [location, setLocation] = useState(currentUser?.location || '');
  const [website, setWebsite] = useState(currentUser?.website || '');
  const [avatarUri, setAvatarUri] = useState(currentUser?.avatarUrl || '');
  const [coverUri, setCoverUri] = useState(currentUser?.coverPhotoUrl || '');
  const [walletAddress, setWalletAddress] = useState(currentUser?.walletAddress || '');

  // Social links
  const [socialLinks, setSocialLinks] = useState<SocialLinks>(
    currentUser?.socialLinks || {}
  );

  // Privacy settings
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>(
    currentUser?.privacySettings || {
      profileVisibility: 'public',
      postsVisibility: 'everyone',
      messagesVisibility: 'everyone',
      showEmail: false,
    }
  );

  // Email notifications
  const [emailNotifications, setEmailNotifications] = useState<EmailNotifications>(
    currentUser?.emailNotifications || {
      likes: true,
      comments: true,
      follows: true,
      vcoinEarned: true,
    }
  );

  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  // Update user mutation
  const updateMutation = useMutation({
    mutationFn: (data: UpdateUserDto) => usersApi.update(currentUser!.id, data),
    onSuccess: async () => {
      await refreshUser();
      queryClient.invalidateQueries({ queryKey: ['user', currentUser?.id] });
      Alert.alert('Success', 'Profile updated successfully');
      router.back();
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update profile');
    },
  });

  const handleAvatarUpload = async () => {
    const image = await pickImage();
    if (!image) return;

    setIsUploadingAvatar(true);
    try {
      const file = {
        uri: image.uri,
        name: `avatar-${Date.now()}.jpg`,
        type: 'image/jpeg',
      };
      const response = await uploadApi.uploadImage(file);
      setAvatarUri(response.url);
    } catch (error) {
      Alert.alert('Error', 'Failed to upload avatar');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleCoverUpload = async () => {
    const image = await pickImage();
    if (!image) return;

    setIsUploadingCover(true);
    try {
      const file = {
        uri: image.uri,
        name: `cover-${Date.now()}.jpg`,
        type: 'image/jpeg',
      };
      const response = await uploadApi.uploadImage(file);
      setCoverUri(response.url);
    } catch (error) {
      Alert.alert('Error', 'Failed to upload cover photo');
    } finally {
      setIsUploadingCover(false);
    }
  };

  const handleSave = () => {
    if (!displayName.trim()) {
      Alert.alert('Error', 'Display name is required');
      return;
    }

    const updateData: UpdateUserDto = {
      displayName: displayName.trim(),
      bio: bio.trim() || undefined,
      avatarUrl: avatarUri || undefined,
      coverPhotoUrl: coverUri || undefined,
      location: location.trim() || undefined,
      website: website.trim() || undefined,
      socialLinks: Object.keys(socialLinks).length > 0 ? socialLinks : undefined,
      privacySettings,
      emailNotifications,
      walletAddress: walletAddress.trim() || undefined,
    };

    updateMutation.mutate(updateData);
  };

  const handleCancel = () => {
    router.back();
  };

  const renderTextInput = (
    label: string,
    value: string,
    onChangeText: (text: string) => void,
    placeholder: string,
    multiline = false,
    maxLength?: number,
    IconComponent?: any
  ) => {
    const Icon = IconComponent;
    return (
      <View style={styles.inputGroup}>
        <View style={styles.inputLabelRow}>
          {Icon && <Icon size={14} color={colors.textSecondary} strokeWidth={2} />}
          <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>{label}</Text>
        </View>
      <TextInput
        style={[
          styles.input,
          multiline && styles.textArea,
          {
            color: colors.textPrimary,
            backgroundColor: glassFill(LiquidGlass.fillIntensity.subtle),
            borderColor: hairlineBorder,
          },
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        multiline={multiline}
        maxLength={maxLength}
      />
        {maxLength && (
          <Text style={[styles.charCount, { color: colors.textTertiary }]}>
            {value.length}/{maxLength}
          </Text>
        )}
      </View>
    );
  };

  const tabs = [
    { key: 'basic', label: 'Basic', icon: LucideIcons.user },
    { key: 'extended', label: 'Extended', icon: LucideIcons.link },
    { key: 'privacy', label: 'Privacy', icon: LucideIcons.lock },
    { key: 'notifications', label: 'Alerts', icon: LucideIcons.alertCircle },
    { key: 'appearance', label: 'Theme', icon: LucideIcons.palette },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'basic':
        return (
          <View style={styles.tabContent}>
            {/* Photos */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Photos</Text>
              <View style={styles.photosRow}>
                <View style={styles.photoItem}>
                  <ImageUploadButton
                    label="Cover"
                    imageUri={coverUri}
                    onPress={handleCoverUpload}
                    aspectRatio="banner"
                    loading={isUploadingCover}
                  />
                </View>
                <View style={styles.photoItem}>
                  <ImageUploadButton
                    label="Avatar"
                    imageUri={avatarUri}
                    onPress={handleAvatarUpload}
                    aspectRatio="square"
                    loading={isUploadingAvatar}
                  />
                </View>
              </View>
            </View>

            {/* Basic Info */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Info</Text>
              {renderTextInput('Display Name', displayName, setDisplayName, 'Your name', false, 100, LucideIcons.user)}
              
              <View style={styles.inputGroup}>
                <View style={styles.inputLabelRow}>
                  <LucideIcons.user size={14} color={colors.textSecondary} strokeWidth={2} />
                  <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>Username</Text>
                </View>
                <View style={[styles.readonlyInput, { backgroundColor: glassFill(LiquidGlass.fillIntensity.subtle), borderColor: hairlineBorder }]}>
                  <Text style={[styles.readonlyText, { color: colors.textSecondary }]}>
                    @{currentUser?.username}
                  </Text>
                </View>
              </View>

              {renderTextInput('Bio', bio, setBio, 'Tell us about yourself', true, 500, LucideIcons.messageCircle)}
            </View>

            {/* Wallet & Verification */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Blockchain</Text>
              {renderTextInput('Wallet Address', walletAddress, setWalletAddress, '0x...', false, undefined, LucideIcons.wallet)}
              
              <View style={styles.verificationCard}>
                <View style={styles.verificationRow}>
                  <LucideIcons.checkmarkCircle size={16} color={colors.accent} strokeWidth={2} />
                  <Text style={[styles.verificationLabel, { color: colors.textPrimary }]}>
                    Verification
                  </Text>
                  {currentUser?.verificationTier && (
                    <VerificationBadge tier={currentUser.verificationTier} size={16} showLabel />
                  )}
                </View>
                <Pressable
                  style={[styles.upgradeButton, { borderColor: colors.accent }]}
                  onPress={() => router.push('/verification/apply')}
                >
                  <LucideIcons.chevronRight size={14} color={colors.accent} strokeWidth={2} />
                  <Text style={[styles.upgradeText, { color: colors.accent }]}>
                    {currentUser?.verificationTier ? 'Upgrade' : 'Apply'}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        );

      case 'extended':
        return (
          <View style={styles.tabContent}>
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Details</Text>
              {renderTextInput('Location', location, setLocation, 'City, Country', false, undefined, LucideIcons.mapPin)}
              {renderTextInput('Website', website, setWebsite, 'https://yoursite.com', false, undefined, LucideIcons.link)}
            </View>
            
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Social Links</Text>
              {renderTextInput('Twitter', socialLinks.twitter || '', (text) => setSocialLinks({ ...socialLinks, twitter: text }), '@username', false, undefined, LucideIcons.twitter)}
              {renderTextInput('Instagram', socialLinks.instagram || '', (text) => setSocialLinks({ ...socialLinks, instagram: text }), '@username', false, undefined, LucideIcons.instagram)}
              {renderTextInput('LinkedIn', socialLinks.linkedin || '', (text) => setSocialLinks({ ...socialLinks, linkedin: text }), 'username', false, undefined, LucideIcons.linkedin)}
              {renderTextInput('TikTok', socialLinks.tiktok || '', (text) => setSocialLinks({ ...socialLinks, tiktok: text }), '@username', false, undefined, LucideIcons.music)}
            </View>
          </View>
        );

      case 'privacy':
        return (
          <View style={styles.tabContent}>
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Visibility</Text>
              
              <View style={styles.settingRow}>
                <View style={styles.settingLeft}>
                  <LucideIcons.eye size={16} color={colors.textSecondary} strokeWidth={2} />
                  <View style={styles.settingTextContainer}>
                    <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>Profile</Text>
                    <Text style={[styles.settingDesc, { color: colors.textTertiary }]}>Who can view</Text>
                  </View>
                </View>
                <Pressable
                  style={[styles.settingButton, { borderColor: colors.accent }]}
                  onPress={() => {
                    setPrivacySettings({
                      ...privacySettings,
                      profileVisibility: privacySettings.profileVisibility === 'public' ? 'private' : 'public',
                    });
                  }}
                >
                  <Text style={[styles.settingValue, { color: colors.accent }]}>
                    {privacySettings.profileVisibility === 'public' ? 'Public' : 'Private'}
                  </Text>
                </Pressable>
              </View>

              <View style={styles.settingRow}>
                <View style={styles.settingLeft}>
                  <LucideIcons.document size={16} color={colors.textSecondary} strokeWidth={2} />
                  <View style={styles.settingTextContainer}>
                    <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>Posts</Text>
                    <Text style={[styles.settingDesc, { color: colors.textTertiary }]}>Who can see</Text>
                  </View>
                </View>
                <Pressable
                  style={[styles.settingButton, { borderColor: colors.accent }]}
                  onPress={() => {
                    const options = ['everyone', 'followers', 'nobody'];
                    const current = privacySettings.postsVisibility || 'everyone';
                    const currentIndex = options.indexOf(current);
                    const nextIndex = (currentIndex + 1) % options.length;
                    setPrivacySettings({
                      ...privacySettings,
                      postsVisibility: options[nextIndex] as any,
                    });
                  }}
                >
                  <Text style={[styles.settingValue, { color: colors.accent }]}>
                    {privacySettings.postsVisibility === 'everyone' ? 'All' : 
                     privacySettings.postsVisibility === 'followers' ? 'Followers' : 'None'}
                  </Text>
                </Pressable>
              </View>

              <View style={styles.settingRow}>
                <View style={styles.settingLeft}>
                  <LucideIcons.messageCircle size={16} color={colors.textSecondary} strokeWidth={2} />
                  <View style={styles.settingTextContainer}>
                    <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>Messages</Text>
                    <Text style={[styles.settingDesc, { color: colors.textTertiary }]}>Who can DM</Text>
                  </View>
                </View>
                <Pressable
                  style={[styles.settingButton, { borderColor: colors.accent }]}
                  onPress={() => {
                    const options = ['everyone', 'followers', 'nobody'];
                    const current = privacySettings.messagesVisibility || 'everyone';
                    const currentIndex = options.indexOf(current);
                    const nextIndex = (currentIndex + 1) % options.length;
                    setPrivacySettings({
                      ...privacySettings,
                      messagesVisibility: options[nextIndex] as any,
                    });
                  }}
                >
                  <Text style={[styles.settingValue, { color: colors.accent }]}>
                    {privacySettings.messagesVisibility === 'everyone' ? 'All' : 
                     privacySettings.messagesVisibility === 'followers' ? 'Followers' : 'None'}
                  </Text>
                </Pressable>
              </View>

              <View style={styles.settingRow}>
                <View style={styles.settingLeft}>
                  <LucideIcons.mail size={16} color={colors.textSecondary} strokeWidth={2} />
                  <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>Show Email</Text>
                </View>
                <Switch
                  value={privacySettings.showEmail || false}
                  onValueChange={(value) =>
                    setPrivacySettings({ ...privacySettings, showEmail: value })
                  }
                  trackColor={{ false: colors.border, true: colors.accent + '80' }}
                  thumbColor={privacySettings.showEmail ? colors.accent : colors.textTertiary}
                />
              </View>
            </View>
          </View>
        );

      case 'notifications':
        return (
          <View style={styles.tabContent}>
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Email Alerts</Text>
              
              <View style={styles.settingRow}>
                <View style={styles.settingLeft}>
                  <LucideIcons.heart size={16} color={colors.textSecondary} strokeWidth={2} />
                  <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>Likes</Text>
                </View>
                <Switch
                  value={emailNotifications.likes || false}
                  onValueChange={(value) =>
                    setEmailNotifications({ ...emailNotifications, likes: value })
                  }
                  trackColor={{ false: colors.border, true: colors.accent + '80' }}
                  thumbColor={emailNotifications.likes ? colors.accent : colors.textTertiary}
                />
              </View>

              <View style={styles.settingRow}>
                <View style={styles.settingLeft}>
                  <LucideIcons.messageCircle size={16} color={colors.textSecondary} strokeWidth={2} />
                  <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>Comments</Text>
                </View>
                <Switch
                  value={emailNotifications.comments || false}
                  onValueChange={(value) =>
                    setEmailNotifications({ ...emailNotifications, comments: value })
                  }
                  trackColor={{ false: colors.border, true: colors.accent + '80' }}
                  thumbColor={emailNotifications.comments ? colors.accent : colors.textTertiary}
                />
              </View>

              <View style={styles.settingRow}>
                <View style={styles.settingLeft}>
                  <LucideIcons.users size={16} color={colors.textSecondary} strokeWidth={2} />
                  <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>New Followers</Text>
                </View>
                <Switch
                  value={emailNotifications.follows || false}
                  onValueChange={(value) =>
                    setEmailNotifications({ ...emailNotifications, follows: value })
                  }
                  trackColor={{ false: colors.border, true: colors.accent + '80' }}
                  thumbColor={emailNotifications.follows ? colors.accent : colors.textTertiary}
                />
              </View>

              <View style={styles.settingRow}>
                <View style={styles.settingLeft}>
                  <LucideIcons.coins size={16} color={colors.textSecondary} strokeWidth={2} />
                  <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>VCoin Earned</Text>
                </View>
                <Switch
                  value={emailNotifications.vcoinEarned || false}
                  onValueChange={(value) =>
                    setEmailNotifications({ ...emailNotifications, vcoinEarned: value })
                  }
                  trackColor={{ false: colors.border, true: colors.accent + '80' }}
                  thumbColor={emailNotifications.vcoinEarned ? colors.accent : colors.textTertiary}
                />
              </View>
            </View>
          </View>
        );

      case 'appearance':
        return (
          <View style={styles.tabContent}>
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Theme</Text>
              <Text style={[styles.sectionDesc, { color: colors.textTertiary }]}>
                Choose how ViWoApp looks to you. Select a theme or sync with your system settings.
              </Text>
              
              {/* System/Auto Theme Option */}
              <Pressable
                style={[
                  styles.themeOption,
                  {
                    backgroundColor: themeMode === 'system' ? colors.accent + '15' : glassFill(LiquidGlass.fillIntensity.subtle),
                    borderColor: themeMode === 'system' ? colors.accent : hairlineBorder,
                    borderWidth: themeMode === 'system' ? 2 : StyleSheet.hairlineWidth,
                  },
                ]}
                onPress={() => setThemeMode('system')}
              >
                <View style={styles.themeLeft}>
                  <View style={[styles.themeIconContainer, { backgroundColor: colors.accent + '20' }]}>
                    <LucideIcons.monitor size={24} color={colors.accent} strokeWidth={2} />
                  </View>
                  <View style={styles.themeTextContainer}>
                    <Text style={[styles.themeLabel, { color: colors.textPrimary }]}>System</Text>
                    <Text style={[styles.themeDesc, { color: colors.textTertiary }]}>
                      Auto-switch based on device settings
                    </Text>
                  </View>
                </View>
                {themeMode === 'system' && (
                  <LucideIcons.checkmarkCircle size={24} color={colors.accent} strokeWidth={2} />
                )}
              </Pressable>

              {/* Light Theme Option */}
              <Pressable
                style={[
                  styles.themeOption,
                  {
                    backgroundColor: themeMode === 'light' ? colors.accent + '15' : glassFill(LiquidGlass.fillIntensity.subtle),
                    borderColor: themeMode === 'light' ? colors.accent : hairlineBorder,
                    borderWidth: themeMode === 'light' ? 2 : StyleSheet.hairlineWidth,
                  },
                ]}
                onPress={() => setThemeMode('light')}
              >
                <View style={styles.themeLeft}>
                  <View style={[styles.themeIconContainer, { backgroundColor: '#FFE56D20' }]}>
                    <LucideIcons.sun size={24} color="#FFD700" strokeWidth={2} />
                  </View>
                  <View style={styles.themeTextContainer}>
                    <Text style={[styles.themeLabel, { color: colors.textPrimary }]}>Light</Text>
                    <Text style={[styles.themeDesc, { color: colors.textTertiary }]}>
                      Bright and clear interface
                    </Text>
                  </View>
                </View>
                {themeMode === 'light' && (
                  <LucideIcons.checkmarkCircle size={24} color={colors.accent} strokeWidth={2} />
                )}
              </Pressable>

              {/* Dark Theme Option */}
              <Pressable
                style={[
                  styles.themeOption,
                  {
                    backgroundColor: themeMode === 'dark' ? colors.accent + '15' : glassFill(LiquidGlass.fillIntensity.subtle),
                    borderColor: themeMode === 'dark' ? colors.accent : hairlineBorder,
                    borderWidth: themeMode === 'dark' ? 2 : StyleSheet.hairlineWidth,
                  },
                ]}
                onPress={() => setThemeMode('dark')}
              >
                <View style={styles.themeLeft}>
                  <View style={[styles.themeIconContainer, { backgroundColor: '#6B8DFF20' }]}>
                    <LucideIcons.moon size={24} color="#6B8DFF" strokeWidth={2} />
                  </View>
                  <View style={styles.themeTextContainer}>
                    <Text style={[styles.themeLabel, { color: colors.textPrimary }]}>Dark</Text>
                    <Text style={[styles.themeDesc, { color: colors.textTertiary }]}>
                      Easy on the eyes in low light
                    </Text>
                  </View>
                </View>
                {themeMode === 'dark' && (
                  <LucideIcons.checkmarkCircle size={24} color={colors.accent} strokeWidth={2} />
                )}
              </Pressable>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top,
            backgroundColor: glassFill(LiquidGlass.fillIntensity.subtle),
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: hairlineBorder,
          },
        ]}
      >
        <Pressable onPress={handleCancel} style={styles.headerButton}>
          <LucideIcons.close size={20} color={colors.textPrimary} strokeWidth={2} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          Edit Profile
        </Text>
        <Pressable
          onPress={handleSave}
          disabled={updateMutation.isPending}
          style={styles.headerButton}
        >
          {updateMutation.isPending ? (
            <ActivityIndicator size="small" color={colors.accent} />
          ) : (
            <LucideIcons.check size={20} color={colors.accent} strokeWidth={2} />
          )}
        </Pressable>
      </View>

      {/* Tabs */}
      <View style={[styles.tabsContainer, { borderBottomColor: hairlineBorder }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            const Icon = tab.icon;
            return (
              <Pressable
                key={tab.key}
                onPress={() => setActiveTab(tab.key as EditTab)}
                style={[
                  styles.tab,
                  isActive && { borderBottomColor: colors.accent },
                ]}
              >
                <Icon size={16} color={isActive ? colors.accent : colors.textSecondary} strokeWidth={2} />
                <Text
                  style={[
                    styles.tabLabel,
                    {
                      color: isActive ? colors.accent : colors.textSecondary,
                      fontWeight: isActive ? Typography.weight.semibold : Typography.weight.regular,
                    },
                  ]}
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 80 }]}
      >
        {renderTabContent()}
      </ScrollView>

      {/* Save Button - Fixed at bottom */}
      <View
        style={[
          styles.saveContainer,
          {
            paddingBottom: insets.bottom,
            backgroundColor: glassFill(LiquidGlass.fillIntensity.subtle),
            borderTopColor: hairlineBorder,
          },
        ]}
      >
        <GlassButton
          onPress={handleSave}
          variant="primary"
          loading={updateMutation.isPending}
          style={styles.saveButton}
        >
          Save Changes
        </GlassButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: Typography.size.body1,
    fontWeight: Typography.weight.bold,
  },
  tabsContainer: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tabs: {
    paddingHorizontal: Spacing.sm,
    gap: Spacing.xs,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabLabel: {
    fontSize: Typography.size.caption,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.sm,
  },
  tabContent: {
    gap: Spacing.sm,
  },
  section: {
    gap: Spacing.xs,
  },
  sectionTitle: {
    fontSize: Typography.size.body2,
    fontWeight: Typography.weight.bold,
    marginBottom: Spacing.xs,
  },
  sectionDesc: {
    fontSize: Typography.size.caption,
    lineHeight: 18,
    marginBottom: Spacing.md,
  },
  photosRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  photoItem: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: Spacing.sm,
  },
  inputLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.xs,
  },
  inputLabel: {
    fontSize: Typography.size.caption,
    fontWeight: Typography.weight.semibold,
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 8,
    padding: Spacing.sm,
    fontSize: Typography.size.caption,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 10,
    textAlign: 'right',
    marginTop: 4,
  },
  readonlyInput: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 8,
    padding: Spacing.sm,
  },
  readonlyText: {
    fontSize: Typography.size.caption,
  },
  verificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
  },
  verificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  verificationLabel: {
    fontSize: Typography.size.caption,
    fontWeight: Typography.weight.semibold,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: StyleSheet.hairlineWidth,
  },
  upgradeText: {
    fontSize: 11,
    fontWeight: Typography.weight.semibold,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    flex: 1,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingLabel: {
    fontSize: Typography.size.caption,
    fontWeight: Typography.weight.semibold,
  },
  settingDesc: {
    fontSize: 10,
    marginTop: 2,
  },
  settingButton: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: StyleSheet.hairlineWidth,
    minWidth: 70,
    alignItems: 'center',
  },
  settingValue: {
    fontSize: 11,
    fontWeight: Typography.weight.semibold,
  },
  saveContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  saveButton: {
    width: '100%',
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: 12,
    marginBottom: Spacing.sm,
  },
  themeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Spacing.sm,
  },
  themeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeTextContainer: {
    flex: 1,
  },
  themeLabel: {
    fontSize: Typography.size.body2,
    fontWeight: Typography.weight.semibold,
    marginBottom: 2,
  },
  themeDesc: {
    fontSize: 11,
    lineHeight: 16,
  },
});
