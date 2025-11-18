/**
 * Auto Update Time Hook
 * Automatically updates relative timestamps every minute
 */

import { useState, useEffect } from 'react';
import { getRelativeTime } from '@/utils/formatters';

/**
 * Hook that returns an auto-updating relative time string
 * Updates every minute to keep "5m ago" accurate
 * 
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Formatted relative time string that auto-updates
 */
export function useAutoUpdateTime(timestamp: number): string {
  const [relativeTime, setRelativeTime] = useState(() => getRelativeTime(timestamp));

  useEffect(() => {
    // Update immediately in case timestamp changed
    setRelativeTime(getRelativeTime(timestamp));

    // Update every minute (60 seconds)
    const interval = setInterval(() => {
      setRelativeTime(getRelativeTime(timestamp));
    }, 60000);

    return () => clearInterval(interval);
  }, [timestamp]);

  return relativeTime;
}

export default useAutoUpdateTime;

