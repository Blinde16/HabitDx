import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // HabitDx design system
        ink: '#0D1117',
        'ink-mid': '#161C27',
        'ink-soft': '#1E2738',
        gold: '#C8A84B',
        'gold-light': '#DFC07A',
        green: '#3D9E72',
        blue: '#4A7FC1',
        purple: '#7E6BBF',
        white: '#F5F2EC',
        muted: '#6B7A92',
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        mono: ['IBM Plex Mono', 'monospace'],
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
