#!/usr/bin/env node

/**
 * Neastore Framework CLI
 * Laravel-style CLI for generating apps and services
 */

import { Command } from 'commander';
import { generateMediaServer } from './Commands/generate-media-server.js';
import { generateApp } from './Commands/generate-app.js';
import { deleteApp } from './Commands/delete-app.js';
import { addDependency } from './Commands/add-dependency.js';
import {
  dbMigrate,
  dbMigrateStatus,
  dbRollback,
  dbSeed,
  dbFresh,
  makeMigration,
  makeSeeder,
  makeModel,
  createDatabase,
} from './Commands/db-commands.js';

const program = new Command();

program
  .name('framework')
  .description('Neastore Framework CLI')
  .version('1.0.0');

// Generate media-server
program
  .command('generate:media-server')
  .description('Generate standalone media server')
  .option('-p, --port <port>', 'Port number', '4003')
  .action((options) => {
    generateMediaServer(options);
  });

// Generate app
program
  .command('generate:app <name>')
  .description('Generate new application (api, web, or both)')
  .option('-t, --type <type>', 'App type (api|web). Omit to generate both')
  .action((name, options) => {
    generateApp(name, options);
  });

// Delete app
program
  .command('delete:app <name>')
  .description('Delete application and cleanup references')
  .option('-t, --type <type>', 'App type (api|web). Omit to delete entire app')
  .option('-f, --force', 'Force delete without confirmation')
  .action((name, options) => {
    deleteApp(name, options);
  });

// Shorthand: framework generate media-server
program
  .command('generate <target>')
  .description('Generate app or service')
  .option('-p, --port <port>', 'Port for media-server', '4003')
  .option('-t, --type <type>', 'App type', 'api')
  .action((target, options) => {
    if (target === 'media-server') {
      generateMediaServer(options);
    } else if (target.startsWith('app=')) {
      const appName = target.split('=')[1];
      generateApp(appName, options);
    } else {
      console.error(`Unknown target: ${target}`);
      console.log('Usage:');
      console.log('  framework generate media-server');
      console.log('  framework generate app=<name>');
      process.exit(1);
    }
  });

// Database commands
program
  .command('db:create')
  .description('Create database if not exists')
  .action(createDatabase);

program
  .command('migrate')
  .description('Run database migrations')
  .action(dbMigrate);

program
  .command('migrate:status')
  .description('Show migration status')
  .action(dbMigrateStatus);

program
  .command('migrate:rollback')
  .description('Rollback the last database migration')
  .option('-s, --step <steps>', 'Number of migrations to rollback', '1')
  .action(dbRollback);

program
  .command('db:seed')
  .description('Seed the database')
  .option('-c, --class <class>', 'Specific seeder class to run')
  .action(dbSeed);

program
  .command('migrate:fresh')
  .description('Drop all tables and re-run all migrations')
  .option('--seed', 'Seed the database after migration')
  .action(dbFresh);

// Make commands
program
  .command('make:migration <name>')
  .description('Create a new migration file')
  .action(makeMigration);

program
  .command('make:seeder <name>')
  .description('Create a new seeder file')
  .action(makeSeeder);

program
  .command('make:model <name>')
  .description('Create a new model file')
  .option('-m, --migration', 'Create migration file along with model')
  .action(makeModel);

// Add dependency
program
  .command('add:dep <packages...>')
  .description('Add dependency to root and workspace apps')
  .option('-D, --dev', 'Add as dev dependency')
  .option('-w, --workspace', 'Install in all workspace apps')
  .action(addDependency);

program.parse();
