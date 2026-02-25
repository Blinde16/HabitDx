/**
 * CLI Test Script: Habit Flow
 *
 * Tests the complete habit lifecycle including:
 * - Habit stack and habit creation (with correct schema)
 * - Check-in (complete a habit)
 * - Undo check-in (mark as not-completed)
 * - Obstacle logging
 * - Day-of-week filtering
 * - Streak calculation logic
 * - Soft delete / archive
 *
 * Usage: npm run test:habits
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

async function cleanup(userId: string) {
  console.log(`\n🧹 Cleaning up test data for user ${userId}...`);
  await supabase.from('habit_logs').delete().eq('user_id', userId);
  await supabase.from('habits').delete().eq('user_id', userId);
  await supabase.from('habit_stacks').delete().eq('user_id', userId);
  await supabase.from('habit_failure_profiles').delete().eq('user_id', userId);
  await supabase.from('user_profiles').delete().eq('id', userId);
  await supabase.auth.signOut();
  console.log('  ✓ Cleanup complete');
}

// ISO weekday: Mon=1 … Sun=7 (matches app convention)
function todayISOWeekday(): number {
  const d = new Date().getDay(); // 0=Sun
  return d === 0 ? 7 : d;
}

async function runTests() {
  console.log('=================================');
  console.log('HabitDx Habit Flow Test Suite');
  console.log('=================================');

  const testEmail = `test-habits-${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';
  let testUserId = '';
  let stackId: string | undefined;
  let habitId: string | undefined;
  let offDayHabitId: string | undefined;

  // ── Setup ──────────────────────────────────────────────────────────────────
  console.log('\n📝 Setup: Creating and signing in test user...');
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword,
  });

  if (authError || !authData.user) {
    console.error('❌ Failed to create test user:', authError?.message);
    process.exit(1);
  }
  testUserId = authData.user.id;

  // Some Supabase projects require email confirmation — sign in may return no session
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: testPassword,
  });

  if (signInError || !signInData.session) {
    console.warn(
      '⚠️  Could not sign in (email confirmation may be required).',
      'RLS-protected writes will be skipped.'
    );
  } else {
    console.log(`✓ Signed in as ${testUserId}`);
  }

  try {
    // ── 1. Create User Profile ────────────────────────────────────────────────
    await test('Create user profile with correct schema', async () => {
      const { error } = await supabase.from('user_profiles').upsert(
        {
          id: testUserId,
          full_name: 'Habit Test User',
          past_failures: ['Morning run', 'Journaling'],
          constraints: {
            peak_energy: 'morning',
            schedule_type: ['9-5 job'],
            obstacles: ['fatigue', 'time'],
            failure_description: 'Started too big and burned out',
          },
          goals: ['Become someone who exercises daily'],
          onboarding_completed: true,
        },
        { onConflict: 'id' }
      );
      if (error) throw new Error(error.message);
      console.log('  ✓ Profile created with correct schema');
    });

    // ── 2. Create Habit Stack ─────────────────────────────────────────────────
    await test('Create habit stack', async () => {
      const { data, error } = await supabase
        .from('habit_stacks')
        .insert({
          user_id: testUserId,
          version: 1,
          is_active: true,
          generation_rationale: 'Test stack for habit flow tests',
        })
        .select()
        .single();

      if (error) throw new Error(error.message);
      if (!data) throw new Error('No stack returned');
      stackId = data.id;
      console.log(`  ✓ Stack created: ${stackId}`);
    });

    // ── 3. Create Habit Scheduled Today ──────────────────────────────────────
    await test('Create habit scheduled for today', async () => {
      if (!stackId) throw new Error('No stack ID');
      const today = todayISOWeekday();

      const { data, error } = await supabase
        .from('habits')
        .insert({
          stack_id: stackId,
          user_id: testUserId,
          title: 'Morning push-up',
          name: 'Morning push-up',
          tiny_version: 'Do exactly 1 push-up',
          anchor: 'After I pour my morning coffee',
          celebration: 'Say "I am strong" and smile',
          addresses_pattern: 'All-or-nothing thinking',
          rationale: 'One push-up is so small your brain cannot say no',
          reminder_time: '08:00:00',
          reminder_enabled: true,
          days_of_week: [today],
          is_active: true,
          order_index: 0,
        })
        .select()
        .single();

      if (error) throw new Error(error.message);
      if (!data) throw new Error('No habit returned');
      habitId = data.id;
      console.log(`  ✓ Habit created for today (weekday ${today}): ${habitId}`);
    });

    // ── 4. Create Habit NOT Scheduled Today ───────────────────────────────────
    await test('Create habit NOT scheduled for today', async () => {
      if (!stackId) throw new Error('No stack ID');
      const today = todayISOWeekday();
      // Pick a day that is not today
      const offDay = today === 1 ? 2 : 1;

      const { data, error } = await supabase
        .from('habits')
        .insert({
          stack_id: stackId,
          user_id: testUserId,
          title: 'Off-day habit',
          name: 'Off-day habit',
          tiny_version: 'Smile for 5 seconds',
          anchor: 'After I sit down',
          celebration: 'Fist pump',
          addresses_pattern: 'Low frequency',
          rationale: 'Testing off-day filtering',
          reminder_time: '09:00:00',
          reminder_enabled: false,
          days_of_week: [offDay],
          is_active: true,
          order_index: 1,
        })
        .select()
        .single();

      if (error) throw new Error(error.message);
      if (!data) throw new Error('No habit returned');
      offDayHabitId = data.id;
      console.log(`  ✓ Off-day habit created (scheduled on weekday ${offDay})`);
    });

    // ── 5. Query Habits Scheduled for Today ───────────────────────────────────
    await test('Filter active habits scheduled for today', async () => {
      const today = todayISOWeekday();

      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', testUserId)
        .eq('is_active', true)
        .contains('days_of_week', [today]);

      if (error) throw new Error(error.message);
      if (!data || data.length === 0) throw new Error('Expected at least 1 habit for today');

      const ids = data.map((h) => h.id);
      if (!ids.includes(habitId)) throw new Error('Today-scheduled habit missing from results');
      if (ids.includes(offDayHabitId)) throw new Error('Off-day habit should not be in results');
      console.log(`  ✓ Found ${data.length} habit(s) scheduled for today`);
    });

    // ── 6. Check-in (Complete) ────────────────────────────────────────────────
    await test('Check in (complete) a habit', async () => {
      if (!habitId) throw new Error('No habit ID');
      const today = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('habit_logs')
        .upsert(
          { habit_id: habitId, user_id: testUserId, log_date: today, completed: true },
          { onConflict: 'habit_id,log_date' }
        )
        .select()
        .single();

      if (error) throw new Error(error.message);
      if (!data?.completed) throw new Error('Log not marked as completed');
      console.log(`  ✓ Habit checked in for ${today}: completed=${data.completed}`);
    });

    // ── 7. Read Today's Log ───────────────────────────────────────────────────
    await test('Read today\'s habit log', async () => {
      if (!habitId) throw new Error('No habit ID');
      const today = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('habit_logs')
        .select('*')
        .eq('habit_id', habitId)
        .eq('log_date', today)
        .single();

      if (error) throw new Error(error.message);
      if (!data) throw new Error('Log not found');
      if (!data.completed) throw new Error('Log should be completed=true');
      console.log(`  ✓ Log retrieved: completed=${data.completed}, checked_in_at=${data.checked_in_at}`);
    });

    // ── 8. Undo Check-in ──────────────────────────────────────────────────────
    await test('Undo check-in (mark as not completed)', async () => {
      if (!habitId) throw new Error('No habit ID');
      const today = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('habit_logs')
        .upsert(
          { habit_id: habitId, user_id: testUserId, log_date: today, completed: false },
          { onConflict: 'habit_id,log_date' }
        )
        .select()
        .single();

      if (error) throw new Error(error.message);
      if (data?.completed) throw new Error('Log should be completed=false after undo');
      console.log(`  ✓ Undo applied: completed=${data?.completed}`);
    });

    // ── 9. Log Obstacle ───────────────────────────────────────────────────────
    await test('Log obstacle for a habit', async () => {
      if (!habitId) throw new Error('No habit ID');
      const today = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('habit_logs')
        .upsert(
          {
            habit_id: habitId,
            user_id: testUserId,
            log_date: today,
            completed: false,
            obstacle: 'no_time',
          },
          { onConflict: 'habit_id,log_date' }
        )
        .select()
        .single();

      if (error) throw new Error(error.message);
      if (data?.completed) throw new Error('Log should be completed=false');
      if (data?.obstacle !== 'no_time') throw new Error(`Obstacle not saved; got ${data?.obstacle}`);
      console.log(`  ✓ Obstacle logged: ${data?.obstacle}`);
    });

    // ── 10. Streak Calculation: 0 for missed today ────────────────────────────
    await test('Streak calculation reflects missed day', async () => {
      if (!habitId) throw new Error('No habit ID');

      // Query logs for this habit over 30 days
      const since = new Date();
      since.setDate(since.getDate() - 30);
      const { data, error } = await supabase
        .from('habit_logs')
        .select('log_date, completed')
        .eq('habit_id', habitId)
        .gte('log_date', since.toISOString().split('T')[0])
        .order('log_date', { ascending: false });

      if (error) throw new Error(error.message);

      // Manually compute streak starting from today
      const today = new Date();
      let streak = 0;
      for (let i = 0; i < 30; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const ds = d.toISOString().split('T')[0];
        const log = data?.find((l) => l.log_date === ds);
        if (!log) break;
        if (log.completed) streak++;
        else break;
      }

      if (streak !== 0) throw new Error(`Expected streak=0 (missed today), got ${streak}`);
      console.log(`  ✓ Streak correctly computed as 0 after missed day`);
    });

    // ── 11. Re-complete to Start Streak ───────────────────────────────────────
    await test('Re-complete habit starts streak of 1', async () => {
      if (!habitId) throw new Error('No habit ID');
      const today = new Date().toISOString().split('T')[0];

      // Complete it again
      await supabase
        .from('habit_logs')
        .upsert(
          { habit_id: habitId, user_id: testUserId, log_date: today, completed: true },
          { onConflict: 'habit_id,log_date' }
        );

      // Compute streak
      const since = new Date();
      since.setDate(since.getDate() - 30);
      const { data, error } = await supabase
        .from('habit_logs')
        .select('log_date, completed')
        .eq('habit_id', habitId)
        .gte('log_date', since.toISOString().split('T')[0])
        .order('log_date', { ascending: false });

      if (error) throw new Error(error.message);

      const todayDate = new Date();
      let streak = 0;
      for (let i = 0; i < 30; i++) {
        const d = new Date(todayDate);
        d.setDate(d.getDate() - i);
        const ds = d.toISOString().split('T')[0];
        const log = data?.find((l) => l.log_date === ds);
        if (!log) break;
        if (log.completed) streak++;
        else break;
      }

      if (streak < 1) throw new Error(`Expected streak >= 1, got ${streak}`);
      console.log(`  ✓ Streak correctly computed as ${streak} after re-completion`);
    });

    // ── 12. Soft-delete (archive) a Habit ─────────────────────────────────────
    await test('Soft-delete (archive) a habit', async () => {
      if (!habitId) throw new Error('No habit ID');

      const { data, error } = await supabase
        .from('habits')
        .update({ is_active: false, archived_at: new Date().toISOString() })
        .eq('id', habitId)
        .select()
        .single();

      if (error) throw new Error(error.message);
      if (data?.is_active) throw new Error('Habit should be inactive after archive');
      console.log(`  ✓ Habit archived; is_active=${data?.is_active}`);

      // Confirm it no longer appears in active query
      const { data: active, error: ae } = await supabase
        .from('habits')
        .select('id')
        .eq('user_id', testUserId)
        .eq('is_active', true);

      if (ae) throw new Error(ae.message);
      if (active?.some((h) => h.id === habitId))
        throw new Error('Archived habit still appears in active query');
      console.log(`  ✓ Archived habit excluded from active habits query`);
    });

    // ── 13. Upsert idempotency (second check-in same day) ────────────────────
    await test('Upsert is idempotent: second check-in same day updates row', async () => {
      if (!offDayHabitId) throw new Error('No off-day habit ID');
      const today = new Date().toISOString().split('T')[0];

      // First insert
      await supabase
        .from('habit_logs')
        .upsert(
          { habit_id: offDayHabitId, user_id: testUserId, log_date: today, completed: true },
          { onConflict: 'habit_id,log_date' }
        );

      // Second insert with different value
      const { data, error } = await supabase
        .from('habit_logs')
        .upsert(
          { habit_id: offDayHabitId, user_id: testUserId, log_date: today, completed: false },
          { onConflict: 'habit_id,log_date' }
        )
        .select()
        .single();

      if (error) throw new Error(error.message);
      if (data?.completed !== false) throw new Error('Upsert should update completed to false');

      // Confirm only one row for this habit+date
      const { count } = await supabase
        .from('habit_logs')
        .select('*', { count: 'exact', head: true })
        .eq('habit_id', offDayHabitId)
        .eq('log_date', today);

      if (count !== 1) throw new Error(`Expected 1 log, found ${count}`);
      console.log(`  ✓ Upsert is idempotent: only 1 log row per habit per day`);
    });
  } finally {
    if (testUserId) await cleanup(testUserId);
  }

  // ── Summary ────────────────────────────────────────────────────────────────
  console.log('\n=================================');
  console.log('Test Summary');
  console.log('=================================');

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  const total = results.length;

  console.log(`\nTotal: ${total} tests`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);

  if (failed > 0) {
    console.log('\nFailed tests:');
    results
      .filter((r) => !r.passed)
      .forEach((r) => console.log(`  - ${r.name}: ${r.error}`));
  }

  const totalDuration = results.reduce((sum, r) => sum + (r.duration || 0), 0);
  console.log(`\nTotal duration: ${totalDuration}ms`);
  console.log('\n=================================');

  if (failed > 0) process.exit(1);
}

runTests().catch((error) => {
  console.error('\n❌ Test suite failed with error:', error);
  process.exit(1);
});
