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
        primary: '#000000',
        primary_container: '#131b2e',
        on_surface: '#191c1e',
        on_surface_variant: '#5c6370',
        outline_variant: 'rgba(25, 28, 30, 0.15)',
        tertiary_fixed_dim: '#2d6a58',
        on_primary_container: '#5a6578',
        error_container: '#f0e6e8',
        on_error_container: '#6b2f38',
        /** Soft emerald tint for positive / complete states */
        growth: '#2d6a58',
        growth_muted: 'rgba(45, 106, 88, 0.08)',
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
