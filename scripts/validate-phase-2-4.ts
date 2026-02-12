/**
 * Validation script for Phases 2-4
 * Tests what can be tested without running the full app
 */

import * as fs from 'fs';
import * as path from 'path';

console.log('🧪 Validating Phases 2-4...\n');

let passCount = 0;
let failCount = 0;

function test(name: string, condition: boolean) {
  if (condition) {
    console.log(`✅ ${name}`);
    passCount++;
  } else {
    console.log(`❌ ${name}`);
    failCount++;
  }
}

function fileExists(filePath: string): boolean {
  return fs.existsSync(path.join(__dirname, '..', filePath));
}

// ============================================================================
// PHASE 2: Authentication
// ============================================================================
console.log('📝 Phase 2: Authentication\n');

test('Auth store exists', fileExists('src/stores/authStore.ts'));
test('Login screen exists', fileExists('src/app/(auth)/login.tsx'));
test('Signup screen exists', fileExists('src/app/(auth)/signup.tsx'));
test('Forgot password screen exists', fileExists('src/app/(auth)/forgot-password.tsx'));
test('Reset password screen exists', fileExists('src/app/(auth)/reset-password.tsx'));
test('OAuth callback screen exists', fileExists('src/app/(auth)/callback.tsx'));
test('Auth layout exists', fileExists('src/app/(auth)/_layout.tsx'));
test('AuthInput component exists', fileExists('src/components/auth/AuthInput.tsx'));
test('AuthButton component exists', fileExists('src/components/auth/AuthButton.tsx'));
test('SocialButton component exists', fileExists('src/components/auth/SocialButton.tsx'));
test('ErrorMessage component exists', fileExists('src/components/auth/ErrorMessage.tsx'));
test('LoadingSpinner component exists', fileExists('src/components/auth/LoadingSpinner.tsx'));
test('ProtectedRoute component exists', fileExists('src/components/ProtectedRoute.tsx'));
test('Supabase client updated', fileExists('src/lib/supabase.ts'));
test('Validation utils exist', fileExists('src/utils/validation.ts'));

console.log('');

// ============================================================================
// PHASE 3: Database & Profile
// ============================================================================
console.log('📝 Phase 3: Database & Profile\n');

test(
  'Migration 1: user_profiles',
  fileExists('supabase/migrations/20260212000001_create_user_profiles.sql')
);
test(
  'Migration 2: habit_failure_profiles',
  fileExists('supabase/migrations/20260212000002_create_habit_failure_profiles.sql')
);
test(
  'Migration 3: habit_stacks',
  fileExists('supabase/migrations/20260212000003_create_habit_stacks.sql')
);
test('Migration 4: habits', fileExists('supabase/migrations/20260212000004_create_habits.sql'));
test(
  'Migration 5: habit_logs',
  fileExists('supabase/migrations/20260212000005_create_habit_logs.sql')
);
test(
  'Migration 6: weekly_iterations',
  fileExists('supabase/migrations/20260212000006_create_weekly_iterations.sql')
);
test(
  'Migration 7: functions and triggers',
  fileExists('supabase/migrations/20260212000007_create_functions_and_triggers.sql')
);
test(
  'Migration 8: RLS policies',
  fileExists('supabase/migrations/20260212000008_create_rls_policies.sql')
);
test('Consolidated migration exists', fileExists('supabase/migrations/00_run_all_migrations.sql'));
test('Database types defined', fileExists('src/types/database.ts'));
test('Database service layer exists', fileExists('src/lib/db.ts'));
test('Profile screen exists', fileExists('src/app/profile.tsx'));

console.log('');

// ============================================================================
// PHASE 4: Onboarding
// ============================================================================
console.log('📝 Phase 4: Onboarding\n');

test('Onboarding store exists', fileExists('src/stores/onboardingStore.ts'));
test('Onboarding layout exists', fileExists('src/app/(onboarding)/_layout.tsx'));
test('Welcome screen exists', fileExists('src/app/(onboarding)/welcome.tsx'));
test('Past failures screen exists', fileExists('src/app/(onboarding)/past-failures.tsx'));
test('Constraints screen exists', fileExists('src/app/(onboarding)/constraints.tsx'));
test('Goals screen exists', fileExists('src/app/(onboarding)/goals.tsx'));
test('Confirmation screen exists', fileExists('src/app/(onboarding)/confirmation.tsx'));
test(
  'OnboardingContainer component exists',
  fileExists('src/components/onboarding/OnboardingContainer.tsx')
);
test(
  'ProgressIndicator component exists',
  fileExists('src/components/onboarding/ProgressIndicator.tsx')
);
test(
  'MultiSelectChip component exists',
  fileExists('src/components/onboarding/MultiSelectChip.tsx')
);
test(
  'CharacterCounter component exists',
  fileExists('src/components/onboarding/CharacterCounter.tsx')
);

console.log('');

// ============================================================================
// VALIDATION LOGIC TESTS
// ============================================================================
console.log('📝 Validation Logic Tests\n');

// Test validation functions exist
const validationPath = path.join(__dirname, '..', 'src/utils/validation.ts');
if (fs.existsSync(validationPath)) {
  const validationContent = fs.readFileSync(validationPath, 'utf-8');
  test('validateEmail function exists', validationContent.includes('validateEmail'));
  test('validatePassword function exists', validationContent.includes('validatePassword'));
  test(
    'validatePasswordMatch function exists',
    validationContent.includes('validatePasswordMatch')
  );
  test('getPasswordStrength function exists', validationContent.includes('getPasswordStrength'));
} else {
  test('Validation file exists', false);
}

console.log('');

// ============================================================================
// SUMMARY
// ============================================================================
console.log('═'.repeat(60));
console.log(`\n📊 Test Results: ${passCount} passed, ${failCount} failed\n`);

if (failCount === 0) {
  console.log('✅ All file structure tests passed!\n');
  console.log('⚠️  Manual testing still required:');
  console.log('   1. Run migrations in Supabase Dashboard');
  console.log('   2. Test authentication flows');
  console.log('   3. Test profile editing');
  console.log('   4. Test onboarding flow');
  console.log('   5. Test RLS policies with multiple users\n');
} else {
  console.log('❌ Some tests failed. Review the output above.\n');
  process.exit(1);
}
