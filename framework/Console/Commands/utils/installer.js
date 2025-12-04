/**
 * Installation Utilities
 * Handle dependency installation and cleanup
 */

import { execSync } from 'child_process';
import { getProjectRoot } from './fileOperations.js';

/**
 * Install dependencies using pnpm
 */
export async function installDependencies(silent = false) {
  console.log('📦 Installing dependencies...\n');
  
  try {
    execSync('pnpm install', {
      cwd: getProjectRoot(),
      stdio: silent ? 'pipe' : 'inherit',
    });
    
    console.log('\n✅ Dependencies installed!\n');
    return true;
  } catch (error) {
    console.log('\n⚠️  Failed to install dependencies. Run manually:\n');
    console.log('  pnpm install\n');
    return false;
  }
}

/**
 * Clean workspace cache after app deletion
 */
export async function cleanWorkspaceCache() {
  console.log('🧹 Cleaning workspace cache...');
  
  try {
    execSync('pnpm install', {
      cwd: getProjectRoot(),
      stdio: 'pipe',
    });
    
    console.log('✅ Workspace cache cleaned\n');
    return true;
  } catch (error) {
    console.log('⚠️  Run `pnpm install` manually to clean workspace\n');
    return false;
  }
}
