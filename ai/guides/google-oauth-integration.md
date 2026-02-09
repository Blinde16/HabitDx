# Google OAuth Integration Guide

## Overview

This guide covers implementing Google Sign-In for HabitDx using Supabase Auth and Expo. Google OAuth provides a frictionless onboarding experience and reduces signup friction.

## Prerequisites

- Supabase project set up
- Google Cloud Platform account
- iOS and Android app configured

## Google Cloud Platform Setup

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project: "HabitDx"
3. Enable Google+ API and Google Sign-In API

### 2. Configure OAuth Consent Screen

1. **Go to**: APIs & Services → OAuth consent screen
2. **User Type**: External
3. **App Information**:
   - App name: HabitDx
   - User support email: support@habitdx.com
   - App logo: Upload 512x512 icon
4. **Scopes**: 
   - `email`
   - `profile`
   - `openid`
5. **Test users**: Add your email for testing
6. **Submit for verification** (after MVP testing)

### 3. Create OAuth 2.0 Credentials

#### Web Client (for Supabase)

1. **Go to**: APIs & Services → Credentials
2. **Create OAuth client ID**
3. **Application type**: Web application
4. **Name**: "HabitDx Web"
5. **Authorized redirect URIs**:
   ```
   https://[YOUR_PROJECT_REF].supabase.co/auth/v1/callback
   ```
6. **Save Client ID and Client Secret**

#### iOS Client

1. **Create OAuth client ID**
2. **Application type**: iOS
3. **Name**: "HabitDx iOS"
4. **Bundle ID**: `com.habitdx.app`
5. **Save iOS Client ID**

#### Android Client

1. **Create OAuth client ID**
2. **Application type**: Android
3. **Name**: "HabitDx Android"
4. **Package name**: `com.habitdx.app`
5. **SHA-1 certificate fingerprint**:
   ```bash
   # Get from your keystore
   keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey
   # Password: android
   ```
6. **Save Android Client ID**

#### Expo Client (for development)

1. **Create OAuth client ID**
2. **Application type**: iOS
3. **Bundle ID**: `host.exp.exponent`
4. **Save Expo Client ID**

## Supabase Configuration

### Enable Google Provider

1. **Go to**: Supabase Dashboard → Authentication → Providers
2. **Enable Google**
3. **Add credentials**:
   - Client ID: (Web Client ID from Google Cloud)
   - Client Secret: (Web Client Secret from Google Cloud)
4. **Save**

### Redirect URLs

Add these redirect URLs in Supabase:
```
exp://localhost:8081
habitdx://
https://[your-domain].com/auth/callback
```

## Expo Configuration

### Install Dependencies

```bash
npx expo install expo-auth-session expo-crypto expo-web-browser
npm install @react-native-google-signin/google-signin
```

### Configure app.json

```json
{
  "expo": {
    "scheme": "habitdx",
    "plugins": [
      [
        "@react-native-google-signin/google-signin",
        {
          "iosUrlScheme": "com.googleusercontent.apps.YOUR_IOS_CLIENT_ID"
        }
      ]
    ],
    "ios": {
      "bundleIdentifier": "com.habitdx.app",
      "googleServicesFile": "./GoogleService-Info.plist"
    },
    "android": {
      "package": "com.habitdx.app",
      "googleServicesFile": "./google-services.json"
    }
  }
}
```

## Implementation

### Google Sign-In Hook

```typescript
// src/hooks/useGoogleAuth.ts
import { useState, useEffect } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '@/lib/supabase';
import { makeRedirectUri } from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();

const EXPO_CLIENT_ID = 'YOUR_EXPO_CLIENT_ID';
const IOS_CLIENT_ID = 'YOUR_IOS_CLIENT_ID';
const ANDROID_CLIENT_ID = 'YOUR_ANDROID_CLIENT_ID';
const WEB_CLIENT_ID = 'YOUR_WEB_CLIENT_ID';

export function useGoogleAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: EXPO_CLIENT_ID,
    iosClientId: IOS_CLIENT_ID,
    androidClientId: ANDROID_CLIENT_ID,
    webClientId: WEB_CLIENT_ID,
    redirectUri: makeRedirectUri({
      scheme: 'habitdx',
    }),
  });

  useEffect(() => {
    if (response?.type === 'success') {
      handleGoogleSignIn(response.authentication?.idToken);
    } else if (response?.type === 'error') {
      setError('Google sign-in failed');
      setLoading(false);
    }
  }, [response]);

  async function handleGoogleSignIn(idToken?: string) {
    if (!idToken) {
      setError('No ID token received');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: idToken,
      });

      if (error) throw error;

      // Check if user needs onboarding
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('onboarding_completed_at')
        .eq('user_id', data.user.id)
        .single();

      return {
        user: data.user,
        needsOnboarding: !profile?.onboarding_completed_at,
      };
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function signInWithGoogle() {
    setLoading(true);
    setError(null);
    await promptAsync();
  }

  return {
    signInWithGoogle,
    loading,
    error,
    disabled: !request,
  };
}
```

### Login Screen with Google Button

```typescript
// src/app/(auth)/login.tsx
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Button } from '@/components/Button';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const { signInWithGoogle, loading, error, disabled } = useGoogleAuth();
  const [emailLoading, setEmailLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithGoogle();
      
      if (result?.needsOnboarding) {
        router.replace('/(onboarding)/welcome');
      } else {
        router.replace('/(tabs)/home');
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
    }
  };

  const handleEmailSignIn = async (email: string, password: string) => {
    setEmailLoading(true);
    // ... email sign-in logic
    setEmailLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to HabitDx</Text>
      <Text style={styles.subtitle}>
        Understand why your habits fail
      </Text>

      {/* Google Sign-In Button */}
      <Pressable
        style={[styles.googleButton, (loading || disabled) && styles.disabled]}
        onPress={handleGoogleSignIn}
        disabled={loading || disabled}
      >
        <Ionicons name="logo-google" size={20} color="#4285F4" />
        <Text style={styles.googleButtonText}>
          {loading ? 'Signing in...' : 'Continue with Google'}
        </Text>
      </Pressable>

      {error && (
        <Text style={styles.error}>{error}</Text>
      )}

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>or</Text>
        <View style={styles.dividerLine} />
      </View>

      {/* Email Sign-In Form */}
      <EmailSignInForm onSubmit={handleEmailSignIn} loading={emailLoading} />

      <Pressable onPress={() => router.push('/(auth)/signup')}>
        <Text style={styles.link}>
          Don't have an account? <Text style={styles.linkBold}>Sign up</Text>
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 32,
    textAlign: 'center',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 12,
  },
  disabled: {
    opacity: 0.5,
  },
  error: {
    color: '#ef4444',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#6b7280',
    fontSize: 14,
  },
  link: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 24,
  },
  linkBold: {
    color: '#6366f1',
    fontWeight: '600',
  },
});
```

### Alternative: Native Google Sign-In

For better UX, use native Google Sign-In button:

```typescript
// src/hooks/useNativeGoogleAuth.ts
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { supabase } from '@/lib/supabase';

GoogleSignin.configure({
  webClientId: 'YOUR_WEB_CLIENT_ID', // From Google Cloud Console
  iosClientId: 'YOUR_IOS_CLIENT_ID',
});

export function useNativeGoogleAuth() {
  const [loading, setLoading] = useState(false);

  async function signInWithGoogle() {
    try {
      setLoading(true);

      // Check if device supports Google Play Services (Android)
      await GoogleSignin.hasPlayServices();

      // Get user info and ID token
      const userInfo = await GoogleSignin.signIn();
      const { idToken } = await GoogleSignin.getTokens();

      // Sign in to Supabase with ID token
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: idToken,
      });

      if (error) throw error;

      return {
        user: data.user,
        profile: userInfo.user,
      };
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  async function signOut() {
    try {
      await GoogleSignin.signOut();
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }

  return {
    signInWithGoogle,
    signOut,
    loading,
  };
}
```

## User Profile Creation

### Create Profile on First Sign-In

```typescript
// src/hooks/useGoogleAuth.ts (continued)
async function handleGoogleSignIn(idToken: string) {
  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: 'google',
    token: idToken,
  });

  if (error) throw error;

  // Check if profile exists
  const { data: existingProfile } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('user_id', data.user.id)
    .single();

  if (!existingProfile) {
    // Create profile with Google data
    await supabase
      .from('user_profiles')
      .insert({
        user_id: data.user.id,
        email: data.user.email,
        full_name: data.user.user_metadata.full_name,
        avatar_url: data.user.user_metadata.avatar_url,
      });
  }

  return {
    user: data.user,
    needsOnboarding: !existingProfile?.onboarding_completed_at,
  };
}
```

## Testing

### Test Google Sign-In Flow

1. **Development**:
   ```bash
   npx expo start
   # Scan QR with Expo Go app
   ```

2. **iOS Simulator** (limited):
   - Use Expo Go or development build
   - May require physical device for full testing

3. **Android Emulator**:
   - Ensure Play Services installed
   - Add test Google account

### Debug Common Issues

```typescript
// Add debug logging
async function signInWithGoogle() {
  console.log('[Google Auth] Starting sign-in...');
  
  try {
    const result = await promptAsync();
    console.log('[Google Auth] Response type:', result.type);
    
    if (result.type === 'success') {
      console.log('[Google Auth] ID Token:', result.authentication?.idToken?.substring(0, 20) + '...');
    }
  } catch (error) {
    console.error('[Google Auth] Error:', error);
  }
}
```

## Security Considerations

1. **Never expose Client Secret** in client code
2. **Validate ID tokens** on the server (Supabase handles this)
3. **Use HTTPS** for redirect URIs in production
4. **Rotate credentials** if compromised
5. **Request minimal scopes** (email, profile only)

## Production Checklist

- [ ] Add all authorized redirect URIs
- [ ] Submit OAuth consent screen for verification
- [ ] Test on physical iOS device
- [ ] Test on physical Android device
- [ ] Configure production credentials in Supabase
- [ ] Update app.json with production client IDs
- [ ] Test sign-in flow end-to-end
- [ ] Monitor sign-in errors in Supabase dashboard

## Troubleshooting

### "Invalid OAuth Client" Error

- Verify Bundle ID (iOS) matches Google Cloud
- Verify Package Name (Android) matches Google Cloud
- Check SHA-1 certificate fingerprint (Android)

### "Sign-in flow canceled"

- User canceled the flow (expected behavior)
- Handle gracefully in UI

### ID Token Validation Failed

- Check Web Client ID in Supabase matches Google Cloud
- Verify Client Secret is correct
- Check redirect URI is authorized

### Android Play Services Not Available

```typescript
try {
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
} catch (error) {
  console.error('Play Services not available:', error);
  // Fall back to email sign-in
}
```

## Next Steps

1. Create Google Cloud project
2. Configure OAuth consent screen
3. Create OAuth credentials (Web, iOS, Android)
4. Enable Google provider in Supabase
5. Implement Google sign-in in app
6. Test on both platforms
7. Submit for OAuth verification (production)

## References

- [Supabase Google OAuth Guide](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Expo Auth Session](https://docs.expo.dev/versions/latest/sdk/auth-session/)
- [React Native Google Sign-In](https://github.com/react-native-google-signin/google-signin)
- [Google Cloud Console](https://console.cloud.google.com)
- [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/)
