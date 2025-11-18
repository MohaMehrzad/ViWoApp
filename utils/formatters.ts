/**
 * Centralized formatting utilities for consistent display across the app
 */

/**
 * Format relative time from timestamp
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Formatted relative time string (e.g., "5m", "2h", "3d")
 */
export function getRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);

  if (months > 0) return `${months}mo`;
  if (weeks > 0) return `${weeks}w`;
  if (days > 0) return `${days}d`;
  if (hours > 0) return `${hours}h`;
  if (minutes > 0) return `${minutes}m`;
  return 'now';
}

/**
 * Format large numbers with K/M suffixes
 * @param num - Number to format
 * @returns Formatted string (e.g., "1.2K", "3.4M")
 */
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}

/**
 * Format VCoin balance consistently
 * @param balance - VCoin balance amount
 * @param options - Formatting options
 * @returns Formatted balance string
 */
export function formatVCoinBalance(
  balance: number | undefined | null,
  options: {
    showDecimals?: boolean;
    showCurrency?: boolean;
  } = {}
): string {
  const { showDecimals = false, showCurrency = true } = options;

  // Handle undefined/null balance (not authenticated or loading)
  if (balance === undefined || balance === null || isNaN(balance)) {
    return showCurrency ? '0 VCN' : '0';
  }

  // Standardized: Always integers for VCoin (no decimals by default)
  const formatted = balance.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  });

  return showCurrency ? `${formatted} VCN` : formatted;
}

/**
 * Format compact VCoin amount (for badges/chips)
 * @param amount - Amount to format
 * @returns Compact formatted string (e.g., "+1", "+2.5K")
 */
export function formatVCoinAmount(amount: number): string {
  if (amount >= 1000) {
    return `+${formatNumber(amount)}`;
  }
  return `+${amount}`;
}

