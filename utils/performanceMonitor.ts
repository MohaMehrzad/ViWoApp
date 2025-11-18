/**
 * Performance Monitoring Utilities
 * Monitors frame times and automatically disables blur effects on low-end devices
 */

import { useEffect, useState } from 'react';
import { Performance } from '@/constants/theme';

interface PerformanceMetrics {
  averageFrameTime: number;
  fps: number;
  poorPerformanceDuration: number;
}

class PerformanceMonitor {
  private frameTimestamps: number[] = [];
  private poorPerformanceStartTime: number | null = null;
  private isMonitoring = false;
  private metrics: PerformanceMetrics = {
    averageFrameTime: 0,
    fps: 60,
    poorPerformanceDuration: 0,
  };

  /**
   * Start monitoring performance
   */
  start() {
    if (this.isMonitoring) return;
    this.isMonitoring = true;
    this.frameTimestamps = [];
    this.poorPerformanceStartTime = null;
    this.scheduleFrame();
  }

  /**
   * Stop monitoring performance
   */
  stop() {
    this.isMonitoring = false;
    this.frameTimestamps = [];
    this.poorPerformanceStartTime = null;
  }

  /**
   * Schedule next frame measurement
   */
  private scheduleFrame() {
    if (!this.isMonitoring) return;

    requestAnimationFrame((timestamp) => {
      this.recordFrame(timestamp);
      this.scheduleFrame();
    });
  }

  /**
   * Record frame timestamp and calculate metrics
   */
  private recordFrame(timestamp: number) {
    this.frameTimestamps.push(timestamp);

    // Keep only last 60 frames (1 second at 60fps)
    if (this.frameTimestamps.length > 60) {
      this.frameTimestamps.shift();
    }

    // Calculate metrics if we have enough data
    if (this.frameTimestamps.length >= 2) {
      this.calculateMetrics();
    }
  }

  /**
   * Calculate performance metrics from frame timestamps
   */
  private calculateMetrics() {
    const frames = this.frameTimestamps;
    let totalFrameTime = 0;

    // Calculate average frame time
    for (let i = 1; i < frames.length; i++) {
      totalFrameTime += frames[i] - frames[i - 1];
    }

    const averageFrameTime = totalFrameTime / (frames.length - 1);
    const fps = 1000 / averageFrameTime;

    this.metrics = {
      averageFrameTime,
      fps,
      poorPerformanceDuration: this.calculatePoorPerformanceDuration(averageFrameTime),
    };
  }

  /**
   * Calculate how long performance has been poor
   */
  private calculatePoorPerformanceDuration(averageFrameTime: number): number {
    const isPoorPerformance = averageFrameTime > Performance.frameTimeBudget;

    if (isPoorPerformance) {
      if (this.poorPerformanceStartTime === null) {
        this.poorPerformanceStartTime = Date.now();
      }
      return Date.now() - this.poorPerformanceStartTime;
    } else {
      this.poorPerformanceStartTime = null;
      return 0;
    }
  }

  /**
   * Get current metrics
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Check if blur should be disabled based on sustained poor performance
   */
  shouldDisableBlur(): boolean {
    return (
      this.metrics.poorPerformanceDuration >
      Performance.sustainedPoorPerformanceThreshold
    );
  }
}

// Singleton instance
const performanceMonitor = new PerformanceMonitor();

/**
 * Hook to monitor blur performance and automatically disable it on low-end devices
 * @returns shouldDisableBlur - true if blur should be disabled due to poor performance
 */
export function useBlurPerformance(): boolean {
  const [shouldDisableBlur, setShouldDisableBlur] = useState(false);

  useEffect(() => {
    // Start monitoring
    performanceMonitor.start();

    // Check performance every second
    const interval = setInterval(() => {
      const shouldDisable = performanceMonitor.shouldDisableBlur();
      setShouldDisableBlur(shouldDisable);
    }, 1000);

    return () => {
      clearInterval(interval);
      performanceMonitor.stop();
    };
  }, []);

  return shouldDisableBlur;
}

/**
 * Get current performance metrics
 */
export function getPerformanceMetrics(): PerformanceMetrics {
  return performanceMonitor.getMetrics();
}

/**
 * Manually start performance monitoring
 */
export function startPerformanceMonitoring() {
  performanceMonitor.start();
}

/**
 * Manually stop performance monitoring
 */
export function stopPerformanceMonitoring() {
  performanceMonitor.stop();
}

export default performanceMonitor;

