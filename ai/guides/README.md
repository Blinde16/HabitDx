# HabitDx Technical Integration Guides

This folder contains comprehensive technical guides for all major integrations in the HabitDx project. Each guide provides setup instructions, code examples, best practices, and troubleshooting tips.

## Available Guides

### Core Infrastructure

#### [Supabase Integration](./supabase-integration.md)
Complete backend setup including authentication, database, Edge Functions, and real-time subscriptions.

**When to use**: Setting up the backend, configuring database schema, implementing auth, deploying Edge Functions.

**Key Topics**:
- Database schema and migrations
- Row Level Security (RLS) policies
- Authentication (email + OAuth)
- Edge Functions deployment
- Real-time subscriptions
- Cron jobs

---

#### [OpenAI Integration](./openai-integration.md)
AI-powered features using GPT-4o-mini for failure analysis, habit generation, and weekly iterations.

**When to use**: Implementing AI features, optimizing prompts, managing costs, handling AI responses.

**Key Topics**:
- Failure Profile analysis
- Habit Stack generation
- Weekly Iteration insights
- Prompt engineering
- Cost optimization
- Error handling and fallbacks

---

### Frontend & Mobile

#### [Expo & React Native Setup](./expo-react-native-setup.md)
Complete mobile app setup with Expo Router, state management, and UI components.

**When to use**: Initializing the project, setting up navigation, building components, configuring TypeScript.

**Key Topics**:
- Project initialization
- Folder structure
- Expo Router setup
- Zustand state management
- Component library
- TypeScript configuration
- Environment variables

---

#### [Push Notifications](./push-notifications.md)
Daily habit reminders using Expo Notifications with smart scheduling and user controls.

**When to use**: Setting up reminders, scheduling notifications, implementing notification settings.

**Key Topics**:
- Permission requests
- Notification scheduling
- Smart default timing
- Deep linking
- User controls
- iOS and Android configuration

---

### Authentication

#### [Google OAuth Integration](./google-oauth-integration.md)
Google Sign-In implementation using Supabase Auth and Expo.

**When to use**: Adding social authentication, reducing signup friction, implementing OAuth flow.

**Key Topics**:
- Google Cloud Platform setup
- OAuth credentials configuration
- Supabase provider setup
- Native Google Sign-In
- Profile creation
- Security considerations

---

### AI Framework

#### [Mastra AI Integration](./mastra-ai-integration.md)
TypeScript agent framework for orchestrating AI features with workflows, memory, and tool-equipped agents.

**When to use**: Replacing Edge Function AI calls with structured workflows, adding persistent user memory, building a conversational habit coach.

**Key Topics**:
- Agents (failure analyst, iteration coach, habit coach)
- Workflows (multi-step failure analysis, weekly iteration)
- Memory (working memory, semantic recall)
- Supabase tools integration
- Deployment (Vercel, standalone)
- Migration from Edge Functions

---

### Analytics & Monitoring

#### [Analytics Integration](./analytics-integration.md)
User behavior tracking and metrics using PostHog (or Mixpanel/Amplitude).

**When to use**: Tracking events, measuring retention, analyzing user behavior, A/B testing.

**Key Topics**:
- Event tracking
- User identification
- Key metrics (Insight Flywheel validation)
- Funnel analysis
- Cohort analysis
- Feature flags for A/B testing
- Privacy and GDPR compliance

---

### Deployment

#### [EAS Build & Deployment](./eas-build-deployment.md)
Building and deploying iOS/Android apps using Expo Application Services.

**When to use**: Creating builds, submitting to app stores, managing versions, implementing CI/CD.

**Key Topics**:
- iOS and Android setup
- Build profiles (development, preview, production)
- App Store / Google Play submission
- Over-the-air (OTA) updates
- CI/CD with GitHub Actions
- Version management
- Beta testing (TestFlight, internal track)

---

## Quick Start by Phase

### Phase 1: Foundation
1. [Expo & React Native Setup](./expo-react-native-setup.md) - Initialize project
2. [Supabase Integration](./supabase-integration.md) - Set up backend
3. [Google OAuth Integration](./google-oauth-integration.md) - Add social auth

### Phase 2-3: Core Features
1. [OpenAI Integration](./openai-integration.md) - Implement AI features
2. [Push Notifications](./push-notifications.md) - Add habit reminders

### Phase 4-5: Growth & Iteration
1. [Mastra AI Integration](./mastra-ai-integration.md) - Structured AI workflows
2. [Analytics Integration](./analytics-integration.md) - Track metrics
3. [EAS Build & Deployment](./eas-build-deployment.md) - Deploy to stores

## Integration Dependencies

```mermaid
graph TD
    A[Expo Setup] --> B[Supabase]
    B --> C[Google OAuth]
    B --> D[OpenAI Edge Functions]
    B --> H[Mastra AI]
    D -.->|migrates to| H
    A --> E[Push Notifications]
    A --> F[Analytics]
    A --> G[EAS Build]
    B --> G
```

## Environment Variables Checklist

Ensure these are configured across all integrations:

```bash
# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...

# Supabase Secrets (Edge Functions only)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
OPENAI_API_KEY=sk-proj-...

# Google OAuth
GOOGLE_WEB_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_IOS_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_ANDROID_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_EXPO_CLIENT_ID=xxxxx.apps.googleusercontent.com

# Analytics
EXPO_PUBLIC_POSTHOG_API_KEY=phc_...
# OR
EXPO_PUBLIC_MIXPANEL_TOKEN=xxxxx

# Mastra AI Server
EXPO_PUBLIC_MASTRA_URL=http://localhost:4111
SUPABASE_DB_CONNECTION_STRING=postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres

# App Config
EXPO_PUBLIC_ENVIRONMENT=development|staging|production
EXPO_PUBLIC_APP_VERSION=1.0.0
```

## Common Integration Patterns

### API Call Pattern
```typescript
// 1. Call from component
const result = await apiFunction();

// 2. API function calls Supabase Edge Function
const { data } = await supabase.functions.invoke('function-name', { body });

// 3. Edge Function calls OpenAI
const completion = await openai.chat.completions.create({...});

// 4. Store result in Supabase
await supabase.from('table').insert(data);

// 5. Track event
trackEvent('event_name', { properties });
```

### Authentication Flow
```typescript
// 1. User signs in (email or Google)
const { data } = await supabase.auth.signInWithPassword();

// 2. Identify user in analytics
identifyUser(data.user.id);

// 3. Fetch user profile
const { data: profile } = await supabase
  .from('user_profiles')
  .select('*')
  .eq('user_id', data.user.id)
  .single();

// 4. Navigate based on onboarding status
if (!profile?.onboarding_completed_at) {
  router.push('/(onboarding)/welcome');
} else {
  router.push('/(tabs)/home');
}
```

## Testing Strategy

### Local Development
1. Use Supabase local instance: `supabase start`
2. Mock OpenAI responses for faster iteration
3. Test notifications on physical device
4. Use PostHog local mode or mock analytics

### Preview/Staging
1. Deploy to preview channel: `eas build --profile preview`
2. Test with beta users via TestFlight / Internal Track
3. Monitor analytics for errors
4. Test OTA updates

### Production
1. Deploy via EAS: `eas build --profile production`
2. Submit to app stores
3. Monitor crash reports and analytics
4. Be ready to push hotfix via OTA

## Cost Breakdown (MVP, ~100 users)

| Service | Plan | Monthly Cost |
|---------|------|--------------|
| Supabase | Free | $0 |
| OpenAI (GPT-4o-mini) | Pay-as-you-go | ~$5 |
| Expo EAS Build | Production | $29 |
| PostHog | Free | $0 |
| Apple Developer | Annual | $99/year ≈ $8.25/mo |
| Google Play | One-time | $25 ≈ $2/mo |
| **Total** | | **~$44.25/mo** |

### Cost Optimization Tips
- Use OTA updates instead of new builds when possible
- Mock OpenAI in development
- Sample high-frequency analytics events
- Use Supabase free tier (includes 500MB database, 2GB bandwidth)

## Troubleshooting

### Quick Debug Checklist

**Can't authenticate?**
- Check Supabase URL and anon key
- Verify Google OAuth credentials
- Check redirect URIs

**AI features not working?**
- Verify OpenAI API key in Supabase secrets
- Check Edge Function logs
- Test with fallback responses

**Notifications not showing?**
- Test on physical device (not simulator)
- Check permissions granted
- Verify notification channel (Android)

**Build failed?**
- Check EAS credentials
- Verify bundle ID / package name
- Review build logs in EAS dashboard

**Analytics not tracking?**
- Verify PostHog initialized
- Check API key
- Look for console logs in development

## Getting Help

1. **Check the specific guide** for the integration you're working on
2. **Search error messages** in the official docs
3. **Check GitHub issues** for known problems
4. **Join communities**:
   - [Expo Discord](https://chat.expo.dev/)
   - [Supabase Discord](https://discord.supabase.com/)
   - [React Native Community](https://www.reactnative.dev/community/overview)

## Contributing

When adding new integrations:
1. Create a new guide following the existing format
2. Include setup, implementation, testing, and troubleshooting sections
3. Add code examples with comments
4. Update this README with links
5. Add to the appropriate phase in Quick Start

---

**Last Updated**: 2026-02-11

**Maintained by**: HabitDx Development Team

For questions or suggestions, please review the individual guide files or check the project documentation.
