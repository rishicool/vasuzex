# Vasuzex Framework

> **⚠️ WARNING: DEVELOPMENT VERSION**  
> This framework is currently under active development and is **NOT recommended for production use**.  
> Use at your own risk. APIs may change without notice. Expect bugs and breaking changes.

A Laravel-inspired Node.js framework with Eloquent ORM, Facades, and zero-configuration setup.

## ⚡ Quick Start

```bash
npx create-vasuzex my-app
cd my-app
pnpm install
pnpm db:migrate
pnpm dev
```

That's it! Your app is running on `http://localhost:3000` 🎉

## 🎯 Features

- **🚀 Zero Configuration** - Interactive CLI sets up everything
- **📦 GuruORM Built-in** - Eloquent-style ORM included (no separate install)
- **🎨 Laravel-Inspired** - Familiar structure for PHP developers
- **🔧 Starter Apps** - Blog API & Media Server ready to use
- **📁 Import Aliases** - Clean imports: `vasuzex`, `#models`, `#config`
- **💾 Database Ready** - PostgreSQL, MySQL, SQLite support
- **🔐 Authentication** - Guards, middleware, hashing built-in
- **📧 Services** - Mail, SMS, Cache, Queue, Storage, Upload
- **🖼️ Media Processing** - Image resize, optimization with Sharp
- **✅ Validation** - Comprehensive validation including Indian validators
- **📍 Location** - Geocoding, distance, area calculations
- **🌍 GeoIP** - IP geolocation with MaxMind

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
} from 'vasuzex';

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
import { DB, Cache, Auth } from 'vasuzex';

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
import { DB } from 'vasuzex';

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
import { Cache } from 'vasuzex';

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
import { Auth, Hash } from 'vasuzex';

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
import { Log } from 'vasuzex';

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
