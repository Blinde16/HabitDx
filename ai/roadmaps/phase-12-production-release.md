# Phase 12: Production Release & Launch

**Date Created:** February 16, 2026  
**Phase Duration:** 3-5 days  
**Dependencies:** Phase 11 (Testing & QA)  
**Status:** Not Started

## Overview

Final phase to prepare HabitDx MVP for public release on iOS App Store and Google Play Store. This includes app store submissions, marketing assets, monitoring setup, and launch strategy.

## Goals

- Successfully submit to App Store and Play Store
- Pass app review on both platforms
- Launch with proper monitoring and analytics
- Create marketing presence
- Have support channels ready
- Execute launch strategy

## Success Criteria

- [ ] App approved on App Store
- [ ] App approved on Play Store
- [ ] Analytics and monitoring configured
- [ ] Marketing assets published
- [ ] Support email/system ready
- [ ] Launch announcement sent
- [ ] No critical issues in first 48 hours

## Pre-Launch Checklist

### 1. Final Code Preparation

- [ ] All P0 bugs fixed
- [ ] All P1 bugs documented (post-launch backlog)
- [ ] Code comments added for complex logic
- [ ] Remove debug logs and console statements
- [ ] Remove test data and mock functions
- [ ] Environment variables set for production
- [ ] API keys secured (not hardcoded)
- [ ] Version number finalized (1.0.0)

### 2. Build Configuration

```typescript
// app.json
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
    "ios": {
      "supportsTablet": false,
      "bundleIdentifier": "com.habitdx.app",
      "buildNumber": "1",
      "infoPlist": {
        "NSCameraUsageDescription": "HabitDx needs camera access for profile photos.",
        "NSPhotoLibraryUsageDescription": "HabitDx needs photo library access for profile photos."
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.habitdx.app",
      "versionCode": 1,
      "permissions": [
        "CAMERA",
        "NOTIFICATIONS",
        "READ_EXTERNAL_STORAGE"
      ]
    }
  }
}
```

Tasks:

- [ ] Update app.json with production config
- [ ] Set correct bundle identifiers
- [ ] Configure app permissions
- [ ] Set version and build numbers
- [ ] Test production build locally

### 3. App Store Assets

#### App Icon

- [ ] 1024x1024px icon (App Store)
- [ ] All required sizes generated
- [ ] iOS: 180x180, 120x120, etc.
- [ ] Android: adaptive icon layers
- [ ] No transparency, no rounded corners (iOS)
- [ ] Follows App Store design guidelines

#### Screenshots (Required for each device size)

**iOS:**

- [ ] 6.7" display (iPhone 15 Pro Max) - 1290x2796
- [ ] 6.5" display (iPhone 14 Plus) - 1242x2688
- [ ] 5.5" display (iPhone 8 Plus) - 1242x2208

**Android:**

- [ ] Phone - 1080x1920 or higher
- [ ] 7" tablet - 1200x1920
- [ ] 10" tablet - 1600x2560

Screenshot requirements:

- [ ] 5-10 screenshots per platform
- [ ] Show key features (onboarding, check-in, insights)
- [ ] Include captions/text overlays
- [ ] Highlight unique value proposition
- [ ] Follow platform guidelines

#### App Preview Videos (Optional but recommended)

- [ ] iOS: 15-30 seconds, .mov or .m4v
- [ ] Android: 30 seconds - 2 minutes, .mp4
- [ ] Show onboarding and core workflow
- [ ] Add music/voiceover (optional)
- [ ] No sound requirement (auto-plays muted)

### 4. Store Listing Content

#### App Store (iOS)

```
App Name: HabitDx
Subtitle: Evidence-Based Habit Building

Description:
Stop failing at habits. Start building sustainably.

HabitDx uses behavioral science to help you build habits that actually stick. Unlike other habit trackers, we:

✓ Analyze your past failures to identify what went wrong
✓ Generate a personalized habit stack designed for YOUR constraints
✓ Adapt weekly based on your actual behavior patterns
✓ Focus on sustainable progress, not perfection

KEY FEATURES:
• Smart Onboarding: We learn about your past failures, goals, and constraints to create a custom plan
• AI-Powered Failure Analysis: Understand your behavioral patterns and obstacles
• Personalized Habit Stack: Get 3-5 habits designed specifically for your life
• Weekly Iteration: AI adjusts your habits based on real performance data
• "Don't Miss Twice" Rule: One skip won't break your streak—we're realistic
• Science-Backed: Built on research from BJ Fogg, James Clear, and habit formation studies

WHO IT'S FOR:
If you've tried habit apps before and failed, HabitDx is different. We don't just track—we diagnose, adapt, and help you build sustainable change.

PRICING:
Free to use. Premium features coming soon.

Privacy: Your data stays yours. We don't sell or share personal information.

Keywords: habit tracker, habit building, behavior change, productivity, self improvement, goal setting, daily routine, streak tracker, habit stacking
```

Tasks:

- [ ] Write compelling app description
- [ ] Add keywords for App Store search
- [ ] Define app category (Health & Fitness / Productivity)
- [ ] Set age rating (4+)
- [ ] Add promotional text (170 characters)
- [ ] Add support URL
- [ ] Add privacy policy URL

#### Google Play Store (Android)

Similar content with Play Store formatting:

- [ ] Short description (80 characters)
- [ ] Full description (4000 characters max)
- [ ] Category selection
- [ ] Content rating questionnaire
- [ ] Privacy policy URL
- [ ] Support email address

### 5. Legal Documents

#### Privacy Policy

Required by both stores:

```markdown
# Privacy Policy for HabitDx

Last Updated: February 16, 2026

## Information We Collect

- Email address and password (for authentication)
- Habit check-in data
- Onboarding responses
- Usage analytics (anonymized)

## How We Use Your Data

- To provide and improve the app
- To generate personalized insights
- To send weekly iteration notifications

## Data Sharing

We do not sell or share your personal data with third parties.

## Data Storage

Your data is securely stored using Supabase with encryption at rest and in transit.

## Your Rights

- Request data export
- Request data deletion
- Opt out of analytics

## Contact

privacy@habitdx.com
```

Tasks:

- [ ] Write comprehensive privacy policy
- [ ] Host on website or GitHub Pages
- [ ] Add link to app stores
- [ ] Ensure GDPR/CCPA compliance

#### Terms of Service

```markdown
# Terms of Service

Last Updated: February 16, 2026

## Acceptance of Terms

By using HabitDx, you agree to these terms.

## Use License

Personal, non-commercial use only.

## User Data

You retain ownership of your data.

## Disclaimer

HabitDx is for informational purposes. Not medical advice.

## Limitation of Liability

We are not liable for any damages arising from use of the app.

## Changes

We may update these terms. Continued use constitutes acceptance.

## Contact

support@habitdx.com
```

Tasks:

- [ ] Write terms of service
- [ ] Host publicly
- [ ] Link in app footer/settings

### 6. Production Infrastructure

#### Supabase Production Setup

- [ ] Create production Supabase project
- [ ] Run migrations on production database
- [ ] Configure RLS policies
- [ ] Set up database backups (automatic)
- [ ] Configure rate limiting
- [ ] Set up monitoring alerts
- [ ] Test Edge Functions in production

#### Environment Configuration

```bash
# .env.production
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
OPENAI_API_KEY=sk-xxx # server-side only
SENTRY_DSN=https://xxx@sentry.io/xxx
```

Tasks:

- [ ] Set production environment variables
- [ ] Never commit .env files
- [ ] Use Expo Secrets for sensitive data
- [ ] Test production API connections

#### Analytics Setup

**Option 1: Expo Analytics (Simple)**

```typescript
import * as Analytics from 'expo-analytics';

Analytics.logEvent('habit_checked_in', {
  habitId: habit.id,
  timestamp: new Date().toISOString(),
});
```

**Option 2: Mixpanel or Amplitude (Advanced)**

```typescript
import { track } from '@/lib/analytics';

track('Habit Checked In', {
  habitId: habit.id,
  habitName: habit.name,
  streakLength: habit.currentStreak,
});
```

Events to track:

- [ ] User signed up
- [ ] Onboarding completed
- [ ] Habit checked in
- [ ] Habit skipped
- [ ] Weekly insight generated
- [ ] Weekly insight accepted
- [ ] Habit stack adjusted
- [ ] App opened (daily active users)
- [ ] Notification received/opened

Tasks:

- [ ] Choose analytics provider
- [ ] Implement tracking calls
- [ ] Create analytics dashboard
- [ ] Set up funnels (signup → onboarding → first check-in)
- [ ] Track retention metrics

#### Error Monitoring

**Sentry Setup:**

```bash
npx expo install @sentry/react-native
```

```typescript
// app/_layout.tsx
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'https://xxx@sentry.io/xxx',
  enableInExpoDevelopment: false,
  debug: false,
});
```

Tasks:

- [ ] Set up Sentry account
- [ ] Install Sentry SDK
- [ ] Configure error reporting
- [ ] Test error capture
- [ ] Set up alerts for critical errors

#### Performance Monitoring

**Sentry Performance:**

```typescript
const transaction = Sentry.startTransaction({
  name: 'Load Home Screen',
});

// ... screen loads ...

transaction.finish();
```

**React Native Performance:**

```typescript
import { Performance } from '@react-native-community/performance';

const mark = Performance.mark('habit-check-in-start');
// ... check-in logic ...
Performance.measure('habit-check-in', 'habit-check-in-start');
```

Tasks:

- [ ] Track screen load times
- [ ] Track API response times
- [ ] Track animation frame rates
- [ ] Set performance budgets

## App Store Submission

### iOS App Store (Apple)

#### 1. Apple Developer Account

- [ ] Enroll in Apple Developer Program ($99/year)
- [ ] Verify payment and identity
- [ ] Set up two-factor authentication

#### 2. App Store Connect Setup

- [ ] Create new app in App Store Connect
- [ ] Set bundle ID (com.habitdx.app)
- [ ] Set app name (HabitDx)
- [ ] Choose primary category (Health & Fitness)
- [ ] Set content rights (you own the content)

#### 3. Build for App Store

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure EAS Build
eas build:configure

# Create production build for iOS
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios
```

Tasks:

- [ ] Create production build with EAS
- [ ] Upload build to App Store Connect
- [ ] Fill out App Store listing
- [ ] Add screenshots and videos
- [ ] Add app description and keywords
- [ ] Set pricing (Free)
- [ ] Submit for review

#### 4. App Review Preparation

Apple will test:

- [ ] App doesn't crash
- [ ] All features work as described
- [ ] No broken links
- [ ] Privacy policy accessible
- [ ] In-app purchases work (if any)
- [ ] Push notifications work (opt-in required)

**Common Rejection Reasons:**

- Incomplete information in store listing
- App crashes on launch
- Features don't match description
- Missing privacy policy
- Requesting unnecessary permissions

**Review Time:** 24-48 hours typically

#### 5. Beta Testing via TestFlight

Before submission:

- [ ] Upload build to TestFlight
- [ ] Invite internal testers (team)
- [ ] Fix any critical issues
- [ ] Invite external testers (beta users)
- [ ] Collect final feedback

### Google Play Store (Android)

#### 1. Google Play Console Account

- [ ] Create Google Play Developer account ($25 one-time)
- [ ] Verify identity and payment
- [ ] Set up merchant account (if selling)

#### 2. Create App Listing

- [ ] Create new app in Play Console
- [ ] Set app name (HabitDx)
- [ ] Set default language (English - United States)
- [ ] Choose app or game (App)
- [ ] Choose free or paid (Free)

#### 3. Build for Play Store

```bash
# Create production build for Android
eas build --platform android --profile production

# Submit to Google Play
eas submit --platform android
```

Tasks:

- [ ] Generate signed AAB (Android App Bundle)
- [ ] Upload to Play Console
- [ ] Fill out store listing
- [ ] Add screenshots (all device sizes)
- [ ] Add app description
- [ ] Complete content rating questionnaire
- [ ] Set up countries for distribution
- [ ] Submit for review

#### 4. Play Store Review

Google reviews:

- [ ] App policy compliance
- [ ] Content rating accuracy
- [ ] Privacy policy accessible
- [ ] Permissions justified
- [ ] No malware or deceptive behavior

**Review Time:** Usually 1-7 days

#### 5. Internal Testing Track

Before production:

- [ ] Upload to Internal Testing track
- [ ] Test with team
- [ ] Graduate to Closed Testing (alpha/beta)
- [ ] Invite beta testers
- [ ] Finally promote to Production

## Marketing & Launch Strategy

### 1. Landing Page

Create simple website (optional but recommended):

```
https://habitdx.com
- Hero: "Stop Failing at Habits. Start Building Sustainably."
- Features overview
- Screenshots
- App Store badges (download links)
- Privacy policy link
- Support email
```

Tools:

- [ ] Use Vercel/Netlify for hosting (free)
- [ ] Build with Next.js or simple HTML/CSS
- [ ] Add App Store badges
- [ ] Include screenshots
- [ ] SEO optimization

### 2. Social Media Presence

**Twitter/X:**

```
@habitdx
Bio: Evidence-based habit building. Analyze your failures. Build sustainable habits.
```

**Instagram:**

```
@habitdx
Visual content: screenshots, tips, user wins
```

**LinkedIn:**

```
Company page for HabitDx
Professional audience, productivity focus
```

Tasks:

- [ ] Create social media accounts
- [ ] Design profile images
- [ ] Write bio/descriptions
- [ ] Prepare launch content
- [ ] Schedule posts for launch week

### 3. Launch Announcement

**Email (if you have list):**

```
Subject: HabitDx is Live! 🎉

We've launched HabitDx on iOS and Android!

After months of building, testing, and iterating, we're excited to share HabitDx with you.

[Download on App Store] [Get it on Google Play]

What makes HabitDx different:
- Learns from your past failures
- Personalizes habits to YOUR life
- Adapts weekly based on real data
- No perfection required ("Don't Miss Twice" rule)

Try it free today and let us know what you think!

- The HabitDx Team
```

**Social Media Post:**

```
🎉 HabitDx is LIVE!

Stop failing at habits. Start building sustainably.

Unlike other trackers, HabitDx:
✓ Analyzes your past failures
✓ Creates personalized habit stacks
✓ Adapts weekly to your behavior
✓ Focuses on progress, not perfection

Download free today! 👇
[App Store Link]
[Play Store Link]

#HabitDx #HabitTracker #Productivity #BehaviorChange
```

**Product Hunt (Optional):**

- [ ] Create Product Hunt listing
- [ ] Schedule launch for weekday morning
- [ ] Prepare responses to comments
- [ ] Ask friends/beta users to upvote

**Reddit (Be careful - no spam):**

Relevant subreddits:

- r/productivity
- r/getdisciplined
- r/DecidingToBeBetter
- r/Habits

Format: "I built an app that analyzes why you fail at habits"

- [ ] Write genuine post (not salesy)
- [ ] Be transparent about being the creator
- [ ] Provide value in post itself
- [ ] Engage with comments authentically

### 4. App Store Optimization (ASO)

**iOS Keywords:**

Primary: habit tracker, habit building, behavior change
Secondary: productivity, self improvement, goal tracker, routine tracker

**Android Keywords:**

Similar, but include more long-tail keywords in description

**Tips:**

- [ ] Research competitor keywords
- [ ] Use all 100 characters for iOS keywords
- [ ] Include keywords naturally in description
- [ ] Encourage reviews/ratings
- [ ] Update keywords based on performance

### 5. Launch Week Schedule

**Day 0 (Pre-launch):**

- [ ] Final checks, all green
- [ ] Team ready to respond to issues
- [ ] Support email monitored

**Day 1 (Launch Day):**

- [ ] Send launch email (if list exists)
- [ ] Post on Twitter/X, Instagram, LinkedIn
- [ ] Submit to Product Hunt (if applicable)
- [ ] Post on Reddit (carefully)
- [ ] Monitor analytics and errors

**Day 2-3:**

- [ ] Respond to all feedback
- [ ] Fix any critical bugs immediately
- [ ] Share user testimonials
- [ ] Post tips/content

**Day 4-7:**

- [ ] Review analytics
- [ ] Identify bottlenecks (signup → onboarding → retention)
- [ ] Plan first update
- [ ] Engage with early users

## Post-Launch Monitoring

### 1. Critical Metrics (First 48 Hours)

- [ ] App crashes: Should be 0%
- [ ] Signup success rate: >90%
- [ ] Onboarding completion rate: >70%
- [ ] First check-in rate: >50%
- [ ] API error rate: <1%

### 2. Daily Metrics (First Week)

- [ ] Daily active users (DAU)
- [ ] New signups per day
- [ ] Retention rate (D1, D3, D7)
- [ ] Average check-ins per user
- [ ] Weekly insight generation rate
- [ ] App Store ratings/reviews

### 3. Monitoring Dashboards

**Sentry Dashboard:**

- [ ] Error frequency
- [ ] Error types (categorized)
- [ ] Affected users
- [ ] Stack traces

**Analytics Dashboard:**

- [ ] User funnels
- [ ] Feature usage
- [ ] Session length
- [ ] Retention cohorts

**App Store Dashboard:**

- [ ] Daily downloads
- [ ] Ratings (average, breakdown)
- [ ] Reviews (read all!)
- [ ] Keyword rankings

### 4. On-Call Plan

**Critical Issues (respond immediately):**

- App-wide crashes
- Authentication broken
- Data loss
- Security vulnerability

**High Priority (respond within 4 hours):**

- Feature broken for all users
- API downtime
- Poor performance

**Medium Priority (respond within 24 hours):**

- Edge case bugs
- Confusing UX
- Feature requests

**Team Rotation:**

- [ ] Designate on-call person(s)
- [ ] Set up alerts (Sentry, Supabase)
- [ ] Document response procedures

## Support System

### 1. Support Email

- [ ] Create support@habitdx.com
- [ ] Set up auto-reply (we'll respond within 24 hours)
- [ ] Create email templates for common issues
- [ ] Monitor daily

### 2. In-App Support

- [ ] Add "Help & Support" in settings
- [ ] Link to FAQ page
- [ ] Provide support email
- [ ] Optionally: add in-app chat (Intercom, etc.)

### 3. FAQ Page

Common questions:

**Q: How do I reset my password?**
A: Tap "Forgot Password" on the login screen.

**Q: Can I edit my habit stack?**
A: Yes! Go to Settings > Manage Habits.

**Q: Why didn't I get my weekly insight?**
A: Insights generate on Sundays if you have 5+ check-ins that week.

**Q: How do I delete my account?**
A: Go to Settings > Account > Delete Account. This is permanent.

**Q: Is my data private?**
A: Yes. We don't sell or share your data. See our Privacy Policy.

Tasks:

- [ ] Write comprehensive FAQ
- [ ] Host on website or GitHub
- [ ] Link from app and store listings

### 4. Handling Negative Reviews

**Process:**

1. Respond publicly (shows you care)
2. Apologize and acknowledge issue
3. Offer to help (provide support email)
4. Fix the issue
5. Follow up with user

**Example Response:**

```
Hi [Name], thank you for the feedback. We're sorry you experienced [issue]. We'd love to help—please email us at support@habitdx.com with more details. We're constantly improving HabitDx and your input is valuable!
```

## Rollback Plan

If critical issues arise:

### 1. Quick Fixes

- [ ] Deploy hotfix within 2 hours
- [ ] Test quickly but thoroughly
- [ ] Submit expedited review (if possible)
- [ ] Communicate with users

### 2. Feature Flags

Use feature flags to disable broken features:

```typescript
// featureFlags.ts
export const WEEKLY_ITERATION_ENABLED = true;

// In code
if (WEEKLY_ITERATION_ENABLED) {
  // ... feature logic
}
```

- [ ] Implement feature flags for major features
- [ ] Disable remotely via Supabase config
- [ ] No app update required

### 3. Full Rollback

Last resort:

- [ ] Remove app from store temporarily
- [ ] Fix critical issue
- [ ] Test extensively
- [ ] Re-submit

## Success Metrics (First Month)

### Minimum Viable Success:

- [ ] 100+ downloads
- [ ] 4.0+ star rating (both stores)
- [ ] 30% D7 retention rate
- [ ] 50% onboarding completion rate
- [ ] <0.1% crash rate

### Stretch Goals:

- [ ] 500+ downloads
- [ ] 4.5+ star rating
- [ ] 40% D7 retention rate
- [ ] Featured by App Store (unlikely but possible)
- [ ] Positive blog/media mention

## Post-Launch Roadmap

### Immediate (Week 1-2):

- [ ] Fix any critical bugs
- [ ] Respond to all user feedback
- [ ] Improve onboarding based on drop-off data

### Short-term (Month 1):

- [ ] Add most-requested feature (based on feedback)
- [ ] Improve habit generation algorithm
- [ ] Optimize for retention

### Medium-term (Month 2-3):

- [ ] Launch premium features (if planned)
- [ ] Add social features (optional)
- [ ] Improve AI insights quality
- [ ] Internationalization (i18n) - support more languages

### Long-term (Month 4+):

- [ ] Build community features
- [ ] Partner with influencers
- [ ] Expand marketing efforts
- [ ] Consider funding/monetization strategy

## Deliverables

1. **App Store Presence**
   - App approved on iOS App Store
   - App approved on Google Play Store
   - Professional store listings
   - Marketing assets live

2. **Production Infrastructure**
   - Supabase production project
   - Analytics configured
   - Error monitoring active
   - Backups enabled

3. **Legal Compliance**
   - Privacy policy published
   - Terms of service published
   - GDPR/CCPA compliant

4. **Support System**
   - Support email active
   - FAQ page live
   - Response process documented

5. **Launch Execution**
   - Launch announcement sent
   - Social media active
   - Landing page live (optional)
   - Monitoring dashboards ready

## Final Launch Checklist

### T-1 Week (One Week Before Launch)

- [ ] All code frozen (no new features)
- [ ] Final QA testing completed
- [ ] Store listings prepared
- [ ] Marketing assets ready
- [ ] Support systems tested
- [ ] Team briefed on launch plan

### T-3 Days

- [ ] Beta testing completed
- [ ] All feedback addressed
- [ ] Production builds created
- [ ] Store submissions uploaded
- [ ] Awaiting approval

### T-1 Day

- [ ] Apps approved on both stores
- [ ] Analytics dashboards verified
- [ ] Error monitoring active
- [ ] Support email ready
- [ ] Launch announcement drafted

### Launch Day (T-0)

- [ ] Set apps to "Available" in stores
- [ ] Send launch announcement
- [ ] Post on social media
- [ ] Monitor analytics closely
- [ ] Respond to early users
- [ ] Celebrate! 🎉

### T+1 Day

- [ ] Review first 24 hours data
- [ ] Address any issues
- [ ] Respond to reviews
- [ ] Adjust marketing if needed

### T+7 Days

- [ ] Review first week metrics
- [ ] Plan first update
- [ ] Thank early adopters
- [ ] Iterate based on feedback

## Risks & Mitigations

| Risk                   | Likelihood | Impact | Mitigation                                         |
| ---------------------- | ---------- | ------ | -------------------------------------------------- |
| App Store rejection    | Medium     | High   | Follow guidelines closely, submit early for review |
| Critical bug at launch | Low        | High   | Extensive testing, feature flags, rollback plan    |
| Low downloads          | Medium     | Medium | ASO optimization, organic marketing, word-of-mouth |
| Negative reviews       | Low        | Medium | Respond quickly, fix issues, engage users          |
| Server overload        | Low        | High   | Supabase scales automatically, monitor closely     |

## Notes

- Launch is just the beginning—expect iteration
- First week is critical for retention
- Listen to early users carefully
- Don't panic if downloads are slow initially
- Focus on building a small, engaged user base first
- Celebrate the launch with your team! 🎉

## Resources

- [Apple App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Policy Center](https://support.google.com/googleplay/android-developer/answer/9858738)
- [EAS Submit Documentation](https://docs.expo.dev/submit/introduction/)
- [App Store Connect Help](https://developer.apple.com/help/app-store-connect/)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer)
- [Sentry React Native Docs](https://docs.sentry.io/platforms/react-native/)
