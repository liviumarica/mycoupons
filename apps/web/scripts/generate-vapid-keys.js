/**
 * Script to generate VAPID keys for Web Push notifications
 * Run with: node apps/web/scripts/generate-vapid-keys.js
 * 
 * This will generate a public and private key pair that should be added to .env.local:
 * NEXT_PUBLIC_VAPID_PUBLIC_KEY=<public-key>
 * VAPID_PRIVATE_KEY=<private-key>
 */

const crypto = require('crypto');

function generateVAPIDKeys() {
  // Generate ECDSA key pair using P-256 curve (required for VAPID)
  const { publicKey, privateKey } = crypto.generateKeyPairSync('ec', {
    namedCurve: 'prime256v1',
    publicKeyEncoding: {
      type: 'spki',
      format: 'der'
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'der'
    }
  });

  // Convert to base64url format (URL-safe base64)
  const publicKeyBase64 = publicKey.toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
  
  const privateKeyBase64 = privateKey.toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  return {
    publicKey: publicKeyBase64,
    privateKey: privateKeyBase64
  };
}

// Generate and display keys
const keys = generateVAPIDKeys();

console.log('\n=== VAPID Keys Generated ===\n');
console.log('Add these to your .env.local file:\n');
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${keys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${keys.privateKey}`);
console.log('\nNote: Keep the private key secret and never commit it to version control!\n');
