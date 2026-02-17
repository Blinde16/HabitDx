/**
 * Design System - Colors
 * 
 * Centralized color definitions for the HabitDx app
 */

export const colors = {
  // Primary - Calm Blue
  primary: {
    50: '#EBF5FF',
    100: '#D6EBFF',
    200: '#A8D5FF',
    300: '#7AC0FF',
    400: '#4CABFF',
    500: '#4A90E2', // Main primary
    600: '#357ABD',
    700: '#2A6198',
    800: '#1F4873',
    900: '#14304E',
  },

  // Secondary - Success Green
  secondary: {
    50: '#E8F8F0',
    100: '#D1F2E1',
    200: '#A3E5C3',
    300: '#75D8A5',
    400: '#50C878', // Main secondary
    500: '#3DA563',
    600: '#2F824E',
    700: '#225F39',
    800: '#143C24',
    900: '#07190F',
  },

  // Purple - Brand Accent
  purple: {
    50: '#F5F3FF',
    100: '#EDE9FE',
    200: '#DDD6FE',
    300: '#C4B5FD',
    400: '#A78BFA',
    500: '#9333EA',
    600: '#7E22CE',
    700: '#6B21A8',
    800: '#581C87',
    900: '#3B0764',
  },

  // Neutrals
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },

  // Semantic Colors
  success: '#50C878',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',

  // Text Colors
  text: {
    primary: '#111827',
    secondary: '#4B5563',
    tertiary: '#9CA3AF',
    inverse: '#FFFFFF',
  },

  // Background Colors
  background: {
    primary: '#FFFFFF',
    secondary: '#F9FAFB',
    tertiary: '#F3F4F6',
  },

  // Border Colors
  border: {
    light: '#E5E7EB',
    medium: '#D1D5DB',
    dark: '#9CA3AF',
  },

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
};

export type ColorName = keyof typeof colors;
