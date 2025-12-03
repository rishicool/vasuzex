#!/usr/bin/env node

import { program } from 'commander';
import inquirer from 'inquirer';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import ora from 'ora';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Vasuzex Project Creator
 * Creates a new Vasuzex project from stubs
 */

async function createProject(projectName) {
  console.log(chalk.cyan('\n🚀 Creating Vasuzex project...\n'));

  // 1. Prompt for configuration
  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'template',
      message: 'Choose starter template:',
      choices: [
        { name: 'Minimal (Empty project - generate apps later)', value: 'default' },
        { name: 'With Blog API', value: 'with-blog' },
        { name: 'With Media Server', value: 'with-media' },
        { name: 'Full Stack (Blog + Media)', value: 'full' }
      ],
      default: 'default'
    },
    {
      type: 'list',
      name: 'database',
      message: 'Choose database:',
      choices: ['PostgreSQL', 'MySQL', 'SQLite'],
      default: 'PostgreSQL'
    },
    {
      type: 'confirm',
      name: 'configureDatabaseNow',
      message: 'Configure database connection now?',
      default: false
    }
  ]);

  let dbConfig = null;
  if (answers.configureDatabaseNow && answers.database !== 'SQLite') {
    dbConfig = await inquirer.prompt([
      {
        type: 'input',
        name: 'host',
        message: 'Database host:',
        default: 'localhost'
      },
      {
        type: 'input',
        name: 'port',
        message: 'Database port:',
        default: answers.database === 'PostgreSQL' ? '5432' : '3306'
      },
      {
        type: 'input',
        name: 'database',
        message: 'Database name:',
        default: projectName.replace(/-/g, '_')
      },
      {
        type: 'input',
        name: 'username',
        message: 'Database username:',
        default: answers.database === 'PostgreSQL' ? 'postgres' : 'root'
      },
      {
        type: 'password',
        name: 'password',
        message: 'Database password:',
        mask: '*'
      }
    ]);
  }

  const targetDir = path.join(process.cwd(), projectName);

  // 2. Check if directory exists
  if (await fs.pathExists(targetDir)) {
    console.error(chalk.red(`\n❌ Directory "${projectName}" already exists!\n`));
    process.exit(1);
  }

  const spinner = ora('Creating project structure...').start();

  try {
    // 3. Determine stub directory
    let stubDir = 'default';
    if (answers.template === 'with-blog') {
      stubDir = 'with-blog';
    } else if (answers.template === 'with-media') {
      stubDir = 'with-media';
    } else if (answers.template === 'full') {
      stubDir = 'full';
    }

    const stubPath = path.join(__dirname, '..', 'stubs', stubDir);

    // 4. Check if stub exists, fallback to default
    if (!(await fs.pathExists(stubPath))) {
      spinner.warn(`Stub "${stubDir}" not found, using default`);
      stubDir = 'default';
    }

    const finalStubPath = path.join(__dirname, '..', 'stubs', stubDir);

    // 5. Copy stub to target directory
    spinner.text = 'Copying project files...';
    await fs.copy(finalStubPath, targetDir);

    // 6. Process package.json.stub
    spinner.text = 'Configuring package.json...';
    const pkgStubPath = path.join(targetDir, 'package.json.stub');
    
    if (await fs.pathExists(pkgStubPath)) {
      let pkgContent = await fs.readFile(pkgStubPath, 'utf-8');
      pkgContent = pkgContent.replace(/PROJECT_NAME/g, projectName);
      
      // Detect if running from local development (not published to NPM)
      const isLocalDev = __dirname.includes('/work/vasuzex/') || __dirname.includes('\\work\\vasuzex\\');
      
      if (isLocalDev) {
        // For local development, use file: protocol to link to parent vasuzex
        const vasuzexPath = path.resolve(__dirname, '..');
        pkgContent = pkgContent.replace(/"vasuzex": "\^1\.0\.0"/g, `"vasuzex": "file:${vasuzexPath}"`);
        console.log(chalk.cyan(`\n🔧 Development mode: Using local vasuzex from ${vasuzexPath}\n`));
      }
      
      await fs.writeFile(path.join(targetDir, 'package.json'), pkgContent);
      await fs.remove(pkgStubPath);
    }

    // 7. Setup .env file
    spinner.text = 'Configuring environment...';
    const envExamplePath = path.join(targetDir, '.env.example');
    
    if (await fs.pathExists(envExamplePath)) {
      let envContent = await fs.readFile(envExamplePath, 'utf-8');
      
      // Replace project name
      envContent = envContent.replace(/MyApp/g, projectName);
      envContent = envContent.replace(/myapp/g, projectName.replace(/-/g, '_'));
      
      // Configure database
      if (answers.database === 'MySQL') {
        envContent = envContent.replace(/DB_CONNECTION=postgresql/g, 'DB_CONNECTION=mysql');
        envContent = envContent.replace(/POSTGRES_/g, 'DB_');
        envContent = envContent.replace(/DB_PORT=5432/g, 'DB_PORT=3306');
        envContent = envContent.replace(/DB_USER=/g, 'DB_USERNAME=');
      } else if (answers.database === 'SQLite') {
        envContent = envContent.replace(/DB_CONNECTION=postgresql/g, 'DB_CONNECTION=sqlite');
      }
      
      // Apply custom database config
      if (dbConfig) {
        const prefix = answers.database === 'PostgreSQL' ? 'POSTGRES_' : 'DB_';
        envContent = envContent.replace(new RegExp(`${prefix}HOST=.*`, 'g'), `${prefix}HOST=${dbConfig.host}`);
        envContent = envContent.replace(new RegExp(`${prefix}PORT=.*`, 'g'), `${prefix}PORT=${dbConfig.port}`);
        envContent = envContent.replace(new RegExp(`${prefix}DB=.*`, 'g'), `${prefix}DB=${dbConfig.database}`);
        
        if (answers.database === 'PostgreSQL') {
          envContent = envContent.replace(/POSTGRES_USER=.*/, `POSTGRES_USER=${dbConfig.username}`);
          envContent = envContent.replace(/POSTGRES_PASSWORD=.*/, `POSTGRES_PASSWORD=${dbConfig.password}`);
        } else {
          envContent = envContent.replace(/DB_USERNAME=.*/, `DB_USERNAME=${dbConfig.username}`);
          envContent = envContent.replace(/DB_PASSWORD=.*/, `DB_PASSWORD=${dbConfig.password}`);
        }
      }
      
      await fs.writeFile(path.join(targetDir, '.env'), envContent);
    }

    // 8. Process README.md
    spinner.text = 'Finalizing documentation...';
    const readmePath = path.join(targetDir, 'README.md');
    
    if (await fs.pathExists(readmePath)) {
      let readmeContent = await fs.readFile(readmePath, 'utf-8');
      readmeContent = readmeContent.replace(/PROJECT_NAME/g, projectName);
      await fs.writeFile(readmePath, readmeContent);
    }

    spinner.succeed('Project structure created!');

    // 9. Install dependencies
    spinner.start('Installing dependencies (this may take a minute)...');
    
    try {
      execSync('pnpm install', {
        cwd: targetDir,
        stdio: 'pipe'
      });
      spinner.succeed('Dependencies installed!');
    } catch (error) {
      spinner.warn('Failed to install dependencies automatically');
      console.log(chalk.yellow('\n⚠️  Please run "pnpm install" manually\n'));
    }

    // 10. Initialize git
    spinner.start('Initializing git repository...');
    
    try {
      execSync('git init', { cwd: targetDir, stdio: 'pipe' });
      execSync('git add .', { cwd: targetDir, stdio: 'pipe' });
      execSync('git commit -m "Initial commit from Vasuzex"', { cwd: targetDir, stdio: 'pipe' });
      spinner.succeed('Git repository initialized!');
    } catch (error) {
      spinner.info('Skipped git initialization');
    }

    // 11. Success message
    console.log(chalk.green('\n✅ Project created successfully!\n'));
    console.log(chalk.cyan('Next steps:\n'));
    console.log(chalk.white(`  cd ${projectName}`));
    console.log(chalk.white(`  pnpm install  ${chalk.gray('(if not done automatically)')}`));
    
    if (answers.template === 'default') {
      console.log(chalk.white(`  pnpm generate:app my-api  ${chalk.gray('(create your first app)')}`));
    }
    
    if (answers.configureDatabaseNow) {
      console.log(chalk.white(`  pnpm db:migrate`));
    } else {
      console.log(chalk.gray(`  # Edit .env with your database credentials`));
      console.log(chalk.white(`  pnpm db:migrate`));
    }
    
    if (answers.template !== 'default') {
      console.log(chalk.white(`  cd apps/[app-name]`));
      console.log(chalk.white(`  pnpm dev\n`));
    } else {
      console.log();
    }
    
    console.log(chalk.gray('Available commands:'));
    console.log(chalk.white('  pnpm generate:app <name>     - Generate new app'));
    console.log(chalk.white('  pnpm make:model <name>       - Create model'));
    console.log(chalk.white('  pnpm make:migration <name>   - Create migration'));
    console.log(chalk.white('  pnpm db:migrate              - Run migrations\n'));
    
    console.log(chalk.cyan('📖 Documentation: https://github.com/rishicool/vasuzex/tree/main/docs'));
    console.log(chalk.cyan('Happy coding! 🎉\n'));

  } catch (error) {
    spinner.fail('Failed to create project');
    console.error(chalk.red('\n' + error.message + '\n'));
    
    // Cleanup on failure
    if (await fs.pathExists(targetDir)) {
      await fs.remove(targetDir);
    }
    
    process.exit(1);
  }
}

// CLI Program
program
  .name('create-vasuzex')
  .description('Create a new Vasuzex project')
  .version('1.0.0')
  .argument('<project-name>', 'Name of the project to create')
  .action(async (projectName) => {
    // Validate project name
    if (!/^[a-z0-9-_]+$/i.test(projectName)) {
      console.error(chalk.red('\n❌ Project name can only contain letters, numbers, hyphens, and underscores\n'));
      process.exit(1);
    }

    await createProject(projectName);
  });

program.parse();
