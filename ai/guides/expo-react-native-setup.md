# Expo & React Native Setup Guide

## Overview

HabitDx uses Expo with React Native for cross-platform mobile development. This guide covers project initialization, configuration, and best practices for the HabitDx tech stack.

## Why Expo?

- **Fast iteration**: Hot reload, over-the-air updates
- **Cross-platform**: Single codebase for iOS and Android
- **Built-in APIs**: Camera, notifications, file system, etc.
- **EAS Build**: Cloud build service for app binaries
- **Expo Router**: File-based routing system

## Prerequisites

```bash
# Node.js 18+ required
node --version  # Should be 18.x or higher

# Install Expo CLI
npm install -g expo-cli

# Install EAS CLI (for builds)
npm install -g eas-cli
```

## Project Initialization

### Create New Expo Project

```bash
# Create project with TypeScript template
npx create-expo-app@latest habitdx --template expo-template-blank-typescript

cd habitdx

# Install dependencies
npm install
```

### Folder Structure

```bash
# Set up recommended folder structure
mkdir -p src/app src/components src/hooks src/lib src/stores src/types
```

Final structure:

```
habitdx/
├── src/
│   ├── app/                    # Expo Router screens
│   │   ├── (auth)/            # Auth flow (login, signup)
│   │   ├── (onboarding)/      # Onboarding flow
│   │   ├── (tabs)/            # Main app tabs
│   │   │   ├── home.tsx
│   │   │   ├── insights.tsx
│   │   │   └── settings.tsx
│   │   ├── _layout.tsx        # Root layout
│   │   └── index.tsx          # Entry point
│   ├── components/            # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── HabitCard.tsx
│   │   └── TextInput.tsx
│   ├── hooks/                 # Custom React hooks
│   │   ├── useHabits.ts
│   │   ├── useAuth.ts
│   │   └── useNotifications.ts
│   ├── lib/                   # Utilities and clients
│   │   ├── supabase.ts
│   │   ├── api.ts
│   │   └── notifications.ts
│   ├── stores/                # Zustand state management
│   │   ├── authStore.ts
│   │   ├── habitStore.ts
│   │   └── onboardingStore.ts
│   └── types/                 # TypeScript definitions
│       ├── habit.ts
│       ├── user.ts
│       └── database.ts
├── assets/                     # Images, fonts, etc.
├── app.json                   # Expo config
├── package.json
├── tsconfig.json
└── .env.development
```

## Configuration

### app.json

```json
{
  "expo": {
    "name": "HabitDx",
    "slug": "habitdx",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "supportsTablet": false,
      "bundleIdentifier": "com.habitdx.app",
      "buildNumber": "1.0.0",
      "infoPlist": {
        "UIBackgroundModes": ["remote-notification"]
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.habitdx.app",
      "versionCode": 1,
      "permissions": ["RECEIVE_BOOT_COMPLETED", "VIBRATE", "SCHEDULE_EXACT_ALARM"]
    },
    "plugins": [
      "expo-router",
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#ffffff",
          "sounds": []
        }
      ]
    ],
    "scheme": "habitdx",
    "experiments": {
      "typedRoutes": true
    }
  }
}
```

### TypeScript Configuration

```json
// tsconfig.json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/stores/*": ["./src/stores/*"],
      "@/types/*": ["./src/types/*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx", ".expo/types/**/*.ts", "expo-env.d.ts"]
}
```

### Babel Configuration

```javascript
// babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          alias: {
            '@': './src',
            '@/components': './src/components',
            '@/hooks': './src/hooks',
            '@/lib': './src/lib',
            '@/stores': './src/stores',
            '@/types': './src/types',
          },
        },
      ],
      'react-native-reanimated/plugin', // Must be last
    ],
  };
};
```

## Core Dependencies

### Install Essential Packages

```bash
# Navigation
npx expo install expo-router react-native-safe-area-context react-native-screens expo-linking expo-constants expo-status-bar

# State Management
npm install zustand

# Supabase
npm install @supabase/supabase-js
npx expo install @react-native-async-storage/async-storage react-native-url-polyfill

# Notifications
npx expo install expo-notifications expo-device

# UI & Animation
npx expo install react-native-reanimated react-native-gesture-handler

# Forms & Validation
npm install react-hook-form zod @hookform/resolvers

# Date handling
npm install date-fns

# HTTP client (for direct API calls if needed)
npm install axios
```

### package.json Scripts

```json
{
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "lint": "eslint . --ext .ts,.tsx",
    "type-check": "tsc --noEmit",
    "test": "jest"
  }
}
```

## Expo Router Setup

### Root Layout

```typescript
// src/app/_layout.tsx
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';

export default function RootLayout() {
  const { session, loading } = useAuthStore();

  useEffect(() => {
    // Initialize auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        useAuthStore.getState().setSession(session);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return null; // Or loading screen
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {!session ? (
        <Stack.Screen name="(auth)" />
      ) : (
        <>
          <Stack.Screen name="(onboarding)" />
          <Stack.Screen name="(tabs)" />
        </>
      )}
    </Stack>
  );
}
```

### Auth Routes

```typescript
// src/app/(auth)/_layout.tsx
import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="forgot-password" />
    </Stack>
  );
}
```

### Tab Navigation

```typescript
// src/app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#6366f1',
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Today',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          title: 'Insights',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bulb" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
```

## State Management with Zustand

### Auth Store

```typescript
// src/stores/authStore.ts
import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';

interface AuthState {
  session: Session | null;
  user: User | null;
  loading: boolean;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  loading: true,
  setSession: (session) => set({ session, user: session?.user ?? null, loading: false }),
  setLoading: (loading) => set({ loading }),
}));
```

### Habit Store

```typescript
// src/stores/habitStore.ts
import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

interface Habit {
  id: string;
  name: string;
  tiny_version: string;
  anchor: string;
  celebration: string;
  rationale: string;
  reminder_time: string;
  is_active: boolean;
}

interface HabitState {
  habits: Habit[];
  loading: boolean;
  fetchHabits: (userId: string) => Promise<void>;
  checkIn: (habitId: string, completed: boolean, obstacle?: string) => Promise<void>;
}

export const useHabitStore = create<HabitState>((set, get) => ({
  habits: [],
  loading: false,

  fetchHabits: async (userId: string) => {
    set({ loading: true });

    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching habits:', error);
    } else {
      set({ habits: data || [] });
    }

    set({ loading: false });
  },

  checkIn: async (habitId: string, completed: boolean, obstacle?: string) => {
    const today = new Date().toISOString().split('T')[0];
    const userId = useAuthStore.getState().user?.id;

    if (!userId) return;

    const { error } = await supabase.from('habit_logs').upsert(
      {
        user_id: userId,
        habit_id: habitId,
        check_in_date: today,
        completed,
        obstacle,
      },
      {
        onConflict: 'habit_id,check_in_date',
      }
    );

    if (error) {
      console.error('Error checking in:', error);
      throw error;
    }
  },
}));
```

## UI Components

### Base Button Component

```typescript
// src/components/Button.tsx
import { Pressable, Text, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
}: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        styles[variant],
        pressed && styles.pressed,
        (disabled || loading) && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={[styles.text, styles[`${variant}Text`]]}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  primary: {
    backgroundColor: '#6366f1',
  },
  secondary: {
    backgroundColor: '#f3f4f6',
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  pressed: {
    opacity: 0.7,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryText: {
    color: '#fff',
  },
  secondaryText: {
    color: '#111827',
  },
  ghostText: {
    color: '#6366f1',
  },
});
```

### Habit Card Component

```typescript
// src/components/HabitCard.tsx
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

interface HabitCardProps {
  habit: {
    id: string;
    name: string;
    tiny_version: string;
    celebration: string;
  };
  completed: boolean;
  onPress: () => void;
}

export function HabitCard({ habit, completed, onPress }: HabitCardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSpring(0.95, {}, () => {
      scale.value = withSpring(1);
    });
    onPress();
  };

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={handlePress}
        style={[styles.card, completed && styles.completed]}
      >
        <View style={styles.checkbox}>
          {completed && (
            <Ionicons name="checkmark" size={24} color="#10b981" />
          )}
        </View>

        <View style={styles.content}>
          <Text style={styles.name}>{habit.name}</Text>
          <Text style={styles.tinyVersion}>{habit.tiny_version}</Text>
          {completed && (
            <Text style={styles.celebration}>✨ {habit.celebration}</Text>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  completed: {
    backgroundColor: '#f0fdf4',
    borderColor: '#10b981',
    borderWidth: 2,
  },
  checkbox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  tinyVersion: {
    fontSize: 14,
    color: '#6b7280',
  },
  celebration: {
    fontSize: 14,
    color: '#10b981',
    marginTop: 8,
    fontStyle: 'italic',
  },
});
```

## Environment Variables

### Setup

```bash
# .env.development
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

### Usage

```typescript
// Access in app
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
```

Note: Only variables prefixed with `EXPO_PUBLIC_` are available in the app.

## Running the App

### Development

```bash
# Start Expo dev server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run on physical device (scan QR code with Expo Go app)
npm start
```

### Preview Builds

```bash
# iOS preview
eas build --profile preview --platform ios

# Android preview (APK)
eas build --profile preview --platform android
```

## Performance Optimization

### Lazy Loading

```typescript
// Lazy load heavy screens
const InsightsScreen = lazy(() => import('./insights'));
```

### Memoization

```typescript
// Memoize expensive components
import { memo } from 'react';

export const HabitCard = memo(HabitCardComponent);
```

### Image Optimization

```typescript
// Use FastImage for better performance
import FastImage from 'react-native-fast-image';

<FastImage
  source={{ uri: imageUrl }}
  resizeMode={FastImage.resizeMode.cover}
/>
```

## Testing

### Jest Setup

```bash
npm install --save-dev jest @testing-library/react-native @testing-library/jest-native
```

```javascript
// jest.config.js
module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)',
  ],
};
```

### Example Test

```typescript
// src/components/__tests__/Button.test.tsx
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '../Button';

describe('Button', () => {
  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button title="Press me" onPress={onPress} />);

    fireEvent.press(getByText('Press me'));
    expect(onPress).toHaveBeenCalled();
  });
});
```

## Common Issues

### Metro Bundler Cache

```bash
# Clear cache if seeing weird errors
npx expo start --clear
```

### iOS Build Issues

```bash
# Clear iOS build folder
cd ios && rm -rf Pods Podfile.lock && pod install
```

### Android Build Issues

```bash
# Clean Android build
cd android && ./gradlew clean
```

## Next Steps

1. Initialize Expo project
2. Set up folder structure
3. Configure app.json and tsconfig.json
4. Install dependencies
5. Set up Expo Router
6. Create base components
7. Implement state management
8. Test on both platforms

## References

- [Expo Documentation](https://docs.expo.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [React Native Documentation](https://reactnative.dev/)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
