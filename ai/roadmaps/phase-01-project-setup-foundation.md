# Phase 1: Project Setup & Foundation

**Date Created:** February 9, 2026  
**Date Completed:** February 12, 2026  
**Phase Duration:** 3-5 days  
**Dependencies:** None  
**Status:** ✅ COMPLETED

## Overview

Establish the foundational technical infrastructure for HabitDx. This phase focuses on setting up the development environment, project structure, and core dependencies without any feature implementation.

## Goals

- Create a working Expo + React Native project
- Set up Supabase project and local development
- Configure TypeScript, ESLint, Prettier
- Establish folder structure and coding conventions
- Document setup process for team members

## Success Criteria

- [ ] Expo app runs on iOS simulator/device
- [ ] Expo app runs on Android emulator/device
- [ ] Supabase connection verified
- [ ] TypeScript compilation with strict mode
- [ ] All linters and formatters configured
- [ ] README with setup instructions complete

## Technical Tasks

### 1. Initialize Expo Project

- [ ] Run `npx create-expo-app@latest` with TypeScript template
- [ ] Configure Expo SDK 50+
- [ ] Set up Expo Router for file-based navigation
- [ ] Test basic "Hello World" on both platforms

### 2. Configure Development Tools

- [ ] Set up TypeScript with strict configuration
- [ ] Configure ESLint with React Native rules
- [ ] Set up Prettier with project formatting standards
- [ ] Add pre-commit hooks with Husky + lint-staged
- [ ] Configure VS Code workspace settings

### 3. Set Up Supabase Project

- [ ] Create Supabase account and project
- [ ] Install Supabase CLI locally
- [ ] Initialize `supabase/` folder structure
- [ ] Configure local Supabase instance (Docker)
- [ ] Set up environment variables template

### 4. Establish Project Structure

```
src/
├── app/                    # Expo Router screens (placeholder)
├── components/            # Reusable UI components
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities, API clients
│   ├── supabase.ts       # Supabase client setup
│   └── constants.ts      # App constants
├── stores/               # Zustand state management
├── types/                # TypeScript definitions
└── utils/                # Helper functions

supabase/
├── migrations/           # Database schema changes
├── functions/            # Edge Functions (placeholder)
└── config.toml          # Local config
```

### 5. Install Core Dependencies

```json
{
  "dependencies": {
    "expo": "~50.x.x",
    "expo-router": "^3.x.x",
    "react-native": "x.x.x",
    "@supabase/supabase-js": "^2.x.x",
    "zustand": "^4.x.x"
  },
  "devDependencies": {
    "@types/react": "^18.x.x",
    "@types/react-native": "^0.x.x",
    "typescript": "^5.x.x",
    "eslint": "^8.x.x",
    "prettier": "^3.x.x"
  }
}
```

### 6. Configure Environment Variables

- [ ] Create `.env.example` with required variables
- [ ] Add `.env` to `.gitignore`
- [ ] Document all environment variables:
  - `EXPO_PUBLIC_SUPABASE_URL`
  - `EXPO_PUBLIC_SUPABASE_ANON_KEY`
  - Development vs Production configs

### 7. Git Configuration

- [ ] Initialize Git repository
- [ ] Create `.gitignore` with common exclusions
- [ ] Set up branch strategy (main → develop → feature branches)
- [ ] Create initial commit with project scaffold
- [ ] Push to remote repository

### 8. Documentation

- [ ] Create comprehensive README.md
  - Prerequisites (Node 18+, Expo CLI)
  - Installation steps
  - Running locally (iOS/Android)
  - Environment setup
  - Troubleshooting common issues
- [ ] Document folder structure in README
- [ ] Create CONTRIBUTING.md with code conventions

## Deliverables

1. **Working Expo Application**
   - Runs on iOS and Android
   - Shows placeholder home screen
   - No runtime errors

2. **Supabase Connection**
   - Local Supabase instance running
   - Connection verified with test query
   - Environment variables configured

3. **Development Tooling**
   - TypeScript compiling without errors
   - ESLint and Prettier running on save
   - Pre-commit hooks functional

4. **Project Documentation**
   - README with complete setup guide
   - Environment variables documented
   - Code style guide established

## Testing Checklist

- [ ] `npm install` completes without errors
- [ ] `npx expo start` launches dev server
- [ ] App loads on iOS simulator
- [ ] App loads on Android emulator
- [ ] Hot reload works on both platforms
- [ ] TypeScript compilation succeeds
- [ ] Linting passes with `npm run lint`
- [ ] Supabase CLI commands work (`supabase status`)

## Risks & Mitigations

| Risk                              | Likelihood | Impact | Mitigation                                    |
| --------------------------------- | ---------- | ------ | --------------------------------------------- |
| Expo SDK compatibility issues     | Low        | Medium | Use stable SDK 50, test on multiple devices   |
| Supabase local setup difficulties | Medium     | Low    | Provide detailed docs, Docker troubleshooting |
| Team onboarding friction          | Medium     | Medium | Comprehensive README, setup script            |
| Platform-specific build errors    | Low        | High   | Test on both iOS/Android early                |

## Dependencies for Next Phase

Phase 2 (Authentication System) requires:

- ✅ Working Expo app
- ✅ Supabase client configured
- ✅ Basic folder structure
- ✅ Environment variables set

## Notes

- Focus on getting a clean, working foundation
- Don't implement any features yet—just infrastructure
- Ensure all team members can run the project locally
- Document everything as you go
- Test on real devices, not just simulators

## Resources

- [Expo Documentation](https://docs.expo.dev/)
- [Supabase Documentation](https://supabase.com/docs)
- [React Native Best Practices](https://reactnative.dev/docs/getting-started)
- [Expo Router Guide](https://docs.expo.dev/router/introduction/)
