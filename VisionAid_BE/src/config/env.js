/**
 * Environment Configuration Loader
 * Loads appropriate .env file based on NODE_ENV
 */

const path = require('path');
const fs = require('fs');

/**
 * Load environment variables based on NODE_ENV
 */
const loadEnvironmentConfig = () => {
  // Prevent multiple loads
  if (process.env.ENV_LOADED) {
    return;
  }
  
  const nodeEnv = process.env.NODE_ENV || 'development';
  const envFile = `.env.${nodeEnv}`;
  const envPath = path.resolve(process.cwd(), envFile);
  
  let configResult;
  
  // Check if environment-specific file exists
  if (fs.existsSync(envPath)) {
    console.log(`📋 Loading environment config from: ${envFile}`);
    configResult = require('dotenv').config({ path: envPath });
  } else {
    // Fallback to .env file
    const fallbackPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(fallbackPath)) {
      console.log(`📋 Environment file ${envFile} not found, using fallback: .env`);
      configResult = require('dotenv').config({ path: fallbackPath });
    } else {
      console.warn(`⚠️  No environment file found. Expected: ${envFile} or .env`);
      console.warn(`⚠️  Using system environment variables only`);
    }
  }
  
  // Log configuration result
  if (configResult && configResult.error) {
    console.error('❌ Error loading environment file:', configResult.error);
  } else if (configResult && configResult.parsed) {
    const loadedVarsCount = Object.keys(configResult.parsed).length;
    console.log(`✅ Loaded ${loadedVarsCount} environment variables`);
  }
  
  // Mark as loaded to prevent duplicate loads
  process.env.ENV_LOADED = 'true';
  
  // Validate required environment variables
  validateRequiredEnvVars();
};/**
 * Validate that required environment variables are set
 */
const validateRequiredEnvVars = () => {
  const requiredVars = [
    'NODE_ENV',
    'PORT',
    'JWT_SECRET',
    'MONGODB_URI'
  ];

  const missingVars = [];

  requiredVars.forEach(varName => {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  });

  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:');
    missingVars.forEach(varName => {
      console.error(`   - ${varName}`);
    });
    console.error('💡 Please check your .env file or environment configuration');
    process.exit(1);
  }
};

/**
 * Get current environment info
 */
const getEnvironmentInfo = () => {
  return {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 3000,
    host: process.env.HOST || 'localhost',
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
    isTest: process.env.NODE_ENV === 'test',
  };
};

module.exports = {
  loadEnvironmentConfig,
  validateRequiredEnvVars,
  getEnvironmentInfo,
};
