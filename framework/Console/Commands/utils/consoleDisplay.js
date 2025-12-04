/**
 * Console Utilities
 * Display formatted messages and progress
 */

/**
 * Display app structure info
 */
export function displayAPIStructure(appName, appType) {
  console.log('\n✅ App generated successfully!\n');
  console.log('📁 Structure:');
  console.log(`   apps/${appName}/${appType}/`);
  console.log('   ├── src/');
  console.log('   │   ├── controllers/  (BaseController.js, AuthController.js)');
  console.log('   │   ├── models/       (User.js)');
  console.log('   │   ├── services/     (AuthService.js)');
  console.log('   │   ├── middleware/   (authMiddleware.js, errorHandler.js)');
  console.log('   │   ├── routes/       (auth.routes.js)');
  console.log('   │   ├── requests/     (AuthRequests.js)');
  console.log('   │   ├── app.js        (Express app setup)');
  console.log('   │   └── index.js      (Framework bootstrap)');
  console.log('   ├── package.json');
  console.log('   ├── .env');
  console.log('   └── README.md\n');
  console.log('📝 Config: Uses centralized /config from project root');
  console.log('📝 Database: Uses centralized /database from project root\n');
}

/**
 * Display web structure info
 */
export function displayWebStructure(appName, appType) {
  console.log('\n✅ App generated successfully!\n');
  console.log('📁 Structure:');
  console.log(`   apps/${appName}/${appType}/`);
  console.log('   ├── src/              (Empty - add your code)');
  console.log('   ├── public/           (index.html placeholder)');
  console.log('   ├── package.json');
  console.log('   ├── .env');
  console.log('   └── README.md\n');
}

/**
 * Display next steps for API
 */
export function displayAPINextSteps(appName, appType) {
  console.log('📝 Next steps:');
  console.log(`  1. cd apps/${appName}/${appType}`);
  console.log('  2. Update .env if needed (JWT_SECRET, APP_PORT)');
  console.log('  3. Run migrations: pnpm db:migrate (from project root)');
  console.log(`  4. Start dev server: pnpm dev:${appName}-${appType} (from project root)\n`);
  
  console.log('🔐 Authentication endpoints:');
  console.log('   POST /api/auth/register');
  console.log('   POST /api/auth/login');
  console.log('   GET  /api/auth/me (protected)');
  console.log('   POST /api/auth/logout (protected)\n');
}

/**
 * Display next steps for web
 */
export function displayWebNextSteps(appName, appType) {
  console.log('📝 Next steps:');
  console.log(`  1. cd apps/${appName}/${appType}`);
  console.log('  2. Install your frontend framework (React/Vue/Svelte)');
  console.log(`  3. Start dev server: pnpm dev:${appName}-${appType} (from project root)\n`);
}

/**
 * Display media server structure
 */
export function displayMediaServerStructure() {
  console.log('\n✅ Media server generated successfully!\n');
  console.log('📁 Location: apps/media-server/');
  console.log('📁 Structure:');
  console.log('   apps/media-server/');
  console.log('   ├── src/');
  console.log('   │   ├── controllers/  (ImageController.js)');
  console.log('   │   ├── routes/       (image.routes.js, index.js)');
  console.log('   │   └── index.js      (Framework bootstrap)');
  console.log('   ├── config/           (app.cjs)');
  console.log('   ├── .env');
  console.log('   └── package.json\n');
}

/**
 * Display media server next steps
 */
export function displayMediaServerNextSteps(port) {
  console.log('📝 Next steps:');
  console.log('  1. pnpm dev:media-server');
  console.log(`\n🌐 Server will run on: http://localhost:${port}`);
}

/**
 * Display deletion confirmation
 */
export function displayDeletionWarning(appName, appType) {
  console.log(`🗑️  Deleting ${appType.toUpperCase()} Application: ${appName}/${appType}\n`);
  console.log(`⚠️  This will permanently delete: apps/${appName}/${appType}/`);
  console.log('Use --force flag to skip this confirmation\n');
}

/**
 * Display entire app deletion warning
 */
export function displayEntireAppDeletionWarning(appName) {
  console.log(`🗑️  Deleting ENTIRE Application: ${appName}/ (api + web)\n`);
  console.log(`⚠️  This will permanently delete: apps/${appName}/`);
  console.log('Use --force flag to skip this confirmation\n');
}

/**
 * Display successful deletion
 */
export function displayDeletionSuccess(appName, appType) {
  console.log('\n✅ App deleted successfully!\n');
  console.log(`🗑️  Removed: apps/${appName}/${appType}/`);
}
