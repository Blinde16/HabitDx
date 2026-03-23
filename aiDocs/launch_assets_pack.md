# HabitDx Launch Assets Pack

**Last Updated:** March 23, 2026

---

## 1. Production Configuration

Populate these before external beta:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_PRIVACY_POLICY_URL`
- `EXPO_PUBLIC_TERMS_URL`
- `EXPO_PUBLIC_BETA_FEEDBACK_URL`
- `EXPO_PUBLIC_BETA_COMMUNITY_URL`
- `EXPO_PUBLIC_BETA_EXIT_SURVEY_URL`
- `EXPO_PUBLIC_SUPPORT_EMAIL`

Reference: [.env.example](/Users/blake/Documents/HabitDx/HabitDx/.env.example)

---

## 2. App Store Screenshot Shot List

### iOS and Android
1. Onboarding screen that frames the problem: "You’re not broken. Your system is."
2. Failure Profile screen with personalized diagnosis
3. Habit stack screen with tiny versions, anchors, and celebrations
4. Daily check-in screen with completed habits
5. Weekly insight screen with one concrete recommendation

### Capture notes
- Use realistic but concise demo data
- Show one strong headline per screen
- Keep timestamps, battery, and notification icons clean
- Avoid lorem ipsum or placeholder copy

---

## 3. Store Listing Copy

### App Store Subtitle / Short Description
Build habits that fit your real life, not your ideal week.

### Long Description
HabitDx helps you understand why your habits keep breaking down, then gives you a smaller, more realistic plan to try next.

Instead of guilt-driven streaks and generic advice, HabitDx uses your past habit failures, schedule constraints, and daily check-ins to generate:

- a personalized Failure Profile
- a tiny, realistic habit stack
- weekly AI adjustments based on your actual behavior

HabitDx is built for people who know what they want to do, but need a system that actually fits their life.

### Core value bullets
- Learn your habit failure patterns
- Start with tiny actions you can actually sustain
- Check in quickly each day
- Get one weekly adjustment instead of overwhelming advice
- Build consistency without shame

---

## 4. Icon Brief

Direction:
- clean, high-contrast mark
- feels diagnostic and optimistic
- avoid generic checklist iconography

Concept prompts:
- habit loop + insight spark
- checkmark integrated with a compass or pathway
- simple `H` mark with motion or iteration cue

---

## 5. Release Decision

Do not submit to Apple or Google until:
- beta links in Settings open correctly
- legal URLs are live
- support email works
- production build runs against production Supabase
- at least one weekly iteration has been validated on a production-like dataset
