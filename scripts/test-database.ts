/**
 * CLI Test Script: Database Operations
 * 
 * Tests database CRUD operations including:
 * - User profile creation
 * - Onboarding data storage
 * - Habit creation
 * - Habit logging (check-ins)
 * 
 * Usage: npm run test:database
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { logDatabase, logError, logInfo } from '../src/lib/logger';

// Load environment variables
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
  try {
    console.log(`🧹 Cleanup: Deleting test data for user ${userId}`);
    
    // Delete in reverse order of foreign keys
    await supabase.from('habit_logs').delete().eq('user_id', userId);
    await supabase.from('habits').delete().eq('user_id', userId);
    await supabase.from('habit_stacks').delete().eq('user_id', userId);
    await supabase.from('habit_failure_profiles').delete().eq('user_id', userId);
    await supabase.from('user_profiles').delete().eq('id', userId);
    
    console.log('  ✓ Cleanup complete');
  } catch (error) {
    console.log('⚠️ Cleanup failed:', error);
  }
}

async function runTests() {
  console.log('=================================');
  console.log('HabitDx Database Test Suite');
  console.log('=================================');
  
  // First, create a test user
  const testEmail = `test-db-${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';
  let testUserId = '';
  let habitStackId: string | undefined;
  let habitId: string | undefined;
  
  console.log('\n📝 Setup: Creating test user...');
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword,
  });
  
  if (authError || !authData.user) {
    console.error('❌ Failed to create test user:', authError);
    process.exit(1);
  }
  
  testUserId = authData.user.id;
  console.log(`✓ Test user created: ${testUserId}`);
  
  // Sign in to get session for RLS
  await supabase.auth.signInWithPassword({
    email: testEmail,
    password: testPassword,
  });
  
  try {
    // Test 1: Create User Profile
    await test('Create user profile', async () => {
      logDatabase.queryStart('user_profiles', 'insert');
      
      const profileData = {
        id: testUserId,
        full_name: 'Test User',
        past_failures: ['Morning workout', 'Meditation'],
        constraints: {
          peak_energy: 'evening',
          schedule_type: ['9-5 job'],
          obstacles: ['work', 'commute'],
          failure_description: 'Too tired in the morning',
        },
        goals: ['I want to be someone who takes care of their health'],
        onboarding_completed: true,
      };
      
      const { data, error } = await supabase
        .from('user_profiles')
        .insert(profileData)
        .select()
        .single();
      
      if (error) {
        logDatabase.queryError('user_profiles', 'insert', error);
        throw error;
      }
      
      logDatabase.querySuccess('user_profiles', 'insert', 1);
      console.log(`  ✓ Profile created for user: ${data.id}`);
    });
    
    // Test 2: Read User Profile
    await test('Read user profile', async () => {
      logDatabase.queryStart('user_profiles', 'select');
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', testUserId)
        .single();
      
      if (error) {
        logDatabase.queryError('user_profiles', 'select', error);
        throw error;
      }
      
      if (!data) {
        throw new Error('Profile not found');
      }
      
      logDatabase.querySuccess('user_profiles', 'select', 1);
      console.log(`  ✓ Profile retrieved: ${data.full_name}`);
      console.log(`  ✓ Constraints: ${JSON.stringify(data.constraints)}`);
      console.log(`  ✓ Past failures count: ${data.past_failures?.length || 0}`);
    });
    
    // Test 3: Create Habit Failure Profile
    await test('Create habit failure profile', async () => {
      logDatabase.queryStart('habit_failure_profiles', 'insert');
      
      const profileData = {
        user_id: testUserId,
        failure_patterns: [
          {
            pattern: 'Morning Energy Mismatch',
            description: 'Trying morning habits as an evening person',
            frequency: 'high'
          }
        ],
        root_causes: ['Scheduling against natural energy', 'Habit scope too large'],
        personality_insights: 'Evening-oriented person attempting morning-heavy routines',
        recommendations: ['Shift habits to evening', 'Start with 2-minute versions'],
        model_used: 'test-mode',
        tokens_used: 0,
      };
      
      const { data, error } = await supabase
        .from('habit_failure_profiles')
        .insert(profileData)
        .select()
        .single();
      
      if (error) {
        logDatabase.queryError('habit_failure_profiles', 'insert', error);
        throw error;
      }
      
      logDatabase.querySuccess('habit_failure_profiles', 'insert', 1);
      console.log(`  ✓ Failure profile created: ${data.id}`);
    });
    
    // Test 4: Create Habit Stack
    await test('Create habit stack', async () => {
      logDatabase.queryStart('habit_stacks', 'insert');
      
      const stackData = {
        user_id: testUserId,
        version: 1,
        is_active: true,
        generation_rationale: 'Test habit stack for database validation',
      };
      
      const { data, error } = await supabase
        .from('habit_stacks')
        .insert(stackData)
        .select()
        .single();
      
      if (error) {
        logDatabase.queryError('habit_stacks', 'insert', error);
        throw error;
      }
      
      habitStackId = data.id;
      logDatabase.querySuccess('habit_stacks', 'insert', 1);
      console.log(`  ✓ Habit stack created: ${data.id}`);
    });
    
    // Test 5: Create Habit
    await test('Create habit', async () => {
      if (!habitStackId) {
        throw new Error('No habit stack ID available');
      }
      
      logDatabase.queryStart('habits', 'insert');
      
      const habitData = {
        stack_id: habitStackId,
        user_id: testUserId,
        title: 'Evening stretch',
        name: 'Evening stretch',
        tiny_version: 'One stretch, 30 seconds',
        anchor: 'After I close my laptop',
        celebration: 'Take a deep breath and smile',
        addresses_pattern: 'Morning Energy Mismatch',
        rationale: 'This works for you because it fits your evening energy pattern',
        reminder_enabled: true,
        reminder_time: '19:00:00',
        days_of_week: [1, 2, 3, 4, 5],
        is_active: true,
        order_index: 0,
      };
      
      const { data, error } = await supabase
        .from('habits')
        .insert(habitData)
        .select()
        .single();
      
      if (error) {
        logDatabase.queryError('habits', 'insert', error);
        throw error;
      }
      
      habitId = data.id;
      logDatabase.querySuccess('habits', 'insert', 1);
      console.log(`  ✓ Habit created: ${data.name} (${data.id})`);
    });
    
    // Test 6: Create Habit Log (check-in)
    await test('Create habit log (check-in)', async () => {
      if (!habitId) {
        throw new Error('No habit ID available');
      }
      
      logDatabase.queryStart('habit_logs', 'insert');
      
      const logData = {
        habit_id: habitId,
        user_id: testUserId,
        log_date: new Date().toISOString().split('T')[0],
        completed: true,
        obstacle: null,
      };
      
      const { data, error } = await supabase
        .from('habit_logs')
        .insert(logData)
        .select()
        .single();
      
      if (error) {
        logDatabase.queryError('habit_logs', 'insert', error);
        throw error;
      }
      
      logDatabase.querySuccess('habit_logs', 'insert', 1);
      console.log(`  ✓ Habit log created: ${data.id}`);
      console.log(`  ✓ Completed: ${data.completed}`);
    });
    
    // Test 7: Query habits for user
    await test('Query all habits for user', async () => {
      logDatabase.queryStart('habits', 'select');
      
      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', testUserId)
        .eq('is_active', true);
      
      if (error) {
        logDatabase.queryError('habits', 'select', error);
        throw error;
      }
      
      logDatabase.querySuccess('habits', 'select', data?.length);
      console.log(`  ✓ Found ${data?.length || 0} active habits`);
    });
    
    // Test 8: Query habit logs for date range
    await test('Query habit logs for date range', async () => {
      const today = new Date().toISOString().split('T')[0];
      
      logDatabase.queryStart('habit_logs', 'select');
      
      const { data, error } = await supabase
        .from('habit_logs')
        .select('*')
        .eq('user_id', testUserId)
        .eq('log_date', today);
      
      if (error) {
        logDatabase.queryError('habit_logs', 'select', error);
        throw error;
      }
      
      logDatabase.querySuccess('habit_logs', 'select', data?.length);
      console.log(`  ✓ Found ${data?.length || 0} logs for today`);
    });
    
    // Test 9: Update habit
    await test('Update habit', async () => {
      if (!habitId) {
        throw new Error('No habit ID available');
      }
      
      logDatabase.queryStart('habits', 'update');
      
      const { data, error } = await supabase
        .from('habits')
        .update({ reminder_enabled: false })
        .eq('id', habitId)
        .select()
        .single();
      
      if (error) {
        logDatabase.queryError('habits', 'update', error);
        throw error;
      }
      
      logDatabase.querySuccess('habits', 'update', 1);
      console.log(`  ✓ Habit updated: reminder_enabled = ${data.reminder_enabled}`);
    });
    
    // Test 10: Delete habit log
    await test('Delete habit log', async () => {
      if (!habitId) {
        throw new Error('No habit ID available');
      }
      
      logDatabase.queryStart('habit_logs', 'delete');
      
      const { error } = await supabase
        .from('habit_logs')
        .delete()
        .eq('habit_id', habitId);
      
      if (error) {
        logDatabase.queryError('habit_logs', 'delete', error);
        throw error;
      }
      
      logDatabase.querySuccess('habit_logs', 'delete');
      console.log(`  ✓ Habit log deleted`);
    });
    
  } finally {
    // Cleanup
    if (testUserId) {
      await cleanup(testUserId);
    }
    
    // Sign out
    await supabase.auth.signOut();
  }
  
  // Summary
  console.log('\n=================================');
  console.log('Test Summary');
  console.log('=================================');
  
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const total = results.length;
  
  console.log(`\nTotal: ${total} tests`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  
  if (failed > 0) {
    console.log('\nFailed tests:');
    results
      .filter(r => !r.passed)
      .forEach(r => {
        console.log(`  - ${r.name}: ${r.error}`);
      });
  }
  
  const totalDuration = results.reduce((sum, r) => sum + (r.duration || 0), 0);
  console.log(`\nTotal duration: ${totalDuration}ms`);
  
  console.log('\n=================================');
  
  // Exit with error code if tests failed
  if (failed > 0) {
    process.exit(1);
  }
}

// Run tests
runTests().catch((error) => {
  console.error('\n❌ Test suite failed with error:', error);
  logError(error, { context: 'database_tests' });
  process.exit(1);
});
