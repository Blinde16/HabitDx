# Phase 10: Core UI/UX & Navigation Polish

**Date Created:** February 9, 2026  
**Phase Duration:** 4-6 days  
**Dependencies:** Phases 1-9 (All core features)  
**Status:** Not Started

## Overview

Polish the user interface and experience across the entire app. This phase focuses on consistent design, smooth interactions, accessibility, and overall app cohesion. All features are built—now make them beautiful and delightful.

## Goals

- Establish consistent design system
- Polish all screens and components
- Improve navigation flow
- Add micro-interactions and animations
- Ensure accessibility compliance
- Optimize performance
- Create cohesive brand experience

## Success Criteria

- [ ] Consistent visual design across all screens
- [ ] Smooth animations at 60fps
- [ ] App feels fast and responsive
- [ ] Navigation is intuitive
- [ ] Accessibility score >90% (WCAG AA)
- [ ] No UI bugs or broken layouts
- [ ] App "feels professional"

## Design System Components

### 1. Color Palette
```typescript
// theme/colors.ts
export const colors = {
  // Primary
  primary: '#4A90E2', // Calm blue
  primaryDark: '#357ABD',
  primaryLight: '#6FA8EF',
  
  // Secondary
  secondary: '#50C878', // Success green
  secondaryDark: '#3DA563',
  secondaryLight: '#6DD491',
  
  // Neutrals
  black: '#1A1A1A',
  gray900: '#2D2D2D',
  gray800: '#3D3D3D',
  gray700: '#5D5D5D',
  gray600: '#7D7D7D',
  gray500: '#9D9D9D',
  gray400: '#BDBDBD',
  gray300: '#DDDDDD',
  gray200: '#EEEEEE',
  gray100: '#F5F5F5',
  white: '#FFFFFF',
  
  // Semantic
  success: '#50C878',
  error: '#E74C3C',
  warning: '#F39C12',
  info: '#3498DB',
  
  // Backgrounds
  background: '#FFFFFF',
  backgroundSecondary: '#F9FAFB',
  card: '#FFFFFF',
  
  // Text
  textPrimary: '#1A1A1A',
  textSecondary: '#5D5D5D',
  textTertiary: '#9D9D9D',
};
```

Tasks:
- [ ] Define color palette
- [ ] Ensure WCAG AA contrast ratios
- [ ] Create theme context
- [ ] Support light theme (dark theme P2)
- [ ] Document color usage guidelines

### 2. Typography
```typescript
// theme/typography.ts
export const typography = {
  // Font families
  fontFamily: {
    regular: 'Inter-Regular',
    medium: 'Inter-Medium',
    semiBold: 'Inter-SemiBold',
    bold: 'Inter-Bold',
  },
  
  // Font sizes (using scale)
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  
  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
  
  // Text styles
  h1: { fontSize: 36, fontWeight: '700', lineHeight: 1.2 },
  h2: { fontSize: 30, fontWeight: '700', lineHeight: 1.2 },
  h3: { fontSize: 24, fontWeight: '600', lineHeight: 1.3 },
  h4: { fontSize: 20, fontWeight: '600', lineHeight: 1.3 },
  body: { fontSize: 16, fontWeight: '400', lineHeight: 1.5 },
  bodySmall: { fontSize: 14, fontWeight: '400', lineHeight: 1.5 },
  caption: { fontSize: 12, fontWeight: '400', lineHeight: 1.5 },
};
```

Tasks:
- [ ] Install Inter font (or chosen font family)
- [ ] Define type scale
- [ ] Create text components (H1, H2, Body, etc.)
- [ ] Ensure readable line heights
- [ ] Support dynamic type (accessibility)

### 3. Spacing System
```typescript
// theme/spacing.ts
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
};
```

Tasks:
- [ ] Define spacing scale
- [ ] Use consistently for margins/padding
- [ ] Create layout components (Stack, Row, etc.)

### 4. Component Library
Build reusable styled components:

```typescript
// components/ui/Button.tsx
<Button variant="primary" size="large">
  Check In
</Button>

// components/ui/Card.tsx
<Card shadow="medium" padding="lg">
  {children}
</Card>

// components/ui/Input.tsx
<Input
  label="Email"
  placeholder="you@example.com"
  error="Invalid email"
/>

// components/ui/Badge.tsx
<Badge color="success">Completed</Badge>

// components/ui/Progress.tsx
<Progress value={67} max={100} />
```

Components to create:
- [ ] Button (variants: primary, secondary, ghost, danger)
- [ ] Card (with shadow, border, padding options)
- [ ] Input (text, email, password, textarea)
- [ ] Badge (status indicators)
- [ ] Progress (linear progress bar)
- [ ] Avatar (user profile image)
- [ ] Icon (wrapper for icon library)
- [ ] Divider (horizontal/vertical separator)
- [ ] EmptyState (no data illustrations)
- [ ] LoadingSpinner (consistent loading indicator)

## UI Polish Tasks

### 1. Navigation Polish
```
app/(tabs)/_layout.tsx
```

Tab Bar:
- [ ] Custom tab bar design (not default)
- [ ] Icons for each tab (Home, Insights, Settings)
- [ ] Active tab indicator (color + icon)
- [ ] Badge on Insights tab (new insight)
- [ ] Smooth tab transitions
- [ ] Haptic feedback on tab press

Tasks:
- [ ] Design custom tab bar
- [ ] Add custom icons
- [ ] Implement active state styling
- [ ] Add badge indicator
- [ ] Add micro-interactions (press animation)
- [ ] Test on iOS and Android

### 2. Home Screen Polish
- [ ] Add pull-to-refresh animation
- [ ] Empty state (no habits today)
- [ ] Loading skeleton screens
- [ ] Smooth card transitions on check-in
- [ ] Celebration animation (first habit of day)
- [ ] Completion summary card (visual progress)
- [ ] Time-based greeting (Good morning/afternoon/evening)
- [ ] Gradient background (subtle)

### 3. Onboarding Flow Polish
- [ ] Progress bar animation
- [ ] Screen transitions (slide, fade)
- [ ] Input focus animations
- [ ] Character counter with color change (near limit)
- [ ] Success checkmarks on completion
- [ ] "Skip" option styling
- [ ] Consistent button placement
- [ ] Loading state during profile generation

### 4. Habit Check-in Card Polish
- [ ] Card hover/press state
- [ ] Checkmark animation (scale + rotate)
- [ ] Background color transition on complete
- [ ] Streak fire emoji animation (🔥)
- [ ] Haptic feedback on tap
- [ ] Disabled state (already completed)
- [ ] Long-press for details
- [ ] Swipe actions (edit, delete) - P1

### 5. Insights Screen Polish
- [ ] Data visualization (charts for completion rates)
- [ ] Pattern cards with icons
- [ ] Adjustment card with highlight
- [ ] Accept button animation
- [ ] Success feedback on accept
- [ ] Past insights timeline view
- [ ] Before/after comparison
- [ ] Loading state for generation

### 6. Settings Screen Polish
- [ ] Profile section (avatar, name, email)
- [ ] Grouped settings sections
- [ ] Toggle switches (iOS-style)
- [ ] Navigation arrows (→)
- [ ] Dividers between sections
- [ ] Version number at bottom
- [ ] Logout button (danger color)
- [ ] Delete account option (hidden)

### 7. Modal and Alert Polish
- [ ] Consistent modal design
- [ ] Smooth slide-up animation
- [ ] Backdrop blur effect
- [ ] Easy dismiss (swipe down)
- [ ] Alert dialogs (confirm actions)
- [ ] Toast notifications (success/error)

## Micro-interactions

### 1. Button Interactions
- [ ] Press animation (scale down)
- [ ] Haptic feedback on press
- [ ] Loading state (spinner in button)
- [ ] Disabled state (reduced opacity)
- [ ] Success state (checkmark briefly)

### 2. Input Interactions
- [ ] Focus animation (border color)
- [ ] Label animation (float up on focus)
- [ ] Error shake animation
- [ ] Character counter color change
- [ ] Clear button (X) appears when typing

### 3. Card Interactions
- [ ] Shadow increases on press
- [ ] Subtle hover effect (if applicable)
- [ ] Expand/collapse animations
- [ ] Swipe gestures (optional)

### 4. List Interactions
- [ ] Smooth scroll
- [ ] Pull-to-refresh animation
- [ ] Item press feedback
- [ ] Empty state transitions

### 5. Success Celebrations
- [ ] Confetti on first check-in
- [ ] Streak milestone animations (7, 30 days)
- [ ] Completion percentage milestones
- [ ] Weekly insight reveal animation

## Animations

Using `react-native-reanimated`:

```typescript
// animations/scale.ts
export const scaleAnimation = (pressed: boolean) => {
  'worklet';
  return withSpring(pressed ? 0.95 : 1, {
    damping: 15,
    stiffness: 150,
  });
};

// animations/fade.ts
export const fadeIn = () => {
  'worklet';
  return withTiming(1, { duration: 300 });
};
```

Animations to implement:
- [ ] Scale (button press)
- [ ] Fade (screen transitions)
- [ ] Slide (modal entry)
- [ ] Rotate (checkmark)
- [ ] Bounce (celebration)
- [ ] Progress (loading bars)

## Accessibility

### 1. Screen Reader Support
- [ ] Add accessibilityLabel to all interactive elements
- [ ] Add accessibilityHint where helpful
- [ ] Add accessibilityRole (button, header, etc.)
- [ ] Group related elements with accessibilityRole="group"
- [ ] Announce state changes (completed, error, etc.)
- [ ] Test with VoiceOver (iOS) and TalkBack (Android)

### 2. Visual Accessibility
- [ ] Minimum contrast ratio 4.5:1 for text (WCAG AA)
- [ ] Minimum touch target size 44x44pt
- [ ] Support dynamic type (larger text sizes)
- [ ] Don't rely on color alone (use icons + text)
- [ ] Add loading indicators for async actions
- [ ] Error messages are clear and actionable

### 3. Keyboard Navigation
- [ ] Tab order is logical
- [ ] Focus indicators visible
- [ ] Enter key submits forms
- [ ] Escape key dismisses modals

### 4. Reduced Motion
- [ ] Respect system prefers-reduced-motion setting
- [ ] Disable decorative animations if enabled
- [ ] Keep functional animations (loading, progress)

## Performance Optimization

### 1. Rendering Performance
- [ ] Use React.memo for expensive components
- [ ] Use useMemo for expensive calculations
- [ ] Use useCallback for event handlers
- [ ] Avoid inline styles and functions
- [ ] Lazy load heavy components
- [ ] Virtualize long lists (FlatList)

### 2. Image Optimization
- [ ] Use optimized image formats (WebP)
- [ ] Lazy load images
- [ ] Use placeholder images
- [ ] Optimize image sizes (1x, 2x, 3x)
- [ ] Cache images

### 3. Animation Performance
- [ ] Use `react-native-reanimated` (runs on UI thread)
- [ ] Avoid animating expensive properties (use transform)
- [ ] Use `useNativeDriver: true` where possible
- [ ] Profile animations with React DevTools

### 4. Bundle Size
- [ ] Remove unused dependencies
- [ ] Use import statements correctly (tree-shaking)
- [ ] Analyze bundle with `npx expo-atlas`
- [ ] Code-split heavy features (if applicable)

## Deliverables

1. **Design System**
   - Color palette defined and documented
   - Typography scale established
   - Spacing system consistent
   - Component library created

2. **Polished UI**
   - All screens visually consistent
   - Animations smooth and purposeful
   - Micro-interactions delightful
   - Loading states clear

3. **Accessibility**
   - Screen reader support complete
   - WCAG AA compliance
   - Dynamic type support
   - Reduced motion support

4. **Performance**
   - Animations at 60fps
   - Fast load times
   - Optimized bundle size
   - No jank or lag

## Testing Checklist

### Visual Testing
- [ ] All screens match design
- [ ] Colors consistent across app
- [ ] Typography consistent
- [ ] Spacing consistent
- [ ] Icons aligned and sized correctly
- [ ] Dark mode works (if implemented)

### Interaction Testing
- [ ] All buttons press smoothly
- [ ] Animations smooth on slow devices
- [ ] Haptic feedback works
- [ ] Modals dismiss properly
- [ ] Alerts show correctly
- [ ] Toasts appear and disappear

### Accessibility Testing
- [ ] VoiceOver navigation works (iOS)
- [ ] TalkBack navigation works (Android)
- [ ] Contrast ratios pass WCAG AA
- [ ] Touch targets >44pt
- [ ] Dynamic type scales properly
- [ ] Reduced motion works

### Performance Testing
- [ ] App launches <3 seconds
- [ ] Screens load instantly
- [ ] Animations at 60fps
- [ ] No dropped frames during scroll
- [ ] Memory usage reasonable
- [ ] Battery usage acceptable

### Platform Testing
- [ ] iOS design guidelines followed
- [ ] Android Material Design followed
- [ ] Safe area insets respected (iPhone notch)
- [ ] Status bar styling correct
- [ ] Navigation bar styling correct

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Animations cause performance issues | Medium | Medium | Profile early, optimize, test on old devices |
| Design inconsistencies | Medium | Low | Create design system first, use strictly |
| Accessibility overlooked | Medium | Medium | Test with assistive tech, follow WCAG guidelines |
| Over-designed (too much polish) | Low | Low | Focus on core screens, iterate based on feedback |

## Dependencies for Next Phase

Phase 11 (Testing & QA) requires:
- ✅ All screens polished and finalized
- ✅ UI/UX ready for comprehensive testing
- ✅ No major design changes planned

## Notes

- Polish is iterative—don't aim for perfection immediately
- Test on real devices (old and new)
- Get feedback from beta users
- Focus on core flows first (onboarding, check-in, insights)
- Consistency > novelty
- Less is more—remove unnecessary elements
- Celebrate progress with users (animations, feedback)

## Resources

- [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/)
- [iOS Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Material Design](https://m3.material.io/)
- [WCAG Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Expo Haptics](https://docs.expo.dev/versions/latest/sdk/haptics/)
- [Mobile Design Patterns](https://www.mobile-patterns.com/)
