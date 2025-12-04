/**
 * Web Structure Generator
 * Handles creation of web-specific directory structure and files
 */

import { join } from 'path';
import {
  createDirectories,
  writeFileContent,
} from './fileOperations.js';
import {
  generateWebIndexHTML,
  generateWebReadme,
} from './templateGenerator.js';

/**
 * Create web directory structure
 */
export async function createWebDirectoryStructure(targetDir) {
  const directories = [
    'src',
    'public',
  ];
  
  await createDirectories(targetDir, directories);
}

/**
 * Generate web files
 */
export async function generateWebFiles(targetDir, appName) {
  // index.html
  await writeFileContent(
    join(targetDir, 'public/index.html'),
    generateWebIndexHTML(appName)
  );
  
  // README
  await writeFileContent(
    join(targetDir, 'README.md'),
    generateWebReadme(appName)
  );
}

/**
 * Generate complete web structure
 */
export async function generateCompleteWebStructure(targetDir, appName) {
  await createWebDirectoryStructure(targetDir);
  await generateWebFiles(targetDir, appName);
}
