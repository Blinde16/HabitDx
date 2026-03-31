import { OAuthCallbackScreen } from '../../components/auth';

/**
 * Same handler as `(auth)/callback` — URL is `/auth/callback` (Supabase + older redirects).
 * Web OAuth should use `/callback` (see authStore); keep this for backward compatibility.
 */
export default function AuthSegmentCallbackScreen() {
  return <OAuthCallbackScreen />;
}
