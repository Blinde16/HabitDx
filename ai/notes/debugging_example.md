# AI-Assisted Debugging Example - HabitDx Auth Flow

**Date:** February 16, 2026  
**Developer:** Blake  
**Issue:** Users reporting "Failed to sign in" error with no additional context

---

## 1. Initial Problem Report

**User Report:**
"I'm trying to log in but it just says 'Failed to sign in' and I don't know why. My email is correct and I know the password works."

**First Attempt (No Logs):**

- Checked code visually
- Couldn't reproduce locally
- No way to know what actually went wrong on user's device

---

## 2. After Implementing Structured Logging

**Step 1: Ask user to send logs**

Since we now have `logs/combined.log` with structured data, asked user to:

1. Try logging in again
2. Export logs from app (future feature: in-app log export)
3. Send last 50 lines

**Logs received:**

```json
{
  "level": "info",
  "message": "User signin attempt",
  "timestamp": "2026-02-16 14:23:45",
  "email": "user@example.com",
  "event": "auth.signin.attempt",
  "service": "habitdx-app"
}
{
  "level": "error",
  "message": "User signin failed",
  "timestamp": "2026-02-16 14:23:46",
  "email": "user@example.com",
  "error": "Email not confirmed",
  "stack": "AuthError: Email not confirmed\n    at signIn (authStore.ts:167)\n    ...",
  "event": "auth.signin.error",
  "service": "habitdx-app"
}
```

---

## 3. AI-Assisted Analysis

**Prompt to AI (Claude/ChatGPT):**

"I'm seeing this error in the logs. What does 'Email not confirmed' mean and how should I handle it?

```json
{
  "error": "Email not confirmed",
  "event": "auth.signin.error"
}
```

My code currently just shows generic 'Failed to sign in' to user. How can I improve the error handling?"

**AI Response:**

"The error 'Email not confirmed' means the user signed up but hasn't clicked the verification link in their email. Your current error handling loses this context.

Here's how to improve it:

```typescript
signIn: async (email: string, password: string) => {
  try {
    // ... existing code
  } catch (error) {
    const authError = error as AuthError;
    logAuth.signInError(email, authError);

    // Better error handling
    let userMessage = authError.message || 'Failed to sign in';

    if (authError.message === 'Email not confirmed') {
      userMessage = 'Please verify your email address. Check your inbox for the verification link.';
    } else if (authError.message === 'Invalid login credentials') {
      userMessage = 'Email or password is incorrect.';
    }

    set({
      error: userMessage,
      loading: false,
    });
    throw error;
  }
};
```

You should also add a 'Resend verification email' button for this case."

---

## 4. Fix Applied

**Changes Made:**

1. Added specific error message for "Email not confirmed"
2. Added "Resend verification" button on login screen
3. Updated logs to capture error message type

**Code Change:**

```typescript
// Before (in authStore.ts line 166-172)
} catch (error) {
  const authError = error as AuthError;
  logAuth.signInError(email, authError);
  set({
    error: authError.message || 'Failed to sign in',
    loading: false,
  });
  throw error;
}

// After
} catch (error) {
  const authError = error as AuthError;
  logAuth.signInError(email, authError);

  // User-friendly error messages
  let userMessage = authError.message || 'Failed to sign in';

  if (authError.message === 'Email not confirmed') {
    userMessage = 'Please verify your email address. Check your inbox for the verification link.';
  } else if (authError.message === 'Invalid login credentials') {
    userMessage = 'Email or password is incorrect. Please try again.';
  }

  set({
    error: userMessage,
    loading: false,
  });
  throw error;
}
```

---

## 5. Verification

**Tested with logs enabled:**

```json
// Login attempt with unverified email
{
  "level": "info",
  "message": "User signin attempt",
  "timestamp": "2026-02-16 15:10:23",
  "email": "test@example.com",
  "event": "auth.signin.attempt"
}
{
  "level": "error",
  "message": "User signin failed",
  "timestamp": "2026-02-16 15:10:24",
  "email": "test@example.com",
  "error": "Email not confirmed",
  "event": "auth.signin.error"
}
// User now sees helpful message: "Please verify your email..."
```

**Result:** User reported issue resolved. They found the verification email in spam folder.

---

## 6. Test-Log-Fix Loop Summary

```
[User reports vague error]
       ↓
[Check logs → Find specific error: "Email not confirmed"]
       ↓
[Ask AI: "What does this error mean? How to handle?"]
       ↓
[AI suggests: Add specific error message + resend button]
       ↓
[Implement fix]
       ↓
[Test with logs enabled → Verify fix works]
       ↓
[User confirms issue resolved]
```

**Time to Resolution:**

- Without logs: Unknown (couldn't diagnose)
- With logs + AI: 30 minutes (from log analysis to deployed fix)

---

## 7. Additional Debugging Examples

### Example 2: Slow Database Query

**Log Entry:**

```json
{
  "level": "warn",
  "message": "Slow database query",
  "timestamp": "2026-02-16 16:45:12",
  "table": "habit_logs",
  "duration": 3200,
  "query": "SELECT * FROM habit_logs WHERE user_id = ...",
  "event": "performance.query.slow"
}
```

**AI Prompt:**
"This query is taking 3.2 seconds. How can I optimize it?"

**AI Response:**
"You're missing an index on `user_id`. Add:

```sql
CREATE INDEX idx_habit_logs_user_id ON habit_logs(user_id);
```

Also, consider adding `LIMIT` if you don't need all rows."

---

### Example 3: Onboarding Drop-Off

**Log Sequence:**

```json
{"event": "onboarding.started", "userId": "123", "timestamp": "2026-02-16 10:00:00"}
{"event": "onboarding.screen.completed", "userId": "123", "screen": "welcome", "timestamp": "2026-02-16 10:00:15"}
{"event": "onboarding.screen.completed", "userId": "123", "screen": "past-failures", "timestamp": "2026-02-16 10:01:30"}
{"event": "onboarding.abandoned", "userId": "123", "lastScreen": "constraints", "timestamp": "2026-02-16 10:04:00"}
```

**AI Prompt:**
"Users are abandoning onboarding on the 'constraints' screen. Here's the time data:

- Welcome: 15 seconds
- Past failures: 1 min 15 sec
- Constraints: Abandoned after 2 min 30 sec

What might be wrong?"

**AI Response:**
"The constraints screen is taking 2.5 minutes before abandonment. Possible issues:

1. Too many questions (user fatigue)
2. Confusing UI (user stuck)
3. Performance issue (loading time)

Check:

- Number of form fields on that screen
- Any API calls that might be slow?
- Is there a complex time picker causing UI lag?

Suggest: A/B test with simplified version (fewer fields) or add progress indicator."

---

## 8. Structured Logging Best Practices (Learned)

### DO:

✅ Log user actions with context (email, userId, event type)
✅ Log errors with stack traces
✅ Log performance metrics (duration, timestamps)
✅ Use consistent event naming (`auth.signin.attempt`, `auth.signin.success`, `auth.signin.error`)
✅ Include relevant metadata (table name, operation type, etc.)

### DON'T:

❌ Log passwords or sensitive data
❌ Log PII without user consent (mask email: `u***@example.com`)
❌ Log too verbosely in production (DEBUG level off)
❌ Forget to rotate logs (5MB max, 5 files)
❌ Ignore log analysis in retrospectives

---

## 9. Future Improvements

### Planned:

1. **In-app log export** - Let beta users easily share logs
2. **Log dashboard** - Real-time log viewer for team
3. **Automated alerts** - Slack notification on error spike
4. **AI log analysis** - Auto-suggest fixes for common errors
5. **User session replay** - Visual debugging for UI issues

### Monitoring:

- Track log volume (should stay under 100 MB/week for 100 users)
- Monitor error rate (target: <5% of requests)
- Review logs weekly in team meeting

---

## 10. Documentation for Team

**How to Use Logs for Debugging:**

1. **Reproduce the issue** (if possible)
2. **Check logs/combined.log** for relevant events
3. **Search by event type** (e.g., `grep "auth.signin.error" logs/combined.log`)
4. **Copy relevant JSON entries**
5. **Ask AI**:
   - "What does this error mean?"
   - "How can I fix this?"
   - "What's the root cause?"
6. **Implement fix**
7. **Test with logs enabled** to verify
8. **Document the fix** (like this example!)

**Log Rotation:**

- Logs rotate automatically at 5MB
- Last 5 log files are kept
- Older logs are deleted (not needed long-term)
- In production, consider log aggregation service (Datadog, Loggly)

---

**Created:** February 16, 2026  
**Purpose:** Demonstrate Test-Log-Fix cycle with AI assistance for midterm rubric  
**Status:** Living document (will add more examples as issues arise)
