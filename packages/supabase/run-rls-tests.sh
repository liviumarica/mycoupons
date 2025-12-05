#!/bin/bash

# RLS Test Runner Script
# This script helps run RLS tests with proper environment setup

echo "🔐 RLS Policy Test Runner"
echo "=========================="
echo ""

# Check if .env.local exists
if [ -f "../../apps/web/.env.local" ]; then
    echo "✅ Found .env.local file"
    # Load environment variables
    export $(cat ../../apps/web/.env.local | grep -v '^#' | xargs)
else
    echo "⚠️  No .env.local file found at apps/web/.env.local"
fi

# Check required environment variables
MISSING_VARS=()

if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
    MISSING_VARS+=("NEXT_PUBLIC_SUPABASE_URL")
fi

if [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
    MISSING_VARS+=("NEXT_PUBLIC_SUPABASE_ANON_KEY")
fi

if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    MISSING_VARS+=("SUPABASE_SERVICE_ROLE_KEY")
fi

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    echo ""
    echo "❌ Missing required environment variables:"
    for var in "${MISSING_VARS[@]}"; do
        echo "   - $var"
    done
    echo ""
    echo "Please set these variables in apps/web/.env.local or export them:"
    echo ""
    echo "export NEXT_PUBLIC_SUPABASE_URL=\"your-url\""
    echo "export NEXT_PUBLIC_SUPABASE_ANON_KEY=\"your-anon-key\""
    echo "export SUPABASE_SERVICE_ROLE_KEY=\"your-service-role-key\""
    echo ""
    exit 1
fi

echo "✅ All required environment variables are set"
echo ""
echo "🧪 Running RLS policy tests..."
echo ""

# Run the tests
pnpm test

# Capture exit code
TEST_EXIT_CODE=$?

echo ""
if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo "✅ All RLS tests passed!"
else
    echo "❌ Some tests failed. Please review the output above."
    echo ""
    echo "Common issues:"
    echo "  - Test users don't exist (create them in Supabase dashboard)"
    echo "  - RLS policies not configured correctly"
    echo "  - Storage bucket 'coupon-images' doesn't exist"
    echo ""
    echo "See RLS_TESTING_GUIDE.md for troubleshooting help."
fi

exit $TEST_EXIT_CODE
