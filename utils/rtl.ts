/**
 * RTL (Right-to-Left) Support Utilities
 * Helpers for RTL language support (Arabic, Hebrew, etc.)
 */

import { I18nManager, ViewStyle } from 'react-native';

/**
 * Check if device is in RTL mode
 */
export function isRTL(): boolean {
  return I18nManager.isRTL;
}

/**
 * Get appropriate position style for RTL/LTR
 * @param position - Position value (e.g., 20)
 * @param side - Which side ('left' or 'right')
 */
export function getPositionStyle(position: number, side: 'left' | 'right'): ViewStyle {
  if (side === 'left') {
    return isRTL() ? { right: position } : { left: position };
  } else {
    return isRTL() ? { left: position } : { right: position };
  }
}

/**
 * Get horizontal positioning for absolute elements
 * Automatically flips left/right based on RTL mode
 */
export function getRTLPosition(leftValue?: number, rightValue?: number): ViewStyle {
  if (isRTL()) {
    return {
      ...(leftValue !== undefined && { right: leftValue }),
      ...(rightValue !== undefined && { left: rightValue }),
    };
  }
  
  return {
    ...(leftValue !== undefined && { left: leftValue }),
    ...(rightValue !== undefined && { right: rightValue }),
  };
}

/**
 * Get text align based on RTL mode
 */
export function getTextAlign(align: 'left' | 'right' | 'center' = 'left'): 'left' | 'right' | 'center' {
  if (align === 'center') return 'center';
  
  if (align === 'left') {
    return isRTL() ? 'right' : 'left';
  } else {
    return isRTL() ? 'left' : 'right';
  }
}

/**
 * Get flex direction based on RTL mode
 */
export function getFlexDirection(direction: 'row' | 'row-reverse' = 'row'): 'row' | 'row-reverse' {
  if (direction === 'row') {
    return isRTL() ? 'row-reverse' : 'row';
  } else {
    return isRTL() ? 'row' : 'row-reverse';
  }
}

/**
 * Transform value for RTL (useful for translateX)
 */
export function rtlValue(value: number): number {
  return isRTL() ? -value : value;
}

/**
 * Get margin/padding style for RTL
 */
export function getDirectionalSpacing(
  start?: number,
  end?: number,
  top?: number,
  bottom?: number
): ViewStyle {
  const style: ViewStyle = {};
  
  if (start !== undefined) {
    if (isRTL()) {
      style.marginEnd = start;
    } else {
      style.marginStart = start;
    }
  }
  
  if (end !== undefined) {
    if (isRTL()) {
      style.marginStart = end;
    } else {
      style.marginEnd = end;
    }
  }
  
  if (top !== undefined) style.marginTop = top;
  if (bottom !== undefined) style.marginBottom = bottom;
  
  return style;
}

export default {
  isRTL,
  getPositionStyle,
  getRTLPosition,
  getTextAlign,
  getFlexDirection,
  rtlValue,
  getDirectionalSpacing,
};

