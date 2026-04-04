/**
 * Design tokens aligned with Master Design (Intellectual Sanctuary).
 * Prefer Tailwind semantic tokens in UI; this module supports legacy imports.
 */

export const colors = {
  surface: '#f7f9fb',
  surface_container_lowest: '#ffffff',
  surface_container_low: '#f2f4f6',
  surface_container_highest: '#e0e3e5',
  surface_brand: '#eef7f3',
  surface_brand_muted: '#f3fbf8',
  primary: '#000000',
  primary_container: '#263247',
  primary_accent: '#2d384a',
  accent: '#62c49d',
  accent_strong: '#6ed0a8',
  on_surface: '#191c1e',
  on_surface_variant: '#5c6370',
  tertiary_fixed_dim: '#62c49d',
  on_primary_container: '#5a6578',
  error_container: '#f0e6e8',
  on_error_container: '#6b2f38',

  success: '#62c49d',
  error: '#6b2f38',
  warning: '#7d6b55',
  info: '#263247',

  text: {
    primary: '#191c1e',
    secondary: '#5c6370',
    tertiary: '#8a9199',
    inverse: '#FFFFFF',
  },

  background: {
    primary: '#f7f9fb',
    secondary: '#f2f4f6',
    tertiary: '#e0e3e5',
    brand: '#eef7f3',
  },

  border: {
    light: 'rgba(25, 28, 30, 0.15)',
    medium: 'rgba(25, 28, 30, 0.25)',
    dark: 'rgba(25, 28, 30, 0.4)',
    ghost: 'rgba(38, 50, 71, 0.12)',
    accent: 'rgba(98, 196, 157, 0.24)',
  },

  overlay: 'rgba(0, 0, 0, 0.4)',
};

export type ColorName = keyof typeof colors;
