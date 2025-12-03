# Vasuzex Framework

Laravel-inspired framework for Node.js monorepo applications with Facades and Import Aliases. Built with ES modules, designed for scalability and developer experience.

## 🎯 Features

- **Laravel-Inspired Architecture** - Familiar structure for PHP developers
- **Facades System** - Static accessors like Laravel (DB, Cache, Auth, etc.)
- **Import Aliases** - Clean imports with `#framework`, `#models`, `#database`
- **Monorepo Ready** - Built for pnpm workspaces with Turborepo
- **GuruORM Integration** - Eloquent-style ORM with relationships, scopes, events
- **Hybrid Config System** - File-based (Laravel) + Database-driven (dynamic)
- **Storage Management** - Multi-disk support (Local, S3, custom)
- **Mail Service** - SMTP, SendGrid, SES providers
- **Cache & Queue** - Redis, Database, Array drivers
- **Authentication & Authorization** - Guards, gates, policies
- **Service Container** - Dependency injection and service resolution

## 📦 Installation

```bash
pnpm install
pnpm db:migrate
pnpm dev
```

## 🏗️ Structure

```
vasuzex/
├── apps/                    # Your applications
│   ├── blog-api/
│   └── todo-api/
├── config/                  # Laravel-style configs
│   ├── app.cjs
│   ├── database.cjs
│   ├── cache.cjs
│   └── auth.cjs
├── database/               # Database layer
│   ├── models/            # Eloquent-style models
│   ├── migrations/
│   └── seeders/
├── framework/             # Framework source
│   ├── Foundation/
│   ├── Database/
│   ├── Support/Facades/  # Laravel facades
│   └── Services/
```

## 🚀 Quick Start

### With Facades (Recommended)

```javascript
import { 
  Application,
  DB,
  Cache,
  Auth,
  Hash,
  Log
} from '#framework';

import { Post, User } from '#models';

const app = new Application(process.cwd());
await app.boot();

// Use facades
const users = await DB.table('users').where('active', true).get();

await Cache.put('key', 'value', 3600);

const user = await User.find(1);
await user.posts().getResults();

Log.info('App started');
```

### Import Aliases

```javascript
// Framework imports
import { DB, Cache, Auth } from '#framework';

// Models
import { Post, User, Comment } from '#models';

// Database
import { getDatabase } from '#database';

// Config
import config from '#config';
```

See [Import Aliases Guide](./docs/IMPORT_ALIASES.md) for complete documentation.

## 📚 Usage Examples

### Database (DB Facade)

```javascript
import { DB } from '#framework';

// Query builder
const users = await DB.table('users').where('active', true).get();

// Insert
await DB.table('posts').insert({ title: 'Hello', content: '...' });

// Update
await DB.table('users').where('id', 1).update({ name: 'John' });
```

### Models (Eloquent-style)

```javascript
import { Post, User } from '#models';

// Find
const post = await Post.find(1);

// Create
const user = await User.create({
  name: 'John Doe',
  email: 'john@example.com',
  password: 'secret' // Auto-hashed by mutator
});

// Relationships
const comments = await post.comments().getResults();

// Scopes
const published = await Post.where('status', 'published').get();

// Soft deletes
await user.delete(); // Soft delete
await user.restore();
await user.forceDelete(); // Permanent delete
```

### Cache

```javascript
import { Cache } from '#framework';

// Store
await Cache.put('key', 'value', 3600); // 1 hour

// Retrieve
const value = await Cache.get('key', 'default');

// Remember (cache if not exists)
const posts = await Cache.remember('posts', 3600, async () => {
  return await Post.all();
});
```

### Auth

```javascript
import { Auth, Hash } from '#framework';

// Attempt login
await Auth.attempt({ email: 'user@example.com', password: 'secret' });

// Get user
const user = Auth.user();

// Hash password
const hashed = await Hash.make('password');
const valid = await Hash.check('password', hashed);
```

### Logging

```javascript
import { Log } from '#framework';

Log.info('User logged in', { user_id: 123 });
Log.error('Error occurred', { error: err.message });
Log.warning('Cache miss');
```

## 🔧 Available Facades

| Facade | Service | Usage |
|--------|---------|-------|
| `DB` | Database | Query builder, raw queries |
| `Cache` | Cache | Store/retrieve cached data |
| `Auth` | Authentication | Login, logout, user info |
| `Hash` | Hashing | Password hashing |
| `Log` | Logging | Application logs |
| `Mail` | Email | Send emails |
| `Queue` | Queue | Dispatch jobs |
| `Storage` | File storage | File operations |
| `Config` | Configuration | Get/set config values |
| `Event` | Events | Dispatch/listen events |
| `Gate` | Authorization | Check permissions |
| `Session` | Session | Session management |

See [Facades Documentation](./framework/Support/Facades/README.md) for complete API.

## 📄 License

MIT
