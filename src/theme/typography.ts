/**
 * Design System - Typography
 * 
 * Centralized typography definitions for the HabitDx app
 */

import { TextStyle } from 'react-native';
import { fontFamily } from '../lib/fonts';

export const typography = {
  // Font Families
  fontFamily: {
    regular: fontFamily.publicSans,
    medium: fontFamily.publicSansMedium,
    semiBold: fontFamily.publicSansSemibold,
    bold: fontFamily.manrope,
  },

  // Font Sizes
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },

  // Line Heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },

  // Font Weights
  fontWeight: {
    normal: '400' as TextStyle['fontWeight'],
    medium: '500' as TextStyle['fontWeight'],
    semibold: '600' as TextStyle['fontWeight'],
    bold: '700' as TextStyle['fontWeight'],
  },

  // Text Styles
  h1: {
    fontSize: 36,
    fontFamily: fontFamily.manrope,
    lineHeight: 43.2, // 1.2
  },
  h2: {
    fontSize: 30,
    fontFamily: fontFamily.manrope,
    lineHeight: 36, // 1.2
  },
  h3: {
    fontSize: 24,
    fontFamily: fontFamily.manropeSemibold,
    lineHeight: 31.2, // 1.3
  },
  h4: {
    fontSize: 20,
    fontFamily: fontFamily.manropeSemibold,
    lineHeight: 26, // 1.3
  },
  body: {
    fontSize: 16,
    fontFamily: fontFamily.publicSans,
    lineHeight: 24, // 1.5
  },
  bodySmall: {
    fontSize: 14,
    fontFamily: fontFamily.publicSans,
    lineHeight: 21, // 1.5
  },
  caption: {
    fontSize: 12,
    fontFamily: fontFamily.publicSans,
    lineHeight: 18, // 1.5
  },
  button: {
    fontSize: 16,
    fontFamily: fontFamily.publicSansSemibold,
    lineHeight: 24, // 1.5
  },
};

export type Typography = typeof typography;
