# Phase 5: AI Failure Profile Generation

**Date Created:** February 9, 2026  
**Phase Duration:** 4-6 days  
**Dependencies:** Phase 4 (Smart Onboarding)  
**Status:** Not Started

## Overview

Build the AI-powered Habit Failure Profile generator using GPT-4o-mini. This is the core differentiator of HabitDx—an insightful, shareable diagnosis of why the user's habits have failed in the past.

## Goals

- Create Supabase Edge Function for AI analysis
- Generate personalized Habit Failure Profiles
- Display profile in beautiful, shareable format
- Enable social sharing with unique URLs
- Cache profiles to minimize API costs
- Provide users with actionable insights

## Success Criteria

- [ ] Edge Function analyzes onboarding data successfully
- [ ] Profile generation completes in <5 seconds
- [ ] Generated profiles feel personalized (not generic)
- [ ] Profile UI is visually compelling
- [ ] Share functionality creates unique URLs
- [ ] Shared profiles viewable without login
- [ ] 10%+ share rate (target metric)

## AI Failure Profile Components

### Profile Structure

```typescript
interface HabitFailureProfile {
  id: string;
  user_id: string;
  created_at: string;

  // AI-generated insights
  failure_patterns: string[]; // 2-4 key patterns
  root_causes: string[]; // 2-3 root causes
  personality_insights: {
    strength: string; // User's superpower
    weakness: string; // Primary obstacle
    archetype: string; // e.g., "Perfectionist", "Overcommitter"
  };
  recommendations: string[]; // 3-5 high-level suggestions

  // Sharing
  share_token: string; // Unique URL token
  view_count: number;

  // Metadata
  version: number;
  is_active: boolean;
}
```

### Example Profile Output

```
🎯 Your Habit Failure Profile

PATTERNS WE NOTICED:
• Evening Energy Crash - You consistently lose motivation after 6pm
• Weekend Routine Disruption - Habits break when your schedule changes
• Perfectionist Paralysis - You stop when you can't do it "perfectly"

ROOT CAUSES:
• Insufficient sleep affecting willpower reserves
• No backup plan for irregular days
• All-or-nothing mindset creating shame spirals

YOUR SUPERPOWER:
You're a "High-Achiever Optimizer" - you love systems and improvement.
Your strength is your analytical mind. Your weakness? That same mind
convinces you to quit when results aren't immediate.

WHAT YOU NEED:
1. Morning-focused habits before energy crashes
2. Flexible "minimum viable" versions for chaotic days
3. Weekly iteration instead of daily perfection
```

## Technical Tasks

### 1. Create Supabase Edge Function

```typescript
// supabase/functions/analyze-failure/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from '@supabase/supabase-js';

serve(async (req) => {
  // 1. Verify authentication
  // 2. Get user's onboarding data
  // 3. Construct AI prompt
  // 4. Call OpenAI API
  // 5. Parse and validate response
  // 6. Save to habit_failure_profiles table
  // 7. Return profile
});
```

Tasks:

- [ ] Create `supabase/functions/analyze-failure/` directory
- [ ] Initialize Deno function
- [ ] Add OpenAI API integration
- [ ] Implement authentication check
- [ ] Build prompt construction logic
- [ ] Add response parsing
- [ ] Implement error handling
- [ ] Add request logging
- [ ] Deploy and test function

### 2. Design AI Prompt Engineering

```typescript
const constructPrompt = (userData: OnboardingData) => {
  return `You are an expert behavioral psychologist analyzing why someone's habits fail.

USER BACKGROUND:
Past failed habits: ${userData.pastFailures.join(', ')}
Why they failed: ${userData.failureDescription}

CONSTRAINTS:
Peak energy: ${userData.constraints.peak_energy}
Schedule: ${userData.constraints.schedule_type.join(', ')}
Main obstacles: ${userData.constraints.obstacles.join(', ')}

GOALS:
${userData.goals.join(', ')}
Motivation: ${userData.motivation}

TASK:
Generate a personalized Habit Failure Profile with:
1. failure_patterns (2-4 patterns you notice, be specific to THIS person)
2. root_causes (2-3 underlying causes, not surface-level)
3. personality_insights (JSON with strength, weakness, archetype)
4. recommendations (3-5 actionable suggestions)

BE SPECIFIC. Avoid generic advice like "be more consistent." Reference their actual data.

Return ONLY valid JSON matching this schema:
{
  "failure_patterns": string[],
  "root_causes": string[],
  "personality_insights": {
    "strength": string,
    "weakness": string,
    "archetype": string
  },
  "recommendations": string[]
}`;
};
```

Tasks:

- [ ] Write initial prompt template
- [ ] Test prompt with sample data
- [ ] Iterate on prompt to reduce generic responses
- [ ] Add examples of good vs bad outputs
- [ ] Test with diverse user profiles
- [ ] Optimize for token usage
- [ ] Document prompt rationale

### 3. Implement OpenAI API Integration

```typescript
// lib/openai.ts
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: Deno.env.get('OPENAI_API_KEY'),
});

export async function generateFailureProfile(prompt: string) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are an expert behavioral psychologist...',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.7,
    max_tokens: 1000,
    response_format: { type: 'json_object' },
  });

  return JSON.parse(response.choices[0].message.content);
}
```

Tasks:

- [ ] Install OpenAI SDK in Edge Function
- [ ] Configure API key in Supabase secrets
- [ ] Implement API call with error handling
- [ ] Add retry logic for rate limits
- [ ] Add timeout handling
- [ ] Log API usage for cost tracking
- [ ] Validate JSON response structure

### 4. Build Profile Display Screen

```
app/(tabs)/profile.tsx
```

UI Components:

- [ ] Profile header with user name
- [ ] "Failure Patterns" section
  - List with icons for each pattern
  - Expandable details
- [ ] "Root Causes" section
  - Numbered list
  - Insightful, not judgmental tone
- [ ] "Your Superpower" callout
  - Highlighted box
  - Strength + Weakness
  - Archetype label
- [ ] "Recommendations" section
  - Actionable suggestions
  - Checkboxes (for UX, not functional)
- [ ] "Share Profile" button
  - Copy link
  - Share to social media
- [ ] "Regenerate Profile" button (secondary)

Design:

- [ ] Use cards for visual separation
- [ ] Add emoji/icons for personality
- [ ] Highlight key insights
- [ ] Make it screenshot-worthy

### 5. Implement Share Functionality

```typescript
// lib/sharing.ts
export const generateShareToken = () => {
  // Generate unique short URL token
  return crypto.randomUUID().slice(0, 8);
};

export const getShareUrl = (token: string) => {
  return `https://habitdx.app/share/${token}`;
};

export const shareProfile = async (token: string) => {
  const url = getShareUrl(token);

  if (Platform.OS === 'ios') {
    await Share.share({ url, message: 'Check out my Habit Failure Profile!' });
  } else {
    await Share.share({ url });
  }
};
```

Tasks:

- [ ] Create share token generation function
- [ ] Add share_token column to profiles (already in schema)
- [ ] Implement share URL creation
- [ ] Build native share dialog integration
- [ ] Add "Copy Link" functionality
- [ ] Track share events in analytics
- [ ] Test sharing on iOS and Android

### 6. Create Public Profile View

```
app/share/[token].tsx
```

For users who receive a shared link:

- [ ] Public route (no auth required)
- [ ] Fetch profile by share_token
- [ ] Display profile in read-only mode
- [ ] Increment view_count on load
- [ ] Add "Get HabitDx" CTA button
- [ ] Add meta tags for social preview
- [ ] Handle invalid/expired tokens

### 7. Add Profile Caching & Versioning

- [ ] Check for existing active profile before generating
- [ ] Only regenerate if user explicitly requests
- [ ] Set is_active=false on old profiles when regenerating
- [ ] Increment version number on regeneration
- [ ] Allow viewing profile history (P1 feature)

### 8. Implement Error Handling

```typescript
// Handle various failure modes
try {
  const profile = await generateProfile(userId);
  return profile;
} catch (error) {
  if (error instanceof OpenAIError) {
    // API rate limit, timeout, etc.
    return { error: 'AI_SERVICE_ERROR' };
  } else if (error instanceof NetworkError) {
    return { error: 'NETWORK_ERROR' };
  } else {
    // Log to error tracking service
    return { error: 'UNKNOWN_ERROR' };
  }
}
```

Error scenarios:

- [ ] OpenAI API rate limit hit
- [ ] OpenAI API timeout
- [ ] Invalid API response format
- [ ] User has no onboarding data
- [ ] Database save fails
- [ ] Network errors

### 9. Add Loading States

- [ ] Show "Analyzing..." screen during generation
- [ ] Animated progress indicator
- [ ] Encouraging messages while waiting
- [ ] Estimated time remaining (3-5 seconds)
- [ ] Handle long wait times gracefully

## AI Prompt Optimization Strategy

### Iteration Plan

1. **Version 1:** Basic prompt, test for completeness
2. **Version 2:** Add specificity requirements, reduce generic responses
3. **Version 3:** Add few-shot examples of good profiles
4. **Version 4:** Optimize for token usage
5. **Version 5:** A/B test against user satisfaction scores

### Prompt Testing

- [ ] Create test suite with 10 diverse user profiles
- [ ] Generate profiles for each test case
- [ ] Rate each profile for:
  - Specificity (1-5)
  - Actionability (1-5)
  - Personalization (1-5)
  - Not generic (1-5)
- [ ] Iterate prompt to improve scores
- [ ] Document prompt version history

### Quality Checks

- [ ] Profile doesn't repeat user's exact words
- [ ] Insights are surprising/non-obvious
- [ ] Recommendations are specific (not "try harder")
- [ ] Tone is empowering, not judgmental
- [ ] Archetype feels accurate

## Deliverables

1. **Working Edge Function**
   - Analyzes onboarding data
   - Calls OpenAI API
   - Saves profile to database

2. **Profile Display UI**
   - Beautiful, shareable design
   - All profile sections rendered
   - Mobile-optimized

3. **Share Functionality**
   - Generate unique share URLs
   - Native share dialog
   - Public profile view

4. **Quality AI Output**
   - Personalized insights
   - Actionable recommendations
   - Avoids generic advice

## Testing Checklist

### Edge Function Tests

- [ ] Function deploys successfully
- [ ] Authentication check works
- [ ] Fetches user onboarding data
- [ ] Constructs prompt correctly
- [ ] Calls OpenAI API successfully
- [ ] Parses response correctly
- [ ] Saves profile to database
- [ ] Returns profile to client
- [ ] Handles errors gracefully

### AI Quality Tests

- [ ] Generate 10 profiles from test data
- [ ] Verify each profile is unique
- [ ] Check for generic phrases
- [ ] Validate JSON structure
- [ ] Ensure all required fields present
- [ ] Test with minimal onboarding data
- [ ] Test with maximum onboarding data

### UI Tests

- [ ] Profile screen displays all sections
- [ ] Text is readable and well-formatted
- [ ] Share button works on iOS
- [ ] Share button works on Android
- [ ] Copy link works
- [ ] Regenerate creates new profile
- [ ] Loading states show during generation

### Share Tests

- [ ] Share URL opens in browser
- [ ] Public profile loads without auth
- [ ] View count increments
- [ ] Invalid tokens show error
- [ ] Meta tags render for social preview

### Edge Cases

- [ ] User with no onboarding data
- [ ] OpenAI API returns invalid JSON
- [ ] OpenAI API timeout
- [ ] Rate limit exceeded
- [ ] Network offline during generation
- [ ] Multiple simultaneous requests
- [ ] Profile regeneration while viewing

## Risks & Mitigations

| Risk                             | Likelihood | Impact   | Mitigation                                                 |
| -------------------------------- | ---------- | -------- | ---------------------------------------------------------- |
| AI responses feel generic        | High       | Critical | Extensive prompt engineering, add examples, iterate        |
| OpenAI API costs too high        | Low        | Medium   | Use gpt-4o-mini, cache profiles, monitor usage             |
| API rate limits hit              | Low        | High     | Implement request queue, retry logic                       |
| Profiles aren't shareable-worthy | Medium     | High     | Focus on design, test with users, make it Instagram-worthy |
| Generation takes too long        | Low        | Medium   | Optimize prompt length, use streaming if possible          |

## Cost Optimization

### Token Usage

- Average onboarding data: ~300 tokens
- System + user prompt: ~500 tokens
- Expected output: ~400 tokens
- Total per profile: ~1200 tokens
- Cost (gpt-4o-mini): ~$0.0002/profile

### Optimization Strategies

- [ ] Cache profiles (don't regenerate unnecessarily)
- [ ] Limit prompt verbosity
- [ ] Use lower temperature for consistency
- [ ] Monitor usage with logging
- [ ] Set monthly budget alerts

### Projected Costs (MVP)

- 50 users x 1 profile = 50 profiles
- 50 x $0.0002 = $0.01
- Monthly estimated: <$5 for MVP validation

## Dependencies for Next Phase

Phase 6 (Habit Stack Generation) requires:

- ✅ Working Habit Failure Profile in database
- ✅ AI infrastructure (OpenAI integration)
- ✅ Profile data available for context

## Notes

- This is the key differentiator—invest time in quality
- Prompt engineering is iterative—plan for multiple versions
- Test with real user data as soon as possible
- Make profile visually compelling (it's a social artifact)
- Consider adding "Download as Image" feature for sharing
- Track which insights users find most valuable
- Monitor for AI safety issues (inappropriate content)

## Resources

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [GPT-4o-mini Pricing](https://openai.com/pricing)
- [Prompt Engineering Guide](https://platform.openai.com/docs/guides/prompt-engineering)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [JSON Mode for Structured Output](https://platform.openai.com/docs/guides/structured-outputs)
