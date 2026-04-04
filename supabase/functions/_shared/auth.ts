import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

/**
 * Validates the caller JWT inside the Edge Function (not at the API gateway).
 * Required when the project uses JWT Signing Keys (asymmetric / ES256): the
 * gateway's legacy verify_jwt check fails with "Invalid JWT" before Deno runs.
 * Pair with `[functions.<name>] verify_jwt = false` in config.toml.
 * @see https://supabase.com/docs/guides/functions/auth
 */
export async function verifyJwtAndGetUserId(
  authHeader: string | null
): Promise<{ ok: true; userId: string } | { ok: false; error: string; status: number }> {
  if (!authHeader) {
    return { ok: false, error: 'Missing authorization header', status: 401 };
  }
  const jwt = authHeader.replace(/^Bearer\s+/i, '');
  const admin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );
  const { data, error } = await admin.auth.getClaims(jwt);
  if (error || !data?.claims?.sub) {
    return { ok: false, error: error?.message ?? 'Unauthorized', status: 401 };
  }
  return { ok: true, userId: data.claims.sub as string };
}
