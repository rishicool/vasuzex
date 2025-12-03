/**
 * Delete App Command
 * Remove app and cleanup references
 */

import { rm, readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { execSync } from 'child_process';

export async function deleteApp(name, options) {
  const type = options.type;
  const force = options.force || false;
  
  // If no type specified, delete entire app (both api and web)
  if (!type) {
    console.log(`🗑️  Deleting ENTIRE Application: ${name}/ (api + web)\n`);
    
    if (!force) {
      console.log(`⚠️  This will permanently delete: apps/${name}/`);
      console.log('Use --force flag to skip this confirmation\n');
      console.error('❌ Please add --force flag to confirm deletion');
      process.exit(1);
    }
    
    const appDir = join(process.cwd(), 'apps', name);
    
    if (!existsSync(appDir)) {
      console.error(`❌ Error: App does not exist at ${appDir}`);
      process.exit(1);
    }
    
    await deleteSingleApp(name, 'api', force, true);
    await deleteSingleApp(name, 'web', force, true);
    
    // Delete parent directory
    try {
      await rm(appDir, { recursive: true, force: true });
      console.log(`\n📁 Deleted app directory: apps/${name}/`);
    } catch (error) {
      // Already deleted or doesn't exist
    }
    
    console.log('\n✅ Entire app deleted successfully!');
    return;
  }
  
  // Validate app type
  const validTypes = ['api', 'web'];
  if (!validTypes.includes(type)) {
    console.error(`❌ Invalid app type: ${type}`);
    console.log('Valid types: api, web');
    process.exit(1);
  }
  
  await deleteSingleApp(name, type, force, false);
}

async function deleteSingleApp(name, type, force, skipConfirm = false) {
  const appDir = join(process.cwd(), 'apps', name);
  const targetDir = join(appDir, type);

  console.log(`🗑️  Deleting ${type.toUpperCase()} Application: ${name}/${type}\n`);

  // Check if app exists
  if (!existsSync(targetDir)) {
    if (skipConfirm) {
      console.log(`⚠️  ${type} app doesn't exist, skipping...\n`);
      return;
    }
    console.error(`❌ Error: App does not exist at ${targetDir}`);
    process.exit(1);
  }

  // Confirm deletion
  if (!force && !skipConfirm) {
    console.log(`⚠️  This will permanently delete: apps/${name}/${type}/`);
    console.log('Use --force flag to skip this confirmation\n');
    
    // In real scenario, you'd prompt user. For now, require --force
    console.error('❌ Please add --force flag to confirm deletion');
    process.exit(1);
  }

  try {
    // Stop any running servers (kill processes)
    console.log('🛑 Stopping any running servers...');
    try {
      // Try to kill process by port (if app has a port)
      // For now, just notify user to manually stop
      console.log('   (Please ensure dev server is stopped manually if running)\n');
    } catch (error) {
      // Ignore
    }

    // Delete app directory
    console.log(`📁 Deleting directory: apps/${name}/${type}/`);
    await rm(targetDir, { recursive: true, force: true });
    console.log('✅ Directory deleted\n');

    // Check if parent directory is empty and delete it
    try {
      const parentContents = await readFile(appDir).catch(() => null);
      const hasOtherApps = existsSync(join(appDir, 'api')) || existsSync(join(appDir, 'web'));
      
      if (!hasOtherApps && existsSync(appDir)) {
        await rm(appDir, { recursive: true, force: true });
        console.log(`📁 Deleted empty parent directory: apps/${name}/\n`);
      }
    } catch (error) {
      // Parent dir not empty, that's fine
    }

    // Remove scripts from root package.json
    console.log('🧹 Cleaning up root package.json scripts...');
    try {
      const rootPackageJsonPath = join(process.cwd(), 'package.json');
      const rootPackageJson = JSON.parse(await readFile(rootPackageJsonPath, 'utf-8'));
      
      const devScriptName = `dev:${name}-${type}`;
      const startScriptName = `start:${name}-${type}`;
      
      let scriptsRemoved = [];
      
      if (rootPackageJson.scripts[devScriptName]) {
        delete rootPackageJson.scripts[devScriptName];
        scriptsRemoved.push(devScriptName);
      }
      
      if (rootPackageJson.scripts[startScriptName]) {
        delete rootPackageJson.scripts[startScriptName];
        scriptsRemoved.push(startScriptName);
      }
      
      if (scriptsRemoved.length > 0) {
        await writeFile(
          rootPackageJsonPath,
          JSON.stringify(rootPackageJson, null, 2) + '\n'
        );
        
        console.log(`✅ Removed scripts: ${scriptsRemoved.join(', ')}\n`);
      } else {
        console.log('   No scripts found to remove\n');
      }
    } catch (error) {
      console.log('⚠️  Could not cleanup root package.json\n');
    }

    // Clean pnpm workspace cache
    console.log('🧹 Cleaning workspace cache...');
    try {
      execSync('pnpm install', {
        cwd: process.cwd(),
        stdio: 'pipe',
      });
      console.log('✅ Workspace cache cleaned\n');
    } catch (error) {
      console.log('⚠️  Run `pnpm install` manually to clean workspace\n');
    }

    console.log('✅ App deleted successfully!\n');
    console.log(`🗑️  Removed: apps/${name}/${type}/`);
  } catch (error) {
    console.error('\n❌ Error deleting app:', error.message);
    process.exit(1);
  }
}
