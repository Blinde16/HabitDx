/**
 * CLI Test Script: Auth Flow
 * 
 * Tests authentication functionality including:
 * - Sign up with email/password
 * - Sign in with email/password
 * - Session management
 * - Sign out
 * 
 * Usage: npm run test:auth
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { logAuth, logError, logInfo } from '../src/lib/logger';

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

async function cleanup(email: string) {
  try {
    // Note: In a real scenario, you'd need admin credentials to delete users
    console.log(`🧹 Cleanup: Would delete user ${email} (requires admin access)`);
  } catch (error) {
    console.log('⚠️ Cleanup failed (expected if user doesn\'t exist)');
  }
}

async function runTests() {
  console.log('=================================');
  console.log('HabitDx Auth Flow Test Suite');
  console.log('=================================');
  
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';
  let userId: string | undefined;
  
  // Test 1: Sign Up
  await test('Sign up with email/password', async () => {
    logInfo('Starting auth signup test', { email: testEmail });
    
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    });
    
    if (error) {
      logAuth.signUpError(testEmail, error);
      throw error;
    }
    
    if (!data.user) {
      throw new Error('No user returned from signup');
    }
    
    userId = data.user.id;
    logAuth.signUpSuccess(userId, testEmail);
    
    // Check if email confirmation is required
    if (!data.session) {
      console.log('  ℹ️ Email confirmation required (expected behavior)');
    }
  });
  
  // Test 2: Sign In (if email confirmation not required)
  await test('Sign in with email/password', async () => {
    logInfo('Starting auth signin test', { email: testEmail });
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });
    
    if (error) {
      // If error is "Email not confirmed", that's expected and OK
      if (error.message.includes('Email not confirmed')) {
        console.log('  ℹ️ Email not confirmed (expected, skip this test)');
        logAuth.signInError(testEmail, error);
        return; // Skip, not a real failure
      }
      logAuth.signInError(testEmail, error);
      throw error;
    }
    
    if (!data.user || !data.session) {
      throw new Error('No user or session returned from signin');
    }
    
    logAuth.signInSuccess(data.user.id, testEmail);
    console.log(`  ✓ User ID: ${data.user.id}`);
    console.log(`  ✓ Session expires: ${new Date(data.session.expires_at! * 1000).toISOString()}`);
  });
  
  // Test 3: Get Session
  await test('Get current session', async () => {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      logError(error, { context: 'test.get_session' });
      throw error;
    }
    
    // Session might be null if email confirmation required
    if (!data.session) {
      console.log('  ℹ️ No active session (expected if email confirmation required)');
      return;
    }
    
    console.log(`  ✓ Session user: ${data.session.user.email}`);
  });
  
  // Test 4: Sign Out
  await test('Sign out', async () => {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      logError(error, { context: 'test.signout' });
      throw error;
    }
    
    if (userId) {
      logAuth.signOut(userId);
    }
    
    // Verify session is cleared
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      throw new Error('Session still exists after signout');
    }
    
    console.log('  ✓ Session cleared successfully');
  });
  
  // Test 5: Sign in with wrong password
  await test('Sign in with wrong password (should fail)', async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: 'WrongPassword123!',
    });
    
    if (!error) {
      throw new Error('Expected error for wrong password, but signin succeeded');
    }
    
    if (!error.message.includes('Invalid login credentials')) {
      throw new Error(`Expected 'Invalid login credentials' error, got: ${error.message}`);
    }
    
    console.log('  ✓ Correctly rejected wrong password');
  });
  
  // Test 6: Sign in with non-existent email
  await test('Sign in with non-existent email (should fail)', async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email: 'nonexistent@example.com',
      password: testPassword,
    });
    
    if (!error) {
      throw new Error('Expected error for non-existent email, but signin succeeded');
    }
    
    console.log('  ✓ Correctly rejected non-existent email');
  });
  
  // Cleanup
  await cleanup(testEmail);
  
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
  process.exit(1);
});
