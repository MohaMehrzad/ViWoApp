/**
 * ViWoApp Type Definitions
 * Centralized type definitions for the entire application
 */

// User types
export interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio?: string;
  followersCount?: number;
  followingCount?: number;
}

// Post types
export interface Post {
  id: string;
  author: User;
  content: string;
  media?: Media;
  timestamp: number;
  initialLikes?: number;
  initialShares?: number;
  initialReposts?: number;
  initialComments?: number;
  userId?: string; // For checking ownership
}

export interface Media {
  type: 'image' | 'video';
  uri: string;
  aspectRatio?: number;
  thumbnailUri?: string;
}

// Shorts types
export interface Short {
  id: string;
  videoUri: string;
  thumbnailUri?: string;
  author: User;
  title: string;
  initialLikes?: number;
  initialComments?: number;
}

// Notification types
export type NotificationType = 'reward' | 'follow' | 'mention' | 'like' | 'comment' | 'repost';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  timestamp: number;
  read?: boolean;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

// Message types
export interface MessageThread {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: number;
  unread: boolean;
  unreadCount?: number;
}

export interface Message {
  id: string;
  threadId: string;
  senderId: string;
  content: string;
  timestamp: number;
  read: boolean;
}

// VCoin types
export type EarnAction = 'like' | 'share' | 'repost';

export interface VCoinEarning {
  id: string;
  amount: number;
  source: EarnAction;
  timestamp: number;
  postId?: string;
}

export interface VCoinTransaction {
  id: string;
  type: 'earn' | 'send' | 'receive' | 'stake' | 'unstake';
  amount: number;
  timestamp: number;
  status: 'pending' | 'completed' | 'failed';
  metadata?: Record<string, any>;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

// Pagination types
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Loading & Error states
export interface LoadingState {
  isLoading: boolean;
  isRefreshing?: boolean;
  isLoadingMore?: boolean;
}

export interface ErrorState {
  hasError: boolean;
  error?: Error | ApiError;
  retryAction?: () => void;
}

// Screen props types
export interface ScreenLayoutInfo {
  headerHeight: number;
  headerContentHeight: number;
  tabBarHeight: number;
  tabBarBaseHeight: number;
  contentPaddingTop: number;
  contentPaddingBottom: number;
  insets: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

// Theme types
export interface ThemeColors {
  background: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
  success: string;
  warning: string;
  danger: string;
  glassFill: string;
  appleGlassFill: string;
  androidTranslucentBg: string;
  hairlineBorder: string;
  cardFallback: string;
}

// Performance monitoring types
export interface PerformanceMetrics {
  frameTime: number;
  fps: number;
  timestamp: number;
}

export interface BlurPerformanceConfig {
  enabled: boolean;
  frameTimeBudget: number;
  sustainedPoorPerformanceThreshold: number;
}

// Component prop types
export interface AccessibilityProps {
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: 'button' | 'link' | 'text' | 'image' | 'none' | 'header';
  accessibilityState?: {
    disabled?: boolean;
    selected?: boolean;
    checked?: boolean | 'mixed';
    busy?: boolean;
    expanded?: boolean;
  };
}

export interface HapticFeedbackConfig {
  enabled: boolean;
  style: 'light' | 'medium' | 'heavy';
}

// Form types
export interface FormField<T = string> {
  value: T;
  error?: string;
  touched: boolean;
  isValid: boolean;
}

// Navigation types
export type RootStackParamList = {
  '(tabs)': undefined;
  modal: undefined;
};

export type TabParamList = {
  index: undefined;
  shorts: undefined;
  defi: undefined;
  notifications: undefined;
  messages: undefined;
};

