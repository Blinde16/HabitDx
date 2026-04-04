/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,jsx,ts,tsx}',
    './src/components/**/*.{js,jsx,ts,tsx}',
    './src/screens/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        surface: '#f7f9fb',
        surface_container_lowest: '#ffffff',
        surface_container_low: '#f2f4f6',
        surface_container_high: '#e8ebee',
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
        outline_variant: 'rgba(25, 28, 30, 0.15)',
        tertiary_fixed_dim: '#62c49d',
        on_primary_container: '#5a6578',
        error_container: '#f0e6e8',
        on_error_container: '#6b2f38',
        /** Brand-aligned positive / complete states */
        growth: '#62c49d',
        growth_muted: 'rgba(98, 196, 157, 0.14)',
        ghost_border: 'rgba(38, 50, 71, 0.12)',
        ghost_border_strong: 'rgba(38, 50, 71, 0.2)',
      },
      fontFamily: {
        manrope: ['Manrope_700Bold', 'Manrope', 'system-ui', 'sans-serif'],
        'manrope-md': ['Manrope_600SemiBold', 'Manrope', 'system-ui', 'sans-serif'],
        'manrope-reg': ['Manrope_400Regular', 'Manrope', 'system-ui', 'sans-serif'],
        public: ['PublicSans_400Regular', 'Public Sans', 'system-ui', 'sans-serif'],
        'public-md': ['PublicSans_500Medium', 'Public Sans', 'system-ui', 'sans-serif'],
        'public-sb': ['PublicSans_600SemiBold', 'Public Sans', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display-lg': ['2.25rem', { lineHeight: '2.75rem' }],
        'headline-lg': ['1.5rem', { lineHeight: '2rem' }],
        'body-md': ['1rem', { lineHeight: '1.625rem' }],
        'title-sm': ['0.875rem', { lineHeight: '1.375rem' }],
      },
      borderRadius: {
        lg: '1rem',
        xl: '1.5rem',
      },
      boxShadow: {
        float: '0 8px 40px rgba(25, 28, 30, 0.05)',
      },
    },
  },
  plugins: [],
};
