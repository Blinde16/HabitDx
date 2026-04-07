#!/bin/bash

# HabitDx - Deploy Edge Functions to Supabase
# This script deploys all Edge Functions with the correct environment variables

echo "🚀 Deploying HabitDx Edge Functions to Supabase..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed."
    echo "📦 Install it with: npm install -g supabase"
    exit 1
fi

# Load environment variables
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "Please create a .env file with your OPENAI_API_KEY"
    exit 1
fi

# Source the .env file
export $(cat .env | grep -v '^#' | xargs)

# Check if OpenAI API key is set
if [ -z "$OPENAI_API_KEY" ]; then
    echo "❌ OPENAI_API_KEY not found in .env file"
    echo "Please add: OPENAI_API_KEY=your_key_here"
    exit 1
fi

echo "✅ Environment variables loaded"

# Check if logged in to Supabase
if ! supabase projects list &> /dev/null; then
    echo "❌ Not logged in to Supabase"
    echo "Run: supabase login"
    exit 1
fi

echo "✅ Authenticated with Supabase"

# Link to your project (you'll need to run this once)
# supabase link --project-ref wfslsrknguculwuplshq

echo "📤 Deploying analyze-failure function..."
supabase functions deploy analyze-failure --no-verify-jwt

echo "📤 Deploying onboarding-chat function..."
supabase functions deploy onboarding-chat --no-verify-jwt

echo "📤 Deploying generate-habits function..."
supabase functions deploy generate-habits --no-verify-jwt

echo "📤 Deploying weekly-iteration function..."
supabase functions deploy weekly-iteration --no-verify-jwt

echo "📤 Deploying delete-account function..."
supabase functions deploy delete-account --no-verify-jwt

echo "🔐 Setting OPENAI_API_KEY secret..."
supabase secrets set OPENAI_API_KEY="$OPENAI_API_KEY"

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🧪 Test your functions:"
echo "  curl -i --location --request POST 'https://wfslsrknguculwuplshq.supabase.co/functions/v1/analyze-failure' \\"
echo "    --header 'Authorization: Bearer YOUR_USER_TOKEN' \\"
echo "    --header 'Content-Type: application/json'"
echo ""
echo "📝 Next steps:"
echo "  1. Test the app with: npm start"
echo "  2. Open in browser: http://localhost:19006"
echo "  3. Sign up and complete onboarding"
echo ""
