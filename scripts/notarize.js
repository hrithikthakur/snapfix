#!/usr/bin/env node

/**
 * Notarization script for macOS direct distribution
 * This script notarizes the app for distribution outside the App Store
 * 
 * Requirements:
 * - Apple Developer account
 * - App-specific password (https://appleid.apple.com)
 * - Notarization credentials in environment variables or keychain
 */

const { notarize } = require('@electron/notarize');
const path = require('path');

exports.default = async function(context) {
  const { electronPlatformName, appOutDir } = context;
  
  // Only notarize macOS builds
  if (electronPlatformName !== 'darwin') {
    return;
  }

  // Skip notarization if credentials are not provided
  if (!process.env.APPLE_ID || !process.env.APPLE_APP_SPECIFIC_PASSWORD) {
    console.log('⚠️  Skipping notarization: APPLE_ID and APPLE_APP_SPECIFIC_PASSWORD not set');
    console.log('   Set these environment variables to enable notarization:');
    console.log('   export APPLE_ID="your@email.com"');
    console.log('   export APPLE_APP_SPECIFIC_PASSWORD="your-app-specific-password"');
    console.log('   export APPLE_TEAM_ID="your-team-id" (optional)');
    return;
  }

  const appName = context.packager.appInfo.productFilename;
  const appPath = path.join(appOutDir, `${appName}.app`);

  console.log(`📦 Notarizing ${appName}...`);
  console.log(`   App path: ${appPath}`);

  try {
    await notarize({
      appBundleId: context.packager.config.appId,
      appPath: appPath,
      appleId: process.env.APPLE_ID,
      appleIdPassword: process.env.APPLE_APP_SPECIFIC_PASSWORD,
      teamId: process.env.APPLE_TEAM_ID,
      tool: 'notarytool', // Use notarytool (Xcode 13+)
    });

    console.log('✅ Notarization successful!');
  } catch (error) {
    console.error('❌ Notarization failed:', error);
    throw error;
  }
};

