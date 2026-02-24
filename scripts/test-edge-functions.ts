/**
 * CLI Test Script: Edge Functions
 *
 * Tests the three Supabase Edge Functions end-to-end:
 *   1. analyze-failure  – generates a Habit Failure Profile via OpenAI
 *   2. generate-habits  – creates a personalized habit stack via OpenAI
 *   3. weekly-iteration – analyzes a week of logs and suggests one adjustment
 *
 * Requirements:
 *   - EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in .env
 *   - A test user whose email/password are set via env vars TEST_USER_EMAIL /
 *     TEST_USER_PASSWORD, OR the script creates a temporary user (needs
 *     Supabase email-confirmation disabled for dev environments).
 *   - OPENAI_API_KEY configured in Supabase Edge Function secrets.
 *
 * Usage:
 *   npm run test:edge-functions
 *
 * Note: weekly-iteration requires real habit logs. The test seeds a week's
 * worth of logs before calling the function and cleans them up afterwards.
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  duration?: number;
  skipped?: boolean;
}

const results: TestResult[] = [];

async function test(name: string, fn: () => Promise<void>): Promise<void> {
  const startTime = Date.now();
  console.log(`\n🧪 Running: ${name}`);

  try {
    await fn();
    const duration = Date.now() - startTime;
    results.push({ name, passed: true, duration });
    console.log(`✅ PASSED (${duration}ms)`);
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);
    results.push({ name, passed: false, error: errorMessage, duration });
    console.log(`❌ FAILED (${duration}ms): ${errorMessage}`);
  }
}

function skip(name: string, reason: string) {
  results.push({ name, passed: true, skipped: true });
  console.log(`\n⏭️  SKIPPED: ${name} — ${reason}`);
}

async function seedWeeklyLogs(
  userId: string,
  habitId: string
): Promise<void> {
  const today = new Date();
  const inserts = [];
  for (let i = 1; i <= 7; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    inserts.push({
      habit_id: habitId,
      user_id: userId,
      log_date: d.toISOString().split('T')[0],
      completed: i <= 5, // 5 completions, 2 misses
    });
  }
  const { error } = await supabase
    .from('habit_logs')
    .upsert(inserts, { onConflict: 'habit_id,log_date' });
  if (error) throw new Error(`Failed to seed logs: ${error.message}`);
}

async function cleanup(userId: string) {
  console.log(`\n🧹 Cleaning up test data for user ${userId}...`);
  await supabase.from('habit_logs').delete().eq('user_id', userId);
  await supabase.from('habits').delete().eq('user_id', userId);
  await supabase.from('habit_stacks').delete().eq('user_id', userId);
  await supabase.from('habit_failure_profiles').delete().eq('user_id', userId);
  await supabase.from('weekly_iterations').delete().eq('user_id', userId);
  await supabase.from('user_profiles').delete().eq('id', userId);
  await supabase.auth.signOut();
  console.log('  ✓ Cleanup complete');
}

async function runTests() {
  console.log('=================================');
  console.log('HabitDx Edge Functions Test Suite');
  console.log('=================================');

  // Prefer env-specified credentials so the same user can be reused across runs
  const testEmail =
    process.env.TEST_USER_EMAIL || `test-ef-${Date.now()}@example.com`;
  const testPassword = process.env.TEST_USER_PASSWORD || 'TestPassword123!';
  const reusingUser = !!process.env.TEST_USER_EMAIL;

  let userId: string | undefined;
  let stackId: string | undefined;
  let habitId: string | undefined;
  let hasSession = false;

  // ── Sign up (only if not reusing an existing user) ────────────────────────
  if (!reusingUser) {
    console.log('\n📝 Setup: Registering temporary test user...');
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    });
    if (error || !data.user) {
      console.error('❌ Sign-up failed:', error?.message);
      process.exit(1);
    }
    userId = data.user.id;
    console.log(`  ✓ User created: ${userId}`);
  }

  // ── Sign in ───────────────────────────────────────────────────────────────
  console.log('\n🔑 Signing in...');
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: testPassword,
  });

  if (signInError || !signInData.session) {
    console.warn(
      '⚠️  Sign-in failed (email confirmation may be required on this project).',
      '\n   Set EXPO_PUBLIC_SUPABASE_URL pointing to a project with email-confirmation disabled,',
      '\n   or pre-confirm the user in Supabase Dashboard.'
    );
    console.warn('   Skipping all edge-function tests.');
    printSummary();
    return;
  }

  userId = signInData.user.id;
  hasSession = true;
  console.log(`  ✓ Signed in as ${userId}`);

  try {
    // ── Seed: user profile with full onboarding data ──────────────────────
    await test('Seed user profile for edge functions', async () => {
      const { error } = await supabase.from('user_profiles').upsert(
        {
          id: userId,
          full_name: 'Edge Function Test User',
          past_failures: ['Daily journaling', 'Morning workout'],
          constraints: {
            peak_energy: 'morning',
            schedule_type: ['9-5 job'],
            obstacles: ['fatigue', 'distraction'],
            failure_description:
              'I start strong but lose momentum after the first week because my habits are too ambitious',
          },
          goals: ['Become someone who moves their body every day'],
          onboarding_completed: true,
        },
        { onConflict: 'id' }
      );
      if (error) throw new Error(error.message);
      console.log('  ✓ Profile seeded');
    });

    // ────────────────────────────────────────────────────────────────────────
    // 1. analyze-failure
    // ────────────────────────────────────────────────────────────────────────

    await test('analyze-failure: returns valid failure profile', async () => {
      const { data, error } = await supabase.functions.invoke('analyze-failure', {
        body: {},
      });

      if (error) throw new Error(`Function error: ${error.message}`);
      if (!data) throw new Error('No data returned');

      const { profile, cached } = data;
      if (!profile) throw new Error('Response missing "profile" field');
      if (typeof profile.id !== 'string') throw new Error('profile.id is not a string');

      // Validate required shape
      if (!Array.isArray(profile.failure_patterns))
        throw new Error('profile.failure_patterns is not an array');
      if (!Array.isArray(profile.root_causes))
        throw new Error('profile.root_causes is not an array');
      if (!Array.isArray(profile.recommendations))
        throw new Error('profile.recommendations is not an array');
      if (!profile.personality_insights)
        throw new Error('profile.personality_insights missing');

      console.log(`  ✓ cached=${cached}`);
      console.log(`  ✓ failure_patterns: ${profile.failure_patterns.length}`);
      console.log(`  ✓ root_causes: ${profile.root_causes.length}`);
      console.log(`  ✓ recommendations: ${profile.recommendations.length}`);

      // Confirm row was persisted (or already existed)
      const { data: row, error: dbErr } = await supabase
        .from('habit_failure_profiles')
        .select('id')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();
      if (dbErr || !row) throw new Error('Profile not found in DB after function call');
      console.log(`  ✓ Profile row in DB: ${row.id}`);
    });

    // ── analyze-failure: caching – second call returns cached=true ──────────
    await test('analyze-failure: second call returns cached=true', async () => {
      const { data, error } = await supabase.functions.invoke('analyze-failure', {
        body: {},
      });
      if (error) throw new Error(`Function error: ${error.message}`);
      if (!data?.cached) throw new Error(`Expected cached=true, got cached=${data?.cached}`);
      console.log(`  ✓ Second call correctly cached`);
    });

    // ────────────────────────────────────────────────────────────────────────
    // 2. generate-habits
    // ────────────────────────────────────────────────────────────────────────

    await test('generate-habits: returns valid habit stack', async () => {
      const { data, error } = await supabase.functions.invoke('generate-habits', {
        body: {},
      });

      if (error) throw new Error(`Function error: ${error.message}`);
      if (!data) throw new Error('No data returned');

      const { stack, habits, cached } = data;
      if (!stack) throw new Error('Response missing "stack" field');
      if (!Array.isArray(habits)) throw new Error('"habits" is not an array');
      if (habits.length === 0) throw new Error('No habits generated');

      console.log(`  ✓ cached=${cached}, habits generated: ${habits.length}`);

      // Validate each habit
      for (const h of habits) {
        if (!h.id) throw new Error(`Habit missing id`);
        if (!h.name) throw new Error(`Habit missing name`);
        if (!h.tiny_version) throw new Error(`Habit ${h.id} missing tiny_version`);
        if (!h.anchor) throw new Error(`Habit ${h.id} missing anchor`);
        if (!h.celebration) throw new Error(`Habit ${h.id} missing celebration`);
        if (!Array.isArray(h.days_of_week)) throw new Error(`Habit ${h.id} missing days_of_week`);
      }

      stackId = stack.id;
      habitId = habits[0].id;
      console.log(`  ✓ Stack: ${stackId}`);
      console.log(`  ✓ First habit: "${habits[0].name}"`);

      // Confirm stack is active in DB
      const { data: dbStack, error: dbErr } = await supabase
        .from('habit_stacks')
        .select('is_active')
        .eq('id', stackId)
        .single();
      if (dbErr || !dbStack?.is_active)
        throw new Error('Stack not active in DB after generation');
      console.log(`  ✓ Stack marked active in DB`);
    });

    // ── generate-habits: caching – second call returns cached=true ──────────
    await test('generate-habits: second call returns cached=true', async () => {
      const { data, error } = await supabase.functions.invoke('generate-habits', {
        body: {},
      });
      if (error) throw new Error(`Function error: ${error.message}`);
      if (!data?.cached) throw new Error(`Expected cached=true, got cached=${data?.cached}`);
      console.log(`  ✓ Second call correctly cached`);
    });

    // ────────────────────────────────────────────────────────────────────────
    // 3. weekly-iteration
    // ────────────────────────────────────────────────────────────────────────

    if (!habitId) {
      skip('weekly-iteration: seed logs and analyze', 'No habit ID available from generate-habits');
    } else {
      await test('weekly-iteration: seed 7 days of logs', async () => {
        if (!habitId || !userId) throw new Error('Missing IDs');
        await seedWeeklyLogs(userId, habitId);
        console.log('  ✓ Seeded 7 days of habit logs (5 complete, 2 missed)');
      });

      await test('weekly-iteration: returns valid analysis', async () => {
        const { data, error } = await supabase.functions.invoke('weekly-iteration', {
          body: {},
        });

        if (error) throw new Error(`Function error: ${error.message}`);
        if (!data) throw new Error('No data returned');

        const { iteration_id, completion_stats, insights } = data;
        if (!iteration_id) throw new Error('Response missing iteration_id');
        if (!completion_stats) throw new Error('Response missing completion_stats');
        if (typeof insights !== 'string' || insights.length === 0)
          throw new Error('insights is missing or empty');

        const { total_scheduled, total_completed, completion_rate } = completion_stats;
        if (typeof completion_rate !== 'number')
          throw new Error('completion_rate is not a number');

        console.log(`  ✓ iteration_id: ${iteration_id}`);
        console.log(`  ✓ ${total_completed}/${total_scheduled} completed (${Math.round(completion_rate * 100)}%)`);
        console.log(`  ✓ insights: "${insights.slice(0, 80)}..."`);

        // Confirm row in DB
        const { data: iterRow, error: iterErr } = await supabase
          .from('weekly_iterations')
          .select('id, status')
          .eq('id', iteration_id)
          .single();
        if (iterErr || !iterRow) throw new Error('Iteration row not found in DB');
        if (iterRow.status !== 'pending') throw new Error(`Expected status=pending, got ${iterRow.status}`);
        console.log(`  ✓ Iteration row in DB with status=${iterRow.status}`);
      });
    }

    // ────────────────────────────────────────────────────────────────────────
    // 4. Error handling
    // ────────────────────────────────────────────────────────────────────────

    await test('analyze-failure: missing auth returns 401', async () => {
      // Call the function directly via fetch (bypassing Supabase client auth injection)
      const res = await fetch(`${supabaseUrl}/functions/v1/analyze-failure`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: supabaseKey!,
          // Deliberately omit Authorization
        },
        body: JSON.stringify({}),
      });
      if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
      const body = await res.json();
      if (!body.error) throw new Error('Expected error message in body');
      console.log(`  ✓ Correctly returned 401: ${body.error}`);
    });

    await test('generate-habits: missing auth returns 401', async () => {
      const res = await fetch(`${supabaseUrl}/functions/v1/generate-habits`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: supabaseKey!,
          // Deliberately omit Authorization
        },
        body: JSON.stringify({}),
      });
      if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
      const body = await res.json();
      if (!body.error) throw new Error('Expected error message in body');
      console.log(`  ✓ Correctly returned 401: ${body.error}`);
    });
  } finally {
    if (userId && !reusingUser) await cleanup(userId);
    else if (userId) await supabase.auth.signOut();
  }

  printSummary();
}

function printSummary() {
  console.log('\n=================================');
  console.log('Test Summary');
  console.log('=================================');

  const real = results.filter((r) => !r.skipped);
  const passed = real.filter((r) => r.passed).length;
  const failed = real.filter((r) => !r.passed).length;
  const skipped = results.filter((r) => r.skipped).length;

  console.log(`\nTotal: ${results.length} tests`);
  console.log(`✅ Passed:  ${passed}`);
  console.log(`❌ Failed:  ${failed}`);
  console.log(`⏭️  Skipped: ${skipped}`);

  if (failed > 0) {
    console.log('\nFailed tests:');
    real
      .filter((r) => !r.passed)
      .forEach((r) => console.log(`  - ${r.name}: ${r.error}`));
  }

  const totalDuration = real.reduce((sum, r) => sum + (r.duration || 0), 0);
  console.log(`\nTotal duration: ${totalDuration}ms`);
  console.log('\n=================================');

  if (failed > 0) process.exit(1);
}

runTests().catch((error) => {
  console.error('\n❌ Test suite failed with error:', error);
  process.exit(1);
});
