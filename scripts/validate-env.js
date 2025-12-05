#!/usr/bin/env node

/**
 * Environment Variable Validation Script
 * 
 * Validates that all required environment variables are set
 * Run before deployment to catch configuration issues early
 */

const required = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'OPENAI_API_KEY',
  'NEXT_PUBLIC_VAPID_PUBLIC_KEY',
  'VAPID_PRIVATE_KEY'
]

const optional = [
  'NEXT_PUBLIC_APP_URL',
  'NODE_ENV',
  'NEXT_PUBLIC_DEBUG'
]

console.log('🔍 Validating environment variables...\n')

// Check required variables
const missing = required.filter(key => !process.env[key])
const present = required.filter(key => process.env[key])

// Check optional variables
const optionalPresent = optional.filter(key => process.env[key])
const optionalMissing = optional.filter(key => !process.env[key])

// Display results
console.log('Required Variables:')
present.forEach(key => {
  const value = process.env[key]
  const masked = maskValue(key, value)
  console.log(`  ✅ ${key}: ${masked}`)
})

if (missing.length > 0) {
  console.log('\n❌ Missing required environment variables:')
  missing.forEach(key => console.log(`  ❌ ${key}`))
}

console.log('\nOptional Variables:')
optionalPresent.forEach(key => {
  const value = process.env[key]
  console.log(`  ✅ ${key}: ${value}`)
})

if (optionalMissing.length > 0) {
  optionalMissing.forEach(key => {
    console.log(`  ⚠️  ${key}: not set (using default)`)
  })
}

// Validate formats
console.log('\n🔍 Validating formats...')

const validations = [
  {
    key: 'NEXT_PUBLIC_SUPABASE_URL',
    test: (val) => val && val.startsWith('https://') && val.includes('.supabase.co'),
    message: 'Should be a valid Supabase URL (https://xxx.supabase.co)'
  },
  {
    key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    test: (val) => val && val.startsWith('eyJ'),
    message: 'Should be a valid JWT token (starts with eyJ)'
  },
  {
    key: 'SUPABASE_SERVICE_ROLE_KEY',
    test: (val) => val && val.startsWith('eyJ'),
    message: 'Should be a valid JWT token (starts with eyJ)'
  },
  {
    key: 'OPENAI_API_KEY',
    test: (val) => val && (val.startsWith('sk-') || val.startsWith('sk-proj-')),
    message: 'Should start with sk- or sk-proj-'
  },
  {
    key: 'NEXT_PUBLIC_VAPID_PUBLIC_KEY',
    test: (val) => val && val.startsWith('B') && val.length > 80,
    message: 'Should be a base64 string starting with B'
  },
  {
    key: 'VAPID_PRIVATE_KEY',
    test: (val) => val && val.length > 40,
    message: 'Should be a base64 string'
  }
]

let formatErrors = 0

validations.forEach(({ key, test, message }) => {
  const value = process.env[key]
  if (value) {
    if (test(value)) {
      console.log(`  ✅ ${key}: format valid`)
    } else {
      console.log(`  ❌ ${key}: ${message}`)
      formatErrors++
    }
  }
})

// Security checks
console.log('\n🔒 Security checks...')

const securityChecks = [
  {
    name: 'Service role key not exposed to client',
    test: () => !process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY,
    message: 'Service role key should not have NEXT_PUBLIC_ prefix'
  },
  {
    name: 'OpenAI key not exposed to client',
    test: () => !process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    message: 'OpenAI key should not have NEXT_PUBLIC_ prefix'
  },
  {
    name: 'VAPID private key not exposed to client',
    test: () => !process.env.NEXT_PUBLIC_VAPID_PRIVATE_KEY,
    message: 'VAPID private key should not have NEXT_PUBLIC_ prefix'
  }
]

let securityErrors = 0

securityChecks.forEach(({ name, test, message }) => {
  if (test()) {
    console.log(`  ✅ ${name}`)
  } else {
    console.log(`  ❌ ${name}: ${message}`)
    securityErrors++
  }
})

// Summary
console.log('\n' + '='.repeat(50))
console.log('Summary:')
console.log(`  Required variables: ${present.length}/${required.length}`)
console.log(`  Optional variables: ${optionalPresent.length}/${optional.length}`)
console.log(`  Format errors: ${formatErrors}`)
console.log(`  Security errors: ${securityErrors}`)
console.log('='.repeat(50))

// Exit with error if validation failed
if (missing.length > 0 || formatErrors > 0 || securityErrors > 0) {
  console.log('\n❌ Environment validation failed!')
  console.log('\nPlease fix the issues above before deploying.')
  console.log('See ENVIRONMENT_VARIABLES.md for detailed documentation.')
  process.exit(1)
}

console.log('\n✅ All environment variables are valid!')
console.log('Ready for deployment.')

/**
 * Mask sensitive values for display
 */
function maskValue(key, value) {
  if (!value) return 'not set'
  
  // Don't mask URLs
  if (key.includes('URL')) {
    return value
  }
  
  // Show first and last few characters
  if (value.length > 20) {
    return `${value.substring(0, 8)}...${value.substring(value.length - 4)}`
  }
  
  return '***'
}
