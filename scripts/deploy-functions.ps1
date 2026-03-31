# HabitDx - Deploy Edge Functions to Supabase (Windows)
# PowerShell version (ASCII-safe)

Write-Host "Deploying HabitDx Edge Functions to Supabase..." -ForegroundColor Cyan

# Check if Supabase CLI is installed
if (-not (Get-Command supabase -ErrorAction SilentlyContinue)) {
    Write-Host "Supabase CLI is not installed or not on PATH." -ForegroundColor Red
    Write-Host "Install it with Scoop or add it to PATH, then retry." -ForegroundColor Yellow
    exit 1
}

# Load environment variables
if (-not (Test-Path .env)) {
    Write-Host ".env file not found!" -ForegroundColor Red
    Write-Host "Please create a .env file with your OPENAI_API_KEY" -ForegroundColor Yellow
    exit 1
}

# Read .env file and set environment variables
Get-Content .env | ForEach-Object {
    if ($_ -match '^([^#][^=]+)=(.+)$') {
        $name = $matches[1].Trim()
        $value = $matches[2].Trim()
        Set-Item -Path "env:$name" -Value $value
    }
}

# Check if OpenAI API key is set
if (-not $env:OPENAI_API_KEY) {
    Write-Host "OPENAI_API_KEY not found in .env file" -ForegroundColor Red
    Write-Host "Please add: OPENAI_API_KEY=your_key_here" -ForegroundColor Yellow
    exit 1
}

Write-Host "Environment variables loaded" -ForegroundColor Green

# Check if logged in to Supabase
$loginCheck = supabase projects list 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Not logged in to Supabase" -ForegroundColor Red
    Write-Host "Run: supabase login (or set SUPABASE_ACCESS_TOKEN)" -ForegroundColor Yellow
    exit 1
}

Write-Host "Authenticated with Supabase" -ForegroundColor Green

# Optional: Link to your project (you'll need to run this once)
Write-Host "If not linked yet, run: supabase link --project-ref wfslsrknguculwuplshq" -ForegroundColor Blue

Write-Host "Deploying analyze-failure function..." -ForegroundColor Cyan
supabase functions deploy analyze-failure --no-verify-jwt

Write-Host "Deploying onboarding-chat function..." -ForegroundColor Cyan
supabase functions deploy onboarding-chat --no-verify-jwt

Write-Host "Deploying generate-habits function..." -ForegroundColor Cyan
supabase functions deploy generate-habits --no-verify-jwt

Write-Host "Deploying weekly-iteration function..." -ForegroundColor Cyan
supabase functions deploy weekly-iteration --no-verify-jwt

Write-Host "Deploying delete-account function..." -ForegroundColor Cyan
supabase functions deploy delete-account

Write-Host "Setting OPENAI_API_KEY secret..." -ForegroundColor Cyan
supabase secrets set OPENAI_API_KEY="$env:OPENAI_API_KEY"

Write-Host ""
Write-Host "Deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Test your functions:" -ForegroundColor Yellow
Write-Host "  Invoke-WebRequest -Uri 'https://wfslsrknguculwuplshq.supabase.co/functions/v1/analyze-failure' ``"
Write-Host "    -Method POST ``"
Write-Host "    -Headers @{'Authorization'='Bearer YOUR_USER_TOKEN'; 'Content-Type'='application/json'}"
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Test the app with: npm start"
Write-Host "  2. Open in browser: http://localhost:19006"
Write-Host "  3. Sign up and complete onboarding"
Write-Host ""
