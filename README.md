# HabitDx

A habit tracking application with AI-powered insights, built with Expo, React Native, and Supabase.

## Overview

HabitDx helps users build and maintain healthy habits through intelligent tracking, personalized recommendations, and AI-driven analysis. The app combines behavioral science principles with modern AI to provide actionable insights for habit formation.

## Tech Stack

- **Frontend**: React Native with Expo SDK 50
- **Navigation**: Expo Router (file-based routing)
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **State Management**: Zustand
- **AI Integration**: Mastra AI framework (planned)
- **Language**: TypeScript (strict mode)
- **Code Quality**: ESLint, Prettier, Husky pre-commit hooks

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 18 or higher ([Download](https://nodejs.org/))
- **npm**: Comes with Node.js (or use yarn/pnpm)
- **Expo CLI**: Install globally with `npm install -g expo-cli` (optional, can use `npx expo`)
- **Docker**: For running Supabase locally ([Download](https://www.docker.com/))
- **Supabase CLI**: Install with `npm install -g supabase` ([Docs](https://supabase.com/docs/guides/cli))
- **iOS Simulator** (Mac only): Xcode from the Mac App Store
- **Android Studio**: For Android emulator ([Download](https://developer.android.com/studio))

## Getting Started

### 1. Clone the Repository

\`\`\`bash
git clone https://github.com/Blinde16/HabitDx.git
cd HabitDx
\`\`\`

### 2. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 3. Set Up Environment Variables

Copy the example environment file and fill in your values:

\`\`\`bash
cp .env.example .env
\`\`\`

Edit `.env` and add your Supabase credentials:

\`\`\`env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
\`\`\`

**For local development with Supabase:**

\`\`\`env
EXPO_PUBLIC_SUPABASE_URL=http://localhost:54321
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-local-anon-key
\`\`\`

### 4. Start Supabase Locally

\`\`\`bash
supabase start
\`\`\`

This will start all Supabase services in Docker containers. Note the API URL and anon key from the output and add them to your `.env` file.

To check the status of Supabase services:

\`\`\`bash
supabase status
\`\`\`

To stop Supabase:

\`\`\`bash
supabase stop
\`\`\`

### 5. Run the App

Start the Expo development server:

\`\`\`bash
npm start
\`\`\`

Then choose your platform:

- **iOS Simulator**: Press `i` in the terminal (Mac only)
- **Android Emulator**: Press `a` in the terminal
- **Physical Device**: Scan the QR code with the Expo Go app ([iOS](https://apps.apple.com/app/expo-go/id982107779) | [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))
- **Web**: Press `w` in the terminal

### Platform-Specific Commands

\`\`\`bash
npm run ios # Start on iOS simulator
npm run android # Start on Android emulator
npm run web # Start web version
\`\`\`

## Project Structure

\`\`\`
HabitDx/
├── src/
│ ├── app/ # Expo Router screens (file-based routing)
│ │ ├── \_layout.tsx # Root layout
│ │ └── index.tsx # Home screen
│ ├── components/ # Reusable UI components
│ ├── hooks/ # Custom React hooks
│ ├── lib/ # Utilities and API clients
│ │ ├── supabase.ts # Supabase client configuration
│ │ └── constants.ts # App-wide constants
│ ├── stores/ # Zustand state management
│ ├── types/ # TypeScript type definitions
│ └── utils/ # Helper functions
├── supabase/
│ ├── migrations/ # Database schema migrations
│ ├── functions/ # Edge Functions
│ └── config.toml # Local Supabase configuration
├── ai/ # AI integration guides and roadmaps
├── .husky/ # Git hooks
├── app.json # Expo configuration
├── package.json # Dependencies and scripts
└── tsconfig.json # TypeScript configuration
\`\`\`

## Development Scripts

\`\`\`bash
npm start # Start Expo dev server
npm run ios # Run on iOS simulator
npm run android # Run on Android emulator
npm run web # Run in web browser
npm run lint # Run ESLint
npm run lint:fix # Fix ESLint errors automatically
npm run format # Format code with Prettier
npm run format:check # Check code formatting
npm run type-check # Run TypeScript type checking
\`\`\`

## Code Quality

This project uses:

- **TypeScript** with strict mode enabled
- **ESLint** for code linting (React, React Native, TypeScript rules)
- **Prettier** for code formatting
- **Husky** for Git hooks
- **lint-staged** to run linters on staged files before commit

Pre-commit hooks automatically:

- Run ESLint and fix auto-fixable issues
- Format code with Prettier
- Ensure code quality before commits

## Troubleshooting

### Expo Issues

**Metro bundler cache issues:**

\`\`\`bash
npx expo start --clear
\`\`\`

**iOS simulator not opening:**

- Ensure Xcode is installed and command line tools are configured
- Run: `sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer`

**Android emulator not starting:**

- Ensure Android Studio is installed
- Create an AVD (Android Virtual Device) in Android Studio
- Add Android SDK to your PATH

### Supabase Issues

**Supabase won't start:**

- Ensure Docker is running
- Check Docker has enough resources allocated (4GB+ RAM recommended)
- Run: `supabase stop` then `supabase start`

**Connection errors:**

- Verify `.env` file has correct Supabase URL and anon key
- Check Supabase is running: `supabase status`
- Ensure no port conflicts (default: 54321)

**Database migrations not applying:**

\`\`\`bash
supabase db reset
\`\`\`

### General Issues

**Module not found errors:**

\`\`\`bash
rm -rf node_modules package-lock.json
npm install
\`\`\`

**TypeScript errors:**

\`\`\`bash
npm run type-check
\`\`\`

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed contribution guidelines, coding standards, and git workflow.

## Project Roadmap

This project follows a phased development approach:

- **Phase 1**: Project Setup & Foundation ✅ (Current)
- **Phase 2**: Authentication System
- **Phase 3**: Database Schema & Backend
- **Phase 4**: Smart Onboarding Flow
- **Phase 5**: AI Failure Profile Generation
- **Phase 6**: Habit Stack Generation
- **Phase 7**: Daily Check-in System
- **Phase 8**: Push Notifications
- **Phase 9**: Weekly Iteration AI
- **Phase 10**: Core UI/UX Polish
- **Phase 11**: Testing & QA

See `ai/roadmaps/` for detailed phase documentation.

## Team

- Blake (Lead Developer)
- Sarah (Developer)
- Mike (Developer)

## License

[Add your license here]

## Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Supabase Documentation](https://supabase.com/docs)
- [Expo Router Guide](https://docs.expo.dev/router/introduction/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
