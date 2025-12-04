/**
 * Package Manager Utilities
 * Handle package.json operations and dependency management
 */

import { join } from 'path';
import { pathExists, readJsonFile, writeJsonFile, getProjectRoot } from './fileOperations.js';

/**
 * Detect vasuzex dependency version
 * - workspace:* for development
 * - file:... for local linking
 * - ^1.0.0 for published package
 */
export async function detectVasuzexDependency() {
  const rootPkgPath = join(getProjectRoot(), 'package.json');
  
  if (!pathExists(rootPkgPath)) {
    return '^1.0.0';
  }
  
  try {
    const rootPkg = await readJsonFile(rootPkgPath);
    const vasuzexValue = rootPkg.dependencies?.vasuzex || '';
    
    if (vasuzexValue.startsWith('file:')) {
      return vasuzexValue;
    }
    
    if (pathExists(join(getProjectRoot(), 'pnpm-workspace.yaml'))) {
      return 'workspace:*';
    }
    
    return '^1.0.0';
  } catch (error) {
    return '^1.0.0';
  }
}

/**
 * Create package.json for app
 */
export async function createAppPackageJson(appName, appType, targetDir) {
  const vasuzexDep = await detectVasuzexDependency();
  
  const packageJson = {
    name: `${appName}-${appType}`,
    version: '1.0.0',
    description: `${appName} ${appType} application`,
    type: 'module',
    private: true,
    scripts: {
      dev: 'nodemon src/index.js',
      start: 'node src/index.js',
    },
    dependencies: {
      vasuzex: vasuzexDep,
      guruorm: '^2.0.0',
      express: '^5.2.1',
      cors: '^2.8.5',
      helmet: '^8.1.0',
    },
    devDependencies: {
      nodemon: '^3.1.11',
    },
  };
  
  await writeJsonFile(join(targetDir, 'package.json'), packageJson);
}

/**
 * Create package.json for media server
 */
export async function createMediaServerPackageJson(targetDir) {
  const vasuzexDep = await detectVasuzexDependency();
  
  const packageJson = {
    name: '@vasuzex/media-server',
    version: '1.0.0',
    description: 'Centralized media server for dynamic thumbnail generation',
    type: 'module',
    private: true,
    scripts: {
      dev: 'nodemon src/index.js',
      start: 'node src/index.js',
    },
    dependencies: {
      vasuzex: vasuzexDep,
      express: '^4.21.2',
      cors: '^2.8.5',
      helmet: '^8.0.0',
      sharp: '^0.33.5',
    },
    devDependencies: {
      nodemon: '^3.1.11',
    },
  };
  
  await writeJsonFile(join(targetDir, 'package.json'), packageJson);
}

/**
 * Add scripts to root package.json
 */
export async function addRootScripts(appName, appType) {
  const rootPkgPath = join(getProjectRoot(), 'package.json');
  
  try {
    const rootPkg = await readJsonFile(rootPkgPath);
    
    const devScriptName = `dev:${appName}-${appType}`;
    const startScriptName = `start:${appName}-${appType}`;
    const filterName = `${appName}-${appType}`;
    
    const scriptsAdded = [];
    
    if (!rootPkg.scripts[devScriptName]) {
      rootPkg.scripts[devScriptName] = `turbo run dev --filter=${filterName}`;
      scriptsAdded.push(`pnpm ${devScriptName}`);
    }
    
    if (!rootPkg.scripts[startScriptName]) {
      rootPkg.scripts[startScriptName] = `turbo run start --filter=${filterName}`;
      scriptsAdded.push(`pnpm ${startScriptName}`);
    }
    
    if (scriptsAdded.length > 0) {
      await writeJsonFile(rootPkgPath, rootPkg);
      console.log(`\n✅ Added scripts: ${scriptsAdded.join(', ')}`);
    }
  } catch (error) {
    console.log('\n⚠️  Could not add scripts to root package.json');
  }
}

/**
 * Remove scripts from root package.json
 */
export async function removeRootScripts(appName, appType) {
  const rootPkgPath = join(getProjectRoot(), 'package.json');
  
  try {
    const rootPkg = await readJsonFile(rootPkgPath);
    
    const devScriptName = `dev:${appName}-${appType}`;
    const startScriptName = `start:${appName}-${appType}`;
    
    const scriptsRemoved = [];
    
    if (rootPkg.scripts[devScriptName]) {
      delete rootPkg.scripts[devScriptName];
      scriptsRemoved.push(devScriptName);
    }
    
    if (rootPkg.scripts[startScriptName]) {
      delete rootPkg.scripts[startScriptName];
      scriptsRemoved.push(startScriptName);
    }
    
    if (scriptsRemoved.length > 0) {
      await writeJsonFile(rootPkgPath, rootPkg);
      console.log(`✅ Removed scripts: ${scriptsRemoved.join(', ')}\n`);
    } else {
      console.log('   No scripts found to remove\n');
    }
  } catch (error) {
    console.log('⚠️  Could not cleanup root package.json\n');
  }
}

/**
 * Add media server scripts to root package.json
 */
export async function addMediaServerScripts() {
  const rootPkgPath = join(getProjectRoot(), 'package.json');
  
  try {
    const rootPkg = await readJsonFile(rootPkgPath);
    
    rootPkg.scripts['dev:media-server'] = 'turbo run dev --filter=@vasuzex/media-server';
    rootPkg.scripts['start:media-server'] = 'turbo run start --filter=@vasuzex/media-server';
    
    await writeJsonFile(rootPkgPath, rootPkg);
    console.log('✅ Added scripts: pnpm dev:media-server, pnpm start:media-server');
  } catch (error) {
    console.log('⚠️  Could not add media server scripts to root package.json');
  }
}
