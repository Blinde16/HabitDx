import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

console.log('🔍 Testing Supabase Connection...\n');
console.log('URL:', supabaseUrl ? '✓ Configured' : '✗ Missing');
console.log('Anon Key:', supabaseAnonKey ? '✓ Configured' : '✗ Missing');
console.log('');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Error: Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    console.log('🔌 Attempting to connect to Supabase...');

    // Test 1: Basic connection by querying system tables
    const { data, error } = await supabase.from('_test_').select('*').limit(1);

    if (error) {
      // If we get "relation does not exist" or "Could not find the table", connection is working (no tables yet)
      if (
        error.message.includes('relation') ||
        error.message.includes('does not exist') ||
        error.message.includes('Could not find the table') ||
        error.message.includes('schema cache') ||
        error.code === '42P01' ||
        error.code === 'PGRST204'
      ) {
        console.log('✅ Connection successful!');
        console.log('   (Table does not exist, which is expected for Phase 1)');
        console.log('   Connection to Supabase cloud instance verified!');
        return true;
      }

      // Check for permission errors (also means connection works)
      if (error.message.includes('permission') || error.code === '42501') {
        console.log('✅ Connection successful!');
        console.log('   (Permission error means connection works, just no access to this table)');
        return true;
      }

      console.error('❌ Connection error:', error.message);
      console.error('   Error code:', error.code);
      return false;
    }

    console.log('✅ Connection successful!');
    if (data) {
      console.log('   Data retrieved:', data.length, 'rows');
    }
    return true;
  } catch (err) {
    console.error('❌ Connection test failed:', err);
    return false;
  }
}

testConnection()
  .then((success) => {
    console.log('');
    if (success) {
      console.log('🎉 Supabase is ready to use!');
      process.exit(0);
    } else {
      console.log('💔 Supabase connection failed. Check your credentials.');
      process.exit(1);
    }
  })
  .catch((err) => {
    console.error('Unexpected error:', err);
    process.exit(1);
  });
