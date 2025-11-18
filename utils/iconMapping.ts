/**
 * Icon Mapping Utility
 * Maps Ionicons to Lucide Icons for consistent, modern minimal design
 * 
 * Navbar icons (home, play-circle, wallet, notifications, chatbubbles) remain as Ionicons
 * All other icons use Lucide for ultra-minimal, clean cryptocurrency app aesthetic
 */

import {
  Heart,
  Share2,
  Repeat2,
  MessageCircle,
  MoreHorizontal,
  Search,
  Medal,
  CheckCircle2,
  Edit3,
  Trash2,
  Flag,
  Share,
  X,
  Image as ImageIcon,
  Send,
  Copy,
  QrCode,
  ArrowUpCircle,
  ArrowDownCircle,
  Calendar,
  Clock,
  Trophy,
  Star,
  TrendingUp,
  ChevronRight,
  Gift,
  Video,
  Info,
  LogOut,
  FileText,
  AlertCircle,
  Bitcoin,
  Plus,
  Mail,
  ArrowLeft,
  Check,
  VideoOff,
  Volume2,
  VolumeX,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Eye,
  EyeOff,
  User,
  ArrowLeftRight,
  Download,
  Lock,
  ShoppingCart,
  ArrowUpDown,
  Users,
  UserPlus,
  Coins,
  MapPin,
  Link,
  Wallet,
  Twitter,
  Instagram,
  Linkedin,
  Music,
  Moon,
  Sun,
  Monitor,
  Palette,
  Play,
} from 'lucide-react-native';

/**
 * Lucide icon components mapped by semantic name
 * Makes it easy to import and use throughout the app
 */
export const LucideIcons = {
  // Post actions
  heart: Heart,
  share: Share2,
  repost: Repeat2,
  comment: MessageCircle,
  more: MoreHorizontal,
  
  // Navigation & UI
  search: Search,
  close: X,
  add: Plus,
  chevronRight: ChevronRight,
  arrowLeft: ArrowLeft,
  
  // Verification & Status
  medal: Medal,
  checkmarkCircle: CheckCircle2,
  check: Check,
  alertCircle: AlertCircle,
  star: Star,
  
  // Post management
  edit: Edit3,
  delete: Trash2,
  report: Flag,
  shareExternal: Share,
  
  // Media
  image: ImageIcon,
  video: Video,
  play: Play,
  
  // Messaging
  send: Send,
  
  // VCoin & Transactions
  copy: Copy,
  qrCode: QrCode,
  arrowUp: ArrowUpCircle,
  arrowDown: ArrowDownCircle,
  bitcoin: Bitcoin,
  
  // Time & Rewards
  calendar: Calendar,
  clock: Clock,
  trophy: Trophy,
  gift: Gift,
  trendingUp: TrendingUp,
  
  // Profile
  logout: LogOut,
  document: FileText,
  mail: Mail,
  
  // Info
  info: Info,
  
  // Video controls
  videoOff: VideoOff,
  volumeHigh: Volume2,
  volumeMute: VolumeX,
  
  // Chevrons
  chevronDown: ChevronDown,
  chevronUp: ChevronUp,
  
  // Warnings
  warning: AlertTriangle,
  
  // Password visibility
  eye: Eye,
  eyeOff: EyeOff,
  
  // User/Profile
  user: User,
  users: Users,
  userPlus: UserPlus,
  
  // DeFi & Exchange
  arrowLeftRight: ArrowLeftRight,
  download: Download,
  lock: Lock,
  shoppingCart: ShoppingCart,
  arrowUpDown: ArrowUpDown,
  coins: Coins,
  
  // Location & Links
  mapPin: MapPin,
  link: Link,
  wallet: Wallet,
  
  // Social Media
  twitter: Twitter,
  instagram: Instagram,
  linkedin: Linkedin,
  music: Music,
  
  // Theme/Appearance
  moon: Moon,
  sun: Sun,
  monitor: Monitor,
  palette: Palette,
  
  // Additional
  messageCircle: MessageCircle,
};

/**
 * Icon name mapping from Ionicons to Lucide equivalents
 * Use this for quick reference when replacing icons
 */
export const iconMapping: Record<string, keyof typeof LucideIcons> = {
  // Post actions
  'heart': 'heart',
  'heart-outline': 'heart',
  'share-social': 'share',
  'share-social-outline': 'share',
  'repeat': 'repost',
  'repeat-outline': 'repost',
  'chatbubble': 'comment',
  'chatbubble-outline': 'comment',
  'chatbubbles-outline': 'comment',
  'ellipsis-horizontal': 'more',
  'ellipsis-vertical': 'more',
  
  // Navigation
  'search': 'search',
  'search-outline': 'search',
  'close': 'close',
  'close-circle': 'close',
  'add': 'add',
  'chevron-forward': 'chevronRight',
  'arrow-back': 'arrowLeft',
  
  // Verification
  'medal': 'medal',
  'checkmark-circle': 'checkmarkCircle',
  'checkmark': 'check',
  'alert-circle': 'alertCircle',
  'star': 'star',
  
  // Editing
  'create-outline': 'edit',
  'trash-outline': 'delete',
  'flag-outline': 'report',
  
  // Media
  'image-outline': 'image',
  'videocam-outline': 'video',
  
  // Messaging
  'send': 'send',
  
  // VCoin
  'copy-outline': 'copy',
  'qr-code': 'qrCode',
  'arrow-up-circle': 'arrowUp',
  'arrow-down-circle': 'arrowDown',
  'logo-bitcoin': 'bitcoin',
  
  // Time & Rewards
  'calendar-outline': 'calendar',
  'time-outline': 'clock',
  'trophy-outline': 'trophy',
  'gift': 'gift',
  'gift-outline': 'gift',
  'trending-up': 'trendingUp',
  
  // Profile
  'log-out-outline': 'logout',
  'document-text-outline': 'document',
  
  // Info
  'information-circle-outline': 'info',
  'mail-outline': 'mail',
};

/**
 * Get Lucide icon name from Ionicons name
 * Useful for programmatic icon selection
 */
export function getLucideIconName(ioniconsName: string): keyof typeof LucideIcons | null {
  return iconMapping[ioniconsName] || null;
}

/**
 * Icon sizing constants for consistency
 */
export const IconSizes = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 28,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

/**
 * Stroke width recommendations for different use cases
 */
export const StrokeWidths = {
  light: 1.5,
  regular: 2,
  medium: 2.5,
  bold: 3,
};

