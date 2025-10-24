#!/usr/bin/env node

/**
 * Firebase Service Account Setup Helper
 * This script helps you verify Firebase configuration
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔥 Firebase Service Account Setup Helper\n');
console.log('=' .repeat(60));

// Check for serviceAccountKey.json
const serviceAccountPath = path.join(__dirname, '..', 'serviceAccountKey.json');
const hasServiceAccount = fs.existsSync(serviceAccountPath);

if (hasServiceAccount) {
  console.log('✅ serviceAccountKey.json found!');
  try {
    const serviceAccount = require(serviceAccountPath);
    console.log('   Project ID:', serviceAccount.project_id);
    console.log('   Client Email:', serviceAccount.client_email);
    console.log('   \n   ✅ Service account is valid');
  } catch (error) {
    console.log('   ❌ Error reading serviceAccountKey.json:', error.message);
  }
} else {
  console.log('❌ serviceAccountKey.json NOT found');
  console.log('\n📝 To fix this:');
  console.log('   1. Go to https://console.firebase.google.com/');
  console.log('   2. Select project: zact-13cef');
  console.log('   3. Settings ⚙️  → Project Settings → Service Accounts');
  console.log('   4. Click "Generate new private key"');
  console.log('   5. Save as: VisionAid_BE/serviceAccountKey.json');
}

console.log('\n' + '=' .repeat(60));

// Check .env.production
const envPath = path.join(__dirname, '..', '.env.production');
const hasEnv = fs.existsSync(envPath);

if (hasEnv) {
  console.log('✅ .env.production found');
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  const hasDbUrl = envContent.includes('FIREBASE_DATABASE_URL=https://');
  const hasProjectId = envContent.includes('FIREBASE_PROJECT_ID=');
  
  if (hasDbUrl) {
    console.log('   ✅ FIREBASE_DATABASE_URL is set');
  } else {
    console.log('   ❌ FIREBASE_DATABASE_URL is missing');
  }
  
  if (hasProjectId) {
    console.log('   ✅ FIREBASE_PROJECT_ID is set');
  } else {
    console.log('   ❌ FIREBASE_PROJECT_ID is missing');
  }
} else {
  console.log('❌ .env.production NOT found');
}

console.log('\n' + '=' .repeat(60));

// Recommendations
console.log('\n💡 Recommendations:\n');

if (!hasServiceAccount) {
  console.log('   🔴 HIGH PRIORITY: Download serviceAccountKey.json');
  console.log('      Follow instructions in FIREBASE_CREDENTIALS_SETUP.md');
}

if (hasServiceAccount) {
  console.log('   ✅ You can start the server now!');
  console.log('      Run: npm start');
  console.log('      Or: node server.js');
}

console.log('\n📚 Documentation:');
console.log('   - FIREBASE_CREDENTIALS_SETUP.md (Quick setup guide)');
console.log('   - FIREBASE_SETUP.md (Detailed documentation)');

console.log('\n');
