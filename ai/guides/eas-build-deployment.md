# EAS Build & Deployment Guide

## Overview

EAS (Expo Application Services) Build is a cloud service for building iOS and Android app binaries. This guide covers setup, configuration, and deployment workflows for HabitDx.

## Why EAS Build?

- **No local setup** - No Xcode or Android Studio required
- **Consistent builds** - Same environment every time
- **Faster iteration** - Build in the cloud while you keep coding
- **OTA Updates** - Push updates without app store review
- **Built-in CI/CD** - Integration with GitHub Actions

## Prerequisites

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo account
eas login

# Link project
eas init
```

## Project Configuration

### eas.json

```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": false,
        "resourceClass": "m-medium"
      },
      "android": {
        "buildType": "apk",
        "gradleCommand": ":app:assembleRelease"
      }
    },
    "production": {
      "distribution": "store",
      "ios": {
        "resourceClass": "m-medium"
      },
      "android": {
        "buildType": "aab",
        "gradleCommand": ":app:bundleRelease"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-email@example.com",
        "ascAppId": "1234567890",
        "appleTeamId": "ABCDEFGHIJ"
      },
      "android": {
        "serviceAccountKeyPath": "./google-service-account.json",
        "track": "internal"
      }
    }
  }
}
```

## iOS Setup

### Apple Developer Account

1. **Create Apple Developer Account**
   - Go to https://developer.apple.com
   - Sign up ($99/year)
   - Accept license agreement

2. **Create App ID**

   ```bash
   # EAS will handle this automatically, but you can do it manually:
   # 1. Go to Apple Developer Console
   # 2. Certificates, Identifiers & Profiles
   # 3. Identifiers → App IDs
   # 4. Create new: com.habitdx.app
   ```

3. **Configure App Store Connect**
   - Go to https://appstoreconnect.apple.com
   - Create new app
   - Bundle ID: `com.habitdx.app`
   - App name: HabitDx

### Generate Credentials

```bash
# EAS will prompt you to generate credentials
eas build --platform ios --profile production

# Or generate credentials manually
eas credentials
```

### app.json iOS Configuration

```json
{
  "expo": {
    "ios": {
      "supportsTablet": false,
      "bundleIdentifier": "com.habitdx.app",
      "buildNumber": "1.0.0",
      "infoPlist": {
        "UIBackgroundModes": ["remote-notification"],
        "NSUserTrackingUsageDescription": "We use tracking to improve your experience and measure app performance."
      },
      "config": {
        "googleSignIn": {
          "reservedClientId": "YOUR_IOS_CLIENT_ID"
        }
      }
    }
  }
}
```

## Android Setup

### Google Play Console

1. **Create Google Play Developer Account**
   - Go to https://play.google.com/console
   - Sign up ($25 one-time)
   - Accept agreements

2. **Create App**
   - Create new app
   - App name: HabitDx
   - Package name: `com.habitdx.app`

3. **Create Service Account** (for automated uploads)
   ```bash
   # Follow Google's guide:
   # 1. Google Cloud Console → IAM & Admin → Service Accounts
   # 2. Create service account
   # 3. Grant "Service Account User" role
   # 4. Create JSON key
   # 5. Save as google-service-account.json
   ```

### Generate Keystore

```bash
# EAS handles this automatically
eas build --platform android --profile production

# Or create manually
eas credentials
```

### app.json Android Configuration

```json
{
  "expo": {
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.habitdx.app",
      "versionCode": 1,
      "permissions": ["RECEIVE_BOOT_COMPLETED", "VIBRATE", "SCHEDULE_EXACT_ALARM"],
      "config": {
        "googleSignIn": {
          "apiKey": "YOUR_ANDROID_API_KEY",
          "certificateHash": "YOUR_SHA1_CERTIFICATE_HASH"
        }
      }
    }
  }
}
```

## Build Profiles

### Development Build

For internal testing with dev tools:

```bash
# Build for iOS simulator (Mac only)
eas build --profile development --platform ios

# Build for Android emulator
eas build --profile development --platform android

# Install on device
npx expo start --dev-client
```

### Preview Build

For internal testing (TestFlight, internal track):

```bash
# iOS (TestFlight)
eas build --profile preview --platform ios

# Android (APK for direct install)
eas build --profile preview --platform android
```

### Production Build

For app store submission:

```bash
# iOS (App Store)
eas build --profile production --platform ios

# Android (Google Play)
eas build --profile production --platform android

# Both platforms
eas build --profile production --platform all
```

## Environment Variables

### Secrets Management

```bash
# Add secret (e.g., API keys)
eas secret:create --scope project --name OPENAI_API_KEY --value sk-proj-...

# List secrets
eas secret:list

# Delete secret
eas secret:delete --name OPENAI_API_KEY
```

### Environment-Specific Configs

```json
// eas.json
{
  "build": {
    "production": {
      "env": {
        "EXPO_PUBLIC_ENVIRONMENT": "production",
        "EXPO_PUBLIC_API_URL": "https://api.habitdx.com"
      }
    },
    "preview": {
      "env": {
        "EXPO_PUBLIC_ENVIRONMENT": "staging",
        "EXPO_PUBLIC_API_URL": "https://staging-api.habitdx.com"
      }
    }
  }
}
```

## Version Management

### Update Version Numbers

```json
// app.json
{
  "expo": {
    "version": "1.0.1", // User-facing version
    "ios": {
      "buildNumber": "1.0.1" // iOS build number
    },
    "android": {
      "versionCode": 2 // Android version code (integer)
    }
  }
}
```

### Automated Versioning

```bash
# Use expo-env-info to automate
npm install -g expo-cli

# Bump version
expo publish --release-channel production
```

### Version Script

```json
// package.json
{
  "scripts": {
    "version:patch": "npm version patch && node scripts/sync-version.js",
    "version:minor": "npm version minor && node scripts/sync-version.js",
    "version:major": "npm version major && node scripts/sync-version.js"
  }
}
```

```javascript
// scripts/sync-version.js
const fs = require('fs');
const appJson = require('../app.json');
const packageJson = require('../package.json');

appJson.expo.version = packageJson.version;
appJson.expo.android.versionCode += 1;
appJson.expo.ios.buildNumber = packageJson.version;

fs.writeFileSync('./app.json', JSON.stringify(appJson, null, 2));
console.log(`Synced version to ${packageJson.version}`);
```

## Submission to App Stores

### iOS App Store

```bash
# Build and submit automatically
eas submit --platform ios --latest

# Or manually
# 1. Download .ipa from EAS build dashboard
# 2. Upload to App Store Connect via Transporter app
# 3. Fill out app metadata
# 4. Submit for review
```

### Google Play Store

```bash
# Build and submit automatically
eas submit --platform android --latest

# Or manually
# 1. Download .aab from EAS build dashboard
# 2. Upload to Google Play Console
# 3. Fill out store listing
# 4. Submit for review
```

### App Store Metadata

```
App Name: HabitDx

Subtitle: Diagnose why your habits fail

Description:
HabitDx helps you understand why your habits fail and gives you weekly adjustments to fix them. Unlike generic tracking apps, HabitDx analyzes YOUR patterns and delivers personalized insights every week.

• 5-minute smart intake
• AI-powered failure diagnosis
• Personalized tiny habits
• Weekly adjustments based on your data
• No shame, just systems

Stop blaming yourself. Start fixing your system.

Keywords: habits, productivity, self-improvement, goals, tracking

Support URL: https://habitdx.com/support
Privacy Policy: https://habitdx.com/privacy
```

## Over-The-Air (OTA) Updates

### EAS Update Setup

```bash
# Install EAS Update
npx expo install expo-updates

# Configure
eas update:configure
```

### eas.json Update Configuration

```json
{
  "build": {
    "production": {
      "channel": "production"
    },
    "preview": {
      "channel": "preview"
    }
  }
}
```

### Publish Update

```bash
# Publish to production channel
eas update --branch production --message "Fix: Habit check-in bug"

# Publish to preview channel
eas update --branch preview --message "Test: New UI"
```

### Limitations

OTA updates can update:

- JavaScript code
- Assets (images, fonts)
- React Native components

OTA updates **cannot** update:

- Native code changes
- Dependencies requiring native builds
- App permissions

## CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/eas-build.yml
name: EAS Build

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Install dependencies
        run: npm ci

      - name: Setup Expo
        uses: expo/expo-github-action@v8
        with:
          expo-version: latest
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}

      - name: Build iOS
        run: eas build --platform ios --profile production --non-interactive

      - name: Build Android
        run: eas build --platform android --profile production --non-interactive
```

### Automated Submission

```yaml
# .github/workflows/eas-submit.yml
name: Submit to Stores

on:
  release:
    types: [published]

jobs:
  submit:
    runs-on: ubuntu-latest
    steps:
      - uses: expo/expo-github-action@v8
        with:
          expo-version: latest
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}

      - name: Submit iOS
        run: eas submit --platform ios --latest

      - name: Submit Android
        run: eas submit --platform android --latest
```

## Beta Testing

### TestFlight (iOS)

```bash
# Build and submit to TestFlight
eas build --profile preview --platform ios
eas submit --platform ios --latest

# Add testers in App Store Connect
# Testers receive email invitation
```

### Google Play Internal Testing (Android)

```bash
# Build and submit to internal track
eas build --profile preview --platform android
eas submit --platform android --track internal

# Add testers in Google Play Console
# Testers receive email invitation
```

## Build Monitoring

### Check Build Status

```bash
# List builds
eas build:list

# View specific build
eas build:view [BUILD_ID]

# Cancel build
eas build:cancel [BUILD_ID]
```

### Build Webhooks

```bash
# Configure webhook for build notifications
eas webhook:create \
  --event BUILD \
  --url https://your-server.com/webhook \
  --secret your-webhook-secret
```

## Troubleshooting

### Build Failed

1. Check build logs in EAS dashboard
2. Common issues:
   - Missing credentials
   - Invalid bundle identifier
   - Dependency conflicts
   - Native module issues

### Credentials Issues

```bash
# Reset credentials
eas credentials --platform ios
# Select "Remove credentials"

# Regenerate
eas build --platform ios --profile production
```

### OTA Update Not Applied

1. Check app version matches update channel
2. Verify device has internet connection
3. Force check for updates:

```typescript
// src/lib/updates.ts
import * as Updates from 'expo-updates';

export async function checkForUpdates() {
  try {
    const update = await Updates.checkForUpdateAsync();
    if (update.isAvailable) {
      await Updates.fetchUpdateAsync();
      await Updates.reloadAsync();
    }
  } catch (error) {
    console.error('Update check failed:', error);
  }
}
```

## Cost Estimation

### EAS Build Pricing (as of 2024)

| Plan       | Cost   | Builds/Month | Best For        |
| ---------- | ------ | ------------ | --------------- |
| Free       | $0     | 30           | Development     |
| Production | $29/mo | Unlimited    | Production apps |
| Enterprise | Custom | Unlimited    | Large teams     |

### Optimization Tips

1. Use `preview` profile for beta testing (counts toward quota)
2. Build only when necessary (use OTA for small updates)
3. Share builds with team instead of building individually

## Release Checklist

### Pre-Build

- [ ] Update version numbers (app.json)
- [ ] Test on physical devices (iOS + Android)
- [ ] Update CHANGELOG.md
- [ ] Create release notes
- [ ] Update environment variables
- [ ] Review app permissions

### Build & Submit

- [ ] Create production build
- [ ] Test build on physical devices
- [ ] Submit to App Store / Google Play
- [ ] Upload screenshots and metadata
- [ ] Submit for review

### Post-Release

- [ ] Monitor crash reports
- [ ] Check analytics for errors
- [ ] Respond to user reviews
- [ ] Prepare hotfix if needed

## Next Steps

1. Set up EAS account
2. Configure eas.json
3. Generate iOS and Android credentials
4. Create preview builds for testing
5. Set up TestFlight and Google Play internal testing
6. Configure CI/CD pipeline
7. Plan production release

## References

- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [EAS Submit Documentation](https://docs.expo.dev/submit/introduction/)
- [EAS Update Documentation](https://docs.expo.dev/eas-update/introduction/)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Developer Policy](https://play.google.com/about/developer-content-policy/)
