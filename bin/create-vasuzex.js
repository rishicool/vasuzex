#!/usr/bin/env node

import { program } from 'commander';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs-extra';
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

program
  .name('vasuzex')
  .description('Vasuzex Framework CLI')
  .version('1.0.0');

program
  .command('new')
  .argument('<project-name>', 'project name')
  .description('Create a new Vasuzex project')
  .action(async (projectName) => {
    console.log(chalk.blue.bold('\n🚀 Creating new Vasuzex project...\n'));

    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'starter',
        message: 'Which starter application do you want?',
        choices: [
          { name: 'Blog API (RESTful blog with CRUD)', value: 'blog-api' },
          { name: 'Media Server (File upload & processing)', value: 'media-server' },
          { name: 'Both (Full-featured starter)', value: 'both' },
          { name: 'Minimal (Just framework core)', value: 'minimal' }
        ]
      },
      {
        type: 'list',
        name: 'database',
        message: 'Which database do you want to use?',
        choices: ['PostgreSQL', 'MySQL', 'SQLite'],
        default: 'PostgreSQL'
      },
      {
        type: 'confirm',
        name: 'setupEnv',
        message: 'Do you want to configure database connection now?',
        default: true
      }
    ]);

    if (answers.setupEnv) {
      const dbConfig = await inquirer.prompt([
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
          default: projectName
        },
        {
          type: 'input',
          name: 'username',
          message: 'Database username:',
          default: 'postgres'
        },
        {
          type: 'password',
          name: 'password',
          message: 'Database password:',
          mask: '*'
        }
      ]);
      answers.dbConfig = dbConfig;
    }

    const spinner = ora('Creating project structure...').start();

    try {
      const projectPath = join(process.cwd(), projectName);
      const templatePath = join(__dirname, '..');

      // Create project directory
      await fs.ensureDir(projectPath);

      // Copy framework core
      spinner.text = 'Copying framework...';
      await fs.copy(join(templatePath, 'framework'), join(projectPath, 'framework'));
      await fs.copy(join(templatePath, 'config'), join(projectPath, 'config'));
      await fs.copy(join(templatePath, 'database'), join(projectPath, 'database'));
      
      // Copy examples
      await fs.copy(join(templatePath, 'examples'), join(projectPath, 'examples'));

      // Copy starter apps
      if (answers.starter === 'blog-api' || answers.starter === 'both') {
        spinner.text = 'Setting up Blog API...';
        await fs.copy(join(templatePath, 'apps/blog-api'), join(projectPath, 'apps/blog-api'));
      }
      
      if (answers.starter === 'media-server' || answers.starter === 'both') {
        spinner.text = 'Setting up Media Server...';
        await fs.copy(join(templatePath, 'apps/media-server'), join(projectPath, 'apps/media-server'));
      }

      // Create package.json
      spinner.text = 'Creating package.json...';
      const packageJson = {
        name: projectName,
        version: '1.0.0',
        type: 'module',
        description: `Vasuzex application - ${projectName}`,
        scripts: {
          dev: 'nodemon server.js',
          start: 'node server.js',
          'db:migrate': 'cd database && npx guruorm db:migrate',
          'db:seed': 'cd database && npx guruorm db:seed',
          'db:fresh': 'cd database && npx guruorm db:migrate:fresh --seed',
          test: 'NODE_OPTIONS=--experimental-vm-modules jest'
        },
        imports: {
          '#framework': './framework/index.js',
          '#framework/*': './framework/*',
          '#database': './database/index.js',
          '#database/*': './database/*',
          '#models': './database/models/index.js',
          '#models/*': './database/models/*',
          '#config': './config/index.cjs',
          '#config/*': './config/*'
        },
        dependencies: {
          axios: '^1.13.2',
          bcrypt: '^6.0.0',
          cors: '^2.8.5',
          dotenv: '^16.6.1',
          express: '^5.2.1',
          guruorm: '^2.0.0',
          helmet: '^8.1.0',
          pg: '^8.16.3',
          sharp: '^0.33.5',
          multer: '^2.0.2'
        },
        devDependencies: {
          nodemon: '^3.1.11',
          '@jest/globals': '^29.7.0',
          jest: '^29.7.0'
        }
      };

      await fs.writeJson(join(projectPath, 'package.json'), packageJson, { spaces: 2 });

      // Create .env file
      spinner.text = 'Creating .env file...';
      const dbDriver = answers.database === 'PostgreSQL' ? 'postgres' : 
                      answers.database === 'MySQL' ? 'mysql' : 'sqlite';
      
      let envContent = `# Application
APP_NAME=${projectName}
APP_ENV=development
APP_PORT=3000
APP_URL=http://localhost:3000

# Database
DB_CONNECTION=${dbDriver}
`;

      if (answers.setupEnv && answers.dbConfig) {
        envContent += `DB_HOST=${answers.dbConfig.host}
DB_PORT=${answers.dbConfig.port}
DB_DATABASE=${answers.dbConfig.database}
DB_USERNAME=${answers.dbConfig.username}
DB_PASSWORD=${answers.dbConfig.password}
`;
      } else {
        envContent += `DB_HOST=localhost
DB_PORT=${answers.database === 'PostgreSQL' ? '5432' : '3306'}
DB_DATABASE=${projectName}
DB_USERNAME=postgres
DB_PASSWORD=
`;
      }

      envContent += `
# Session
SESSION_SECRET=${Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)}
SESSION_LIFETIME=86400

# Cache
CACHE_DRIVER=memory

# File Upload
UPLOAD_MAX_SIZE=10485760
UPLOAD_ALLOWED_TYPES=image/jpeg,image/png,image/gif,application/pdf

# Storage
STORAGE_DRIVER=local
STORAGE_PATH=./storage
`;

      await fs.writeFile(join(projectPath, '.env'), envContent);
      await fs.writeFile(join(projectPath, '.env.example'), envContent);

      // Create .gitignore
      const gitignoreContent = `node_modules/
.env
.env.local
*.log
.turbo/
dist/
build/
coverage/
.DS_Store
uploads/
storage/
`;
      await fs.writeFile(join(projectPath, '.gitignore'), gitignoreContent);

      // Create basic server.js
      spinner.text = 'Creating server.js...';
      const serverContent = `import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.APP_PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to ${projectName}!',
    framework: 'Vasuzex',
    version: '1.0.0'
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(\`🚀 ${projectName} is running on http://localhost:\${PORT}\`);
  console.log(\`📚 Framework: Vasuzex\`);
  console.log(\`🗄️  Database: ${answers.database}\`);
});
`;
      await fs.writeFile(join(projectPath, 'server.js'), serverContent);

      // Create README
      const readmeContent = `# ${projectName}

Built with [Vasuzex Framework](https://github.com/rishicool/vasuzex)

## Getting Started

### Install Dependencies
\`\`\`bash
pnpm install
\`\`\`

### Setup Database
\`\`\`bash
pnpm db:migrate
pnpm db:seed
\`\`\`

### Run Development Server
\`\`\`bash
pnpm dev
\`\`\`

Visit http://localhost:3000

## Available Scripts

- \`pnpm dev\` - Start development server
- \`pnpm start\` - Start production server
- \`pnpm db:migrate\` - Run database migrations
- \`pnpm db:seed\` - Seed database
- \`pnpm db:fresh\` - Fresh migration with seeding
- \`pnpm test\` - Run tests

## Documentation

See [Vasuzex Documentation](https://github.com/rishicool/vasuzex/tree/main/docs)

## Starter Apps

${answers.starter === 'blog-api' || answers.starter === 'both' ? '- **Blog API**: RESTful blog API in `apps/blog-api`\n' : ''}${answers.starter === 'media-server' || answers.starter === 'both' ? '- **Media Server**: File upload & processing in `apps/media-server`\n' : ''}

## License

MIT
`;
      await fs.writeFile(join(projectPath, 'README.md'), readmeContent);

      spinner.succeed(chalk.green('Project created successfully! ✨'));

      console.log(chalk.blue.bold('\n📦 Next steps:\n'));
      console.log(chalk.gray(`  cd ${projectName}`));
      console.log(chalk.gray(`  pnpm install`));
      console.log(chalk.gray(`  pnpm db:migrate`));
      console.log(chalk.gray(`  pnpm dev`));
      console.log(chalk.blue('\n🎉 Happy coding with Vasuzex!\n'));

    } catch (error) {
      spinner.fail(chalk.red('Failed to create project'));
      console.error(error);
      process.exit(1);
    }
  });

program.parse();
