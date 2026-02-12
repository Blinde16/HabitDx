/**
 * Script to run database migrations
 * This connects to Supabase and executes all migration files
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigrations() {
  console.log('🚀 Starting database migrations...\n');

  const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');
  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  console.log(`Found ${files.length} migration files:\n`);
  files.forEach((f) => console.log(`  - ${f}`));
  console.log('');

  for (const file of files) {
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf-8');

    console.log(`📝 Running: ${file}...`);

    try {
      // Note: This requires a service role key to execute raw SQL
      // For now, this script documents what needs to be run
      console.log(`   ⚠️  Cannot execute via anon key - needs service role key`);
      console.log(`   📋 SQL Preview (first 100 chars):`);
      console.log(`   ${sql.substring(0, 100)}...`);
      console.log('');
    } catch (error) {
      console.error(`   ❌ Error: ${error}`);
      console.log('');
    }
  }

  console.log('\n📌 IMPORTANT:');
  console.log('These migrations need to be run via Supabase Dashboard SQL Editor');
  console.log('or with Supabase CLI using a service role key.\n');
  console.log('To run via Dashboard:');
  console.log('1. Go to https://supabase.com/dashboard');
  console.log('2. Select your project');
  console.log('3. Go to SQL Editor');
  console.log('4. Copy and paste each migration file');
  console.log('5. Click "Run"\n');
}

runMigrations().catch(console.error);
