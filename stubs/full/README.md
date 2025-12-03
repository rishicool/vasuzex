# PROJECT_NAME

Built with [Vasuzex Framework](https://github.com/rishicool/vasuzex) - A Laravel-inspired Node.js framework.

> ⚠️ **WARNING: DEVELOPMENT VERSION**  
> This framework is currently under active development and is **NOT recommended for production use**.  
> Use at your own risk. APIs may change without notice.

## Quick Start

```bash
# Install dependencies
pnpm install

# Setup environment
cp .env.example .env
# Edit .env with your database credentials

# Generate your first app
pnpm generate:app my-api

# Run migrations
pnpm db:migrate

# Start your app
cd apps/my-api
pnpm dev
```

## Available Commands

### Database
```bash
pnpm db:migrate              # Run database migrations
pnpm db:migrate:status       # Check migration status
pnpm db:seed                 # Seed database with sample data
pnpm db:reset                # Reset database (fresh + seed)
```

### Code Generation
```bash
pnpm generate:app <name>     # Generate new app in apps/ folder
pnpm make:model <name>       # Create Eloquent model
pnpm make:migration <name>   # Create database migration
```

### Using CLI Directly
```bash
npx vasuzex generate:app blog-api
npx vasuzex make:model Post
npx vasuzex make:migration create_posts_table
npx vasuzex migrate
npx vasuzex db:seed
```

## Project Structure

```
.
├── apps/                    # Your applications (generated via CLI)
│   └── my-api/             # Example app
│       ├── routes/         # App routes
│       ├── controllers/    # App controllers
│       ├── middleware/     # App middleware
│       └── server.js       # App entry point
├── config/                  # Global configuration
│   ├── app.js              # Application config
│   ├── database.js         # Database connections
│   └── index.js            # Config aggregator
├── database/                # Shared database layer
│   ├── models/             # Eloquent models
│   ├── migrations/         # Database migrations
│   └── seeders/            # Database seeders
├── .env                     # Environment variables
├── package.json             # Dependencies
└── README.md                # This file
```

**Note:** This is a monorepo structure. Each app in `apps/` is independent with its own server, routes, and logic.

## Usage Examples

### Creating a Model

```bash
npx vasuzex make:model User
```

This creates `database/models/User.js`:

```javascript
import { Model } from 'vasuzex';

export class User extends Model {
  static table = 'users';
  
  static fillable = ['name', 'email', 'password'];
  
  static hidden = ['password'];
}
```

### Using the Model

```javascript
import { User } from './database/models/User.js';

// Create
const user = await User.create({
  name: 'John Doe',
  email: 'john@example.com',
  password: 'secret'
});

// Find
const user = await User.find(1);

// Query
const users = await User.where('active', true).get();

// Update
user.name = 'Jane Doe';
await user.save();

// Delete
await user.delete();
```

### Using Facades

```javascript
import { DB, Cache, Log } from 'vasuzex';

// Database
const users = await DB.table('users').where('active', true).get();

// Cache
await Cache.put('key', 'value', 3600);
const value = await Cache.get('key');

// Logging
Log.info('User logged in', { user_id: 1 });
```

## Environment Variables

Key environment variables in `.env`:

```env
NODE_ENV=development          # Environment: development, production
PORT=3000                     # Server port
APP_NAME=MyApp                # Application name
APP_DEBUG=true                # Enable debug mode

# Database
DB_CONNECTION=postgresql      # Database driver
POSTGRES_HOST=localhost       # Database host
POSTGRES_PORT=5432           # Database port
POSTGRES_DB=myapp_dev        # Database name
POSTGRES_USER=postgres       # Database user
POSTGRES_PASSWORD=           # Database password
```

## Documentation

- [Vasuzex Documentation](https://github.com/rishicool/vasuzex/tree/main/docs)
- [GuruORM Documentation](https://www.npmjs.com/package/guruorm)
- [API Reference](https://github.com/rishicool/vasuzex/tree/main/docs/api)

## Features

- ✅ **Eloquent ORM** - Laravel-style models and relationships
- ✅ **Facades** - Static interface to services
- ✅ **Service Container** - Dependency injection
- ✅ **Migrations** - Database version control
- ✅ **Seeders** - Sample data generation
- ✅ **Query Builder** - Fluent database queries
- ✅ **Validation** - Request validation with Indian validators
- ✅ **File Upload** - Image processing and storage
- ✅ **SMS & Email** - Communication services
- ✅ **Location & GeoIP** - Location-based services

## License

MIT
