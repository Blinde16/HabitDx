# Phase 2: Authentication System

**Date Created:** February 9, 2026  
**Phase Duration:** 4-6 days  
**Dependencies:** Phase 1 (Project Setup)  
**Status:** Not Started

## Overview

Implement user authentication using Supabase Auth with email/password and Google OAuth sign-in. This phase establishes the foundation for user identity and session management throughout the app.

## Goals

- Enable users to sign up with email/password
- Enable users to sign in with Google OAuth
- Implement secure session management
- Create auth flow screens (login, signup, forgot password)
- Protect authenticated routes
- Handle auth state globally

## Success Criteria

- [ ] Users can sign up with email/password
- [ ] Users can sign in with email/password
- [ ] Users can sign in with Google
- [ ] Email verification works
- [ ] Password reset flow functional
- [ ] Session persists across app restarts
- [ ] Protected routes redirect to login when unauthenticated
- [ ] Auth state accessible throughout app

## Technical Tasks

### 1. Configure Supabase Auth
- [ ] Enable Email authentication in Supabase dashboard
- [ ] Configure Email templates (welcome, password reset)
- [ ] Set up Google OAuth provider
  - Create Google Cloud project
  - Configure OAuth consent screen
  - Add authorized redirect URIs
  - Add credentials to Supabase
- [ ] Configure auth settings (JWT expiry, session timeout)
- [ ] Test auth configuration with Supabase dashboard

### 2. Create Auth Store (Zustand)
```typescript
// stores/authStore.ts
interface AuthStore {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
}
```

Tasks:
- [ ] Create Zustand store for auth state
- [ ] Implement sign up method
- [ ] Implement sign in method
- [ ] Implement Google OAuth method
- [ ] Implement sign out method
- [ ] Implement password reset methods
- [ ] Add error handling and loading states

### 3. Build Auth Screens

#### Login Screen (`app/(auth)/login.tsx`)
- [ ] Email input field
- [ ] Password input field with visibility toggle
- [ ] "Sign In" button
- [ ] "Sign in with Google" button
- [ ] "Forgot Password?" link
- [ ] "Don't have an account? Sign Up" link
- [ ] Loading states and error messages
- [ ] Form validation

#### Sign Up Screen (`app/(auth)/signup.tsx`)
- [ ] Name input field
- [ ] Email input field
- [ ] Password input field with strength indicator
- [ ] Confirm password field
- [ ] Terms of Service checkbox
- [ ] "Create Account" button
- [ ] "Sign up with Google" button
- [ ] "Already have an account? Sign In" link
- [ ] Form validation and error handling

#### Forgot Password Screen (`app/(auth)/forgot-password.tsx`)
- [ ] Email input field
- [ ] "Send Reset Link" button
- [ ] Success message confirmation
- [ ] "Back to Login" link

#### Reset Password Screen (`app/(auth)/reset-password.tsx`)
- [ ] New password input
- [ ] Confirm new password input
- [ ] "Update Password" button
- [ ] Handle deep link from email

### 4. Implement Auth Flow Logic
- [ ] Create auth route group `(auth)`
- [ ] Set up Expo Router auth layout
- [ ] Implement session persistence with AsyncStorage
- [ ] Handle deep links for email verification
- [ ] Handle deep links for password reset
- [ ] Add session refresh logic
- [ ] Implement auto sign-in after verification

### 5. Create Protected Route Wrapper
```typescript
// components/ProtectedRoute.tsx
// Wraps authenticated screens
// Redirects to login if not authenticated
```

- [ ] Create ProtectedRoute component
- [ ] Check auth state before rendering
- [ ] Redirect to login if unauthenticated
- [ ] Show loading spinner during auth check
- [ ] Wrap main app routes with ProtectedRoute

### 6. Build Reusable Auth Components
- [ ] `AuthInput` - Styled text input for forms
- [ ] `AuthButton` - Primary action button
- [ ] `SocialButton` - Google OAuth button
- [ ] `PasswordInput` - Password field with visibility toggle
- [ ] `ErrorMessage` - Error display component
- [ ] `LoadingSpinner` - Loading indicator

### 7. Set Up Deep Linking
- [ ] Configure app.json for deep links
- [ ] Set up URL schemes for iOS/Android
- [ ] Test email verification links
- [ ] Test password reset links
- [ ] Handle deep link routing in app

### 8. Error Handling
- [ ] Map Supabase error codes to user-friendly messages
- [ ] Handle network errors gracefully
- [ ] Display validation errors inline
- [ ] Show toast notifications for success/error
- [ ] Log errors for debugging

### 9. Session Management
- [ ] Store session token securely
- [ ] Refresh token before expiry
- [ ] Handle session expired state
- [ ] Sign out on security errors
- [ ] Clear session data on sign out

## UI/UX Requirements

### Design Specs
- Clean, minimal auth screens
- Large, easy-to-tap buttons (44pt minimum)
- Clear error messages below inputs
- Loading states for all async actions
- Smooth transitions between auth screens

### Accessibility
- [ ] Proper labels for screen readers
- [ ] Keyboard navigation support
- [ ] Sufficient color contrast (WCAG AA)
- [ ] Focus indicators on inputs
- [ ] Error announcements for screen readers

## Deliverables

1. **Functional Authentication**
   - Email/password signup and login
   - Google OAuth sign-in
   - Email verification flow
   - Password reset flow

2. **Auth Screens**
   - Login screen
   - Sign up screen
   - Forgot password screen
   - Reset password screen

3. **Global Auth State**
   - Zustand store managing auth
   - Session persistence across restarts
   - Auth status accessible app-wide

4. **Protected Routes**
   - Authenticated routes secured
   - Automatic redirect to login
   - Seamless post-login navigation

## Testing Checklist

### Unit Tests
- [ ] Auth store actions (sign up, sign in, sign out)
- [ ] Form validation logic
- [ ] Error message mapping
- [ ] Session persistence utilities

### Integration Tests
- [ ] Complete sign up flow
- [ ] Complete sign in flow
- [ ] Google OAuth flow (manual)
- [ ] Password reset flow
- [ ] Email verification flow
- [ ] Session refresh logic

### Manual Testing
- [ ] Sign up with email on iOS
- [ ] Sign up with email on Android
- [ ] Sign in with existing account
- [ ] Sign in with Google (iOS)
- [ ] Sign in with Google (Android)
- [ ] Forgot password flow
- [ ] Email verification link click
- [ ] Password reset link click
- [ ] Session persists after app restart
- [ ] Sign out clears session
- [ ] Protected routes redirect when not logged in

### Edge Cases
- [ ] Sign up with existing email
- [ ] Sign in with wrong password
- [ ] Sign in with unverified email
- [ ] Network offline during auth
- [ ] Expired session token
- [ ] Malformed email input
- [ ] Weak password validation

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Google OAuth setup complexity | Medium | High | Follow Supabase docs carefully, test early |
| Deep link issues on Android | Medium | Medium | Test on multiple Android versions |
| Session management bugs | Medium | High | Implement comprehensive error handling |
| Email deliverability issues | Low | Medium | Use SendGrid/custom SMTP if needed |

## Dependencies for Next Phase

Phase 3 (Database Schema) requires:
- ✅ Working authentication system
- ✅ User can sign in and persist session
- ✅ User ID available for foreign keys

## Security Considerations

- [ ] Never store passwords in plain text
- [ ] Use HTTPS for all API calls
- [ ] Validate all inputs server-side
- [ ] Rate limit auth endpoints (Supabase default)
- [ ] Implement CAPTCHA if abuse detected
- [ ] Use secure password requirements (min 8 chars)
- [ ] Sanitize user inputs

## Notes

- Supabase handles most security out of the box
- Focus on UX—auth should be fast and friction-free
- Google OAuth is priority over Apple Sign In for MVP
- Email verification can be optional initially to reduce drop-off
- Consider adding "Remember Me" toggle if users request it

## Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Expo Auth Session](https://docs.expo.dev/versions/latest/sdk/auth-session/)
- [React Native Secure Store](https://docs.expo.dev/versions/latest/sdk/securestore/)
- [Google OAuth Setup Guide](https://supabase.com/docs/guides/auth/social-login/auth-google)
