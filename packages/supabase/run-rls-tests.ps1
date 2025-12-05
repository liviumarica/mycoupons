# RLS Test Runner Script (PowerShell)
# This script helps run RLS tests with proper environment setup

Write-Host "🔐 RLS Policy Test Runner" -ForegroundColor Cyan
Write-Host "==========================" -ForegroundColor Cyan
Write-Host ""

# Check if .env.local exists
$envFile = "..\..\apps\web\.env.local"
if (Test-Path $envFile) {
    Write-Host "✅ Found .env.local file" -ForegroundColor Green
    
    # Load environment variables
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^([^#][^=]+)=(.+)$') {
            $name = $matches[1].Trim()
            $value = $matches[2].Trim()
            Set-Item -Path "env:$name" -Value $value
        }
    }
} else {
    Write-Host "⚠️  No .env.local file found at apps\web\.env.local" -ForegroundColor Yellow
}

# Check required environment variables
$missingVars = @()

if (-not $env:NEXT_PUBLIC_SUPABASE_URL) {
    $missingVars += "NEXT_PUBLIC_SUPABASE_URL"
}

if (-not $env:NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    $missingVars += "NEXT_PUBLIC_SUPABASE_ANON_KEY"
}

if (-not $env:SUPABASE_SERVICE_ROLE_KEY) {
    $missingVars += "SUPABASE_SERVICE_ROLE_KEY"
}

if ($missingVars.Count -gt 0) {
    Write-Host ""
    Write-Host "❌ Missing required environment variables:" -ForegroundColor Red
    foreach ($var in $missingVars) {
        Write-Host "   - $var" -ForegroundColor Red
    }
    Write-Host ""
    Write-Host "Please set these variables in apps\web\.env.local or export them:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host '$env:NEXT_PUBLIC_SUPABASE_URL="your-url"' -ForegroundColor Gray
    Write-Host '$env:NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"' -ForegroundColor Gray
    Write-Host '$env:SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"' -ForegroundColor Gray
    Write-Host ""
    exit 1
}

Write-Host "✅ All required environment variables are set" -ForegroundColor Green
Write-Host ""
Write-Host "🧪 Running RLS policy tests..." -ForegroundColor Cyan
Write-Host ""

# Run the tests
pnpm test

# Capture exit code
$testExitCode = $LASTEXITCODE

Write-Host ""
if ($testExitCode -eq 0) {
    Write-Host "✅ All RLS tests passed!" -ForegroundColor Green
} else {
    Write-Host "❌ Some tests failed. Please review the output above." -ForegroundColor Red
    Write-Host ""
    Write-Host "Common issues:" -ForegroundColor Yellow
    Write-Host "  - Test users don't exist (create them in Supabase dashboard)" -ForegroundColor Yellow
    Write-Host "  - RLS policies not configured correctly" -ForegroundColor Yellow
    Write-Host "  - Storage bucket 'coupon-images' doesn't exist" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "See RLS_TESTING_GUIDE.md for troubleshooting help." -ForegroundColor Yellow
}

exit $testExitCode
