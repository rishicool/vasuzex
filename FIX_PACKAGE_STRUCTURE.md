# Task: Fix Vasuzex Framework Package Structure for NPM Distribution

## Current Problem
When users run `npx create-vasuzex my-app`, the CLI needs to scaffold a complete project structure. Currently, the package structure is not properly organized for this.

## Required Changes

### 1. Create `stubs/` Directory Structure
Create a `stubs/` folder in vasuzex root with complete starter project templates:

```
vasuzex/
├── stubs/
│   ├── default/                    # Minimal starter
│   │   ├── apps/.gitkeep
│   │   ├── config/
│   │   │   ├── app.js
│   │   │   ├── database.js
│   │   │   └── index.js
│   │   ├── database/
│   │   │   ├── models/.gitkeep
│   │   │   ├── migrations/.gitkeep
│   │   │   └── seeders/.gitkeep
│   │   ├── routes/
│   │   │   ├── web.js
│   │   │   └── api.js
│   │   ├── .env.example
│   │   ├── .gitignore
│   │   ├── server.js
│   │   ├── package.json.stub
│   │   └── README.md
│   ├── with-blog/                  # Starter with blog-api
│   │   └── (same structure + apps/blog-api/)
│   └── with-media/                 # Starter with media-server
│       └── (same structure + apps/media-server/)
```

### 2. Update `bin/create-vasuzex.js`
Fix the CLI to:
- Accept project name: `npx create-vasuzex my-app`
- Ask for starter template (minimal, blog, media, both)
- Copy files from appropriate `stubs/` folder
- Replace `package.json.stub` with actual `package.json`
- Add `"vasuzex": "^1.0.0"` to dependencies
- Run `pnpm install`
- Initialize git repo
- Show success message with next steps

```javascript
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

program
  .name('create-vasuzex')
  .argument('<project-name>', 'Project name')
  .description('Create a new Vasuzex project')
  .action(async (projectName) => {
    console.log(chalk.cyan('\n🚀 Creating Vasuzex project...\n'));

    // 1. Ask for template
    const { template } = await inquirer.prompt([{
      type: 'list',
      name: 'template',
      message: 'Choose starter template:',
      choices: [
        { name: 'Minimal (Empty project)', value: 'default' },
        { name: 'With Blog API', value: 'with-blog' },
        { name: 'With Media Server', value: 'with-media' },
        { name: 'Full Stack (Blog + Media)', value: 'full' }
      ]
    }]);

    // 2. Ask for database
    const { database } = await inquirer.prompt([{
      type: 'list',
      name: 'database',
      message: 'Choose database:',
      choices: ['PostgreSQL', 'MySQL', 'SQLite'],
      default: 'PostgreSQL'
    }]);

    // 3. Create project directory
    const targetDir = path.join(process.cwd(), projectName);
    
    if (fs.existsSync(targetDir)) {
      console.error(chalk.red(`❌ Directory ${projectName} already exists!`));
      process.exit(1);
    }

    const spinner = ora('Creating project structure...').start();
    
    try {
      // 4. Copy from stubs
      const stubsDir = path.join(__dirname, '..', 'stubs', template);
      await fs.copy(stubsDir, targetDir);
      
      // 5. Process package.json
      const pkgStubPath = path.join(targetDir, 'package.json.stub');
      const pkgStub = await fs.readFile(pkgStubPath, 'utf-8');
      const pkg = JSON.parse(pkgStub);
      pkg.name = projectName;
      await fs.writeFile(path.join(targetDir, 'package.json'), JSON.stringify(pkg, null, 2));
      await fs.remove(pkgStubPath);
      
      // 6. Setup .env
      await fs.copy(
        path.join(targetDir, '.env.example'), 
        path.join(targetDir, '.env')
      );
      
      // Update database config in .env
      const envPath = path.join(targetDir, '.env');
      let envContent = await fs.readFile(envPath, 'utf-8');
      envContent = envContent.replace('APP_NAME=MyApp', `APP_NAME=${projectName}`);
      envContent = envContent.replace('DB_DATABASE=myapp', `DB_DATABASE=${projectName}`);
      
      if (database === 'MySQL') {
        envContent = envContent.replace('DB_CONNECTION=postgresql', 'DB_CONNECTION=mysql');
        envContent = envContent.replace('DB_PORT=5432', 'DB_PORT=3306');
      } else if (database === 'SQLite') {
        envContent = envContent.replace('DB_CONNECTION=postgresql', 'DB_CONNECTION=sqlite');
      }
      
      await fs.writeFile(envPath, envContent);
      
      spinner.succeed('Project structure created!');
      
      // 7. Install dependencies
      spinner.start('Installing dependencies...');
      execSync('pnpm install', { 
        cwd: targetDir, 
        stdio: 'inherit' 
      });
      spinner.succeed('Dependencies installed!');
      
      // 8. Initialize git
      spinner.start('Initializing git repository...');
      execSync('git init', { cwd: targetDir, stdio: 'ignore' });
      execSync('git add .', { cwd: targetDir, stdio: 'ignore' });
      execSync('git commit -m "Initial commit from Vasuzex"', { cwd: targetDir, stdio: 'ignore' });
      spinner.succeed('Git repository initialized!');
      
      // 9. Success message
      console.log(chalk.green('\n✅ Project created successfully!\n'));
      console.log(chalk.cyan('Next steps:\n'));
      console.log(chalk.white(`  cd ${projectName}`));
      console.log(chalk.white(`  pnpm dev\n`));
      console.log(chalk.gray('Available commands:'));
      console.log(chalk.white('  npx vasuzex generate:app <name>  - Generate new app'));
      console.log(chalk.white('  npx vasuzex make:model <name>    - Create model'));
      console.log(chalk.white('  npx vasuzex migrate              - Run migrations\n'));
      
    } catch (error) {
      spinner.fail('Failed to create project');
      console.error(chalk.red(error.message));
      process.exit(1);
    }
  });

program.parse();
```

### 3. Create Stub Files Content

**`stubs/default/package.json.stub`:**
```json
{
  "name": "PROJECT_NAME",
  "version": "1.0.0",
  "description": "Application built with Vasuzex Framework",
  "type": "module",
  "private": true,
  "scripts": {
    "dev": "nodemon server.js",
    "start": "node server.js",
    "db:migrate": "npx vasuzex migrate",
    "db:seed": "npx vasuzex db:seed"
  },
  "keywords": ["vasuzex", "nodejs", "framework"],
  "author": "",
  "license": "MIT",
  "dependencies": {
    "vasuzex": "^1.0.0",
    "dotenv": "^16.6.1",
    "pg": "^8.16.3"
  },
  "devDependencies": {
    "nodemon": "^3.1.11"
  }
}
```

**`stubs/default/server.js`:**
```javascript
import { Application } from 'vasuzex';
import { config } from 'dotenv';

// Load environment variables
config();

// Create Vasuzex application
const app = new Application({
  basePath: process.cwd(),
  env: process.env.NODE_ENV || 'development'
});

// Bootstrap the application
await app.bootstrap();

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`⚡ Powered by Vasuzex Framework`);
  console.log(`🌍 Environment: ${app.environment()}`);
});
```

**`stubs/default/routes/web.js`:**
```javascript
import { Router } from 'vasuzex';

const router = new Router();

router.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Vasuzex Framework',
    version: '1.0.0',
    documentation: 'https://vasuzex.dev/docs'
  });
});

router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

export default router;
```

**`stubs/default/routes/api.js`:**
```javascript
import { Router } from 'vasuzex';

const router = new Router();

router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Vasuzex API is working!',
    data: {
      framework: 'Vasuzex',
      version: '1.0.0'
    }
  });
});

export default router;
```

**`stubs/default/config/index.js`:**
```javascript
import app from './app.js';
import database from './database.js';

export default {
  app,
  database
};
```

**`stubs/default/config/app.js`:**
```javascript
export default {
  name: process.env.APP_NAME || 'Vasuzex App',
  env: process.env.NODE_ENV || 'development',
  debug: process.env.APP_DEBUG === 'true',
  url: process.env.APP_URL || 'http://localhost:3000',
  port: parseInt(process.env.PORT || '3000'),
  
  // CORS Configuration
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
  }
};
```

**`stubs/default/config/database.js`:**
```javascript
export default {
  default: process.env.DB_CONNECTION || 'postgresql',
  
  connections: {
    postgresql: {
      driver: 'pg',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_DATABASE || 'myapp',
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || '',
      charset: 'utf8',
      timezone: '+00:00'
    },
    
    mysql: {
      driver: 'mysql2',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      database: process.env.DB_DATABASE || 'myapp',
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || '',
      charset: 'utf8mb4'
    },
    
    sqlite: {
      driver: 'better-sqlite3',
      database: process.env.DB_DATABASE || 'database.sqlite'
    }
  }
};
```

**`stubs/default/.env.example`:**
```env
NODE_ENV=development
PORT=3000
APP_NAME=MyApp
APP_URL=http://localhost:3000
APP_DEBUG=true

# Database
DB_CONNECTION=postgresql
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=myapp
DB_USERNAME=postgres
DB_PASSWORD=

# CORS
CORS_ORIGIN=*
```

**`stubs/default/.gitignore`:**
```
# Dependencies
node_modules/
pnpm-lock.yaml
package-lock.json
yarn.lock

# Environment
.env
.env.local
.env.production

# Build
dist/
build/
.turbo/

# Logs
logs/
*.log
npm-debug.log*

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo
```

**`stubs/default/README.md`:**
```markdown
# PROJECT_NAME

Built with [Vasuzex Framework](https://github.com/rishicool/vasuzex) - A Laravel-inspired Node.js framework.

## Quick Start

```bash
# Install dependencies
pnpm install

# Setup environment
cp .env.example .env

# Run migrations
pnpm db:migrate

# Start development server
pnpm dev
```

Visit `http://localhost:3000`

## Available Commands

```bash
pnpm dev              # Start development server
pnpm start            # Start production server
pnpm db:migrate       # Run database migrations
pnpm db:seed          # Seed database

# Vasuzex CLI
npx vasuzex generate:app <name>     # Generate new app
npx vasuzex make:model <name>       # Create model
npx vasuzex make:migration <name>   # Create migration
npx vasuzex migrate                 # Run migrations
```

## Project Structure

```
.
├── apps/              # Applications
├── config/            # Configuration files
├── database/          # Models, migrations, seeders
├── routes/            # Route definitions
├── server.js          # Application entry point
└── .env               # Environment variables
```

## Documentation

- [Vasuzex Documentation](https://vasuzex.dev/docs)
- [GuruORM Documentation](https://www.npmjs.com/package/guruorm)

## License

MIT
```

**`stubs/default/database/models/.gitkeep`:**
```
# Models go here
```

**`stubs/default/database/migrations/.gitkeep`:**
```
# Migrations go here
```

**`stubs/default/database/seeders/.gitkeep`:**
```
# Seeders go here
```

**`stubs/default/apps/.gitkeep`:**
```
# Generated apps go here
```

### 4. Update `package.json` Files Section
Add to vasuzex root `package.json`:
```json
{
  "files": [
    "framework/",
    "bin/",
    "stubs/",
    "README.md",
    "LICENSE"
  ]
}
```

### 5. Fix Framework Imports
All generated files should import from `vasuzex` package:

**CORRECT:**
```javascript
import { Application, Router, Model } from 'vasuzex';
```

**WRONG:**
```javascript
import { Application } from '@vasuzex/framework';
```

### 6. Update CLI Commands in `framework/Console/cli.js`

Commands like `generate:app`, `make:model` should work from user's project:

```javascript
// When user runs: npx vasuzex generate:app my-api
// Should create: apps/my-api/ in THEIR project (process.cwd())
// NOT in vasuzex package directory

// Example fix:
generateApp
  .argument('<name>', 'App name')
  .action(async (name) => {
    const targetDir = path.join(process.cwd(), 'apps', name); // User's project
    // NOT: path.join(__dirname, '../../apps', name) // Vasuzex package
    
    // Create app structure...
  });
```

### 7. Fix Import Path in Generated Files

Update `framework/Console/commands/generate-app.js` template:

**Change from:**
```javascript
const template = `import { Application } from '@vasuzex/framework';`;
```

**To:**
```javascript
const template = `import { Application } from 'vasuzex';`;
```

## Expected User Flow

```bash
# 1. Create project
npx create-vasuzex my-store
# ? Choose starter template: › Minimal
# ? Choose database: › PostgreSQL
# Creating project structure... ✓
# Installing dependencies... ✓
# Initializing git repository... ✓
# ✅ Project created successfully!

# 2. Navigate
cd my-store

# 3. Check structure
ls -la
# apps/
# config/
# database/
# routes/
# server.js
# package.json
# .env

# 4. Start server
pnpm dev
# 🚀 Server running on http://localhost:3000
# ⚡ Powered by Vasuzex Framework

# 5. Generate app
npx vasuzex generate:app blog-api
# ✅ Created apps/blog-api/

# 6. Create model
npx vasuzex make:model Post
# ✅ Created database/models/Post.js

# 7. Use framework features
# Import from 'vasuzex' works:
import { Model, DB, Cache } from 'vasuzex';
```

## Testing Checklist

After implementation, test:

- [ ] `cd /tmp && npx create-vasuzex test-app`
- [ ] Select minimal template
- [ ] Verify all files created in test-app/
- [ ] `cd test-app && pnpm install` completes
- [ ] `pnpm dev` starts server successfully
- [ ] Visit http://localhost:3000 shows welcome message
- [ ] `npx vasuzex generate:app api` creates apps/api/ in test-app
- [ ] `npx vasuzex make:model User` creates database/models/User.js
- [ ] `import { Model } from 'vasuzex'` works in server.js
- [ ] No errors about `@vasuzex/framework` not found
- [ ] Database connection works
- [ ] Git repository initialized

## Current Issues to Fix

1. ❌ `bin/create-vasuzex.js` uses commander incorrectly (expects `new <name>` command instead of just `<name>`)
2. ❌ No `stubs/` folder exists
3. ❌ Generated apps have wrong import: `@vasuzex/framework` instead of `vasuzex`
4. ❌ CLI commands create files in vasuzex package directory instead of user's project
5. ❌ `package.json` doesn't include `stubs/` in files array
6. ❌ No interactive prompts for database/template selection

## Success Criteria

✅ User can run `npx create-vasuzex my-app` and get working project  
✅ All imports use `vasuzex` package name  
✅ CLI commands work in user's project directory  
✅ Project structure matches Laravel/Rails conventions  
✅ Zero configuration needed to start coding  
✅ Framework stays in node_modules, user gets clean project structure  

Fix all these issues to make Vasuzex work like Laravel: **`npx create-vasuzex my-app` → ready to code!**
