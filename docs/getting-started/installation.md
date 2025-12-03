# Installation

## Requirements

- **Node.js**: >= 18.0.0
- **pnpm**: >= 8.0.0 (recommended)
- **Database**: PostgreSQL 12+, MySQL 5.7+, or SQLite

## Quick Start

Create a new Vasuzex project with one command:

```bash
npx create-vasuzex my-app
```

This interactive CLI will ask you:
- Which starter application you want (Blog API, Media Server, or Both)
- Database preference (PostgreSQL, MySQL, SQLite)
- Database connection details

That's it! Everything is configured automatically.

## What Happens During Installation

The CLI automatically:

✅ Creates project structure  
✅ Sets up framework core  
✅ Configures database connection  
✅ Installs all dependencies (including GuruORM)  
✅ Creates `.env` file with your settings  
✅ Sets up import aliases  
✅ Generates `package.json` with scripts  
✅ Copies starter applications (if selected)  
✅ Creates `.gitignore`  
✅ Generates `README.md`

## After Installation

```bash
cd my-app
pnpm install
pnpm db:migrate
pnpm dev
```

Your app is now running at `http://localhost:3000`! 🎉

## Available Commands

```bash
pnpm dev          # Start development server
pnpm start        # Start production server
pnpm db:migrate   # Run database migrations
pnpm db:seed      # Seed database
pnpm db:fresh     # Fresh migration with seeding
pnpm test         # Run tests
```

## What You Get

### Framework Core
- Authentication & Authorization
- Database ORM (GuruORM integrated)
- HTTP routing & controllers
- Middleware system
- Service container
- All framework services

### Starter Applications (Optional)

**Blog API**: Full-featured RESTful blog
- User authentication
- Post CRUD operations
- Comments system
- Validation & middleware

**Media Server**: File upload & processing
- Image upload & resize
- File storage management
- Multiple storage drivers
- Image optimization


## Verify Installation

Your server should already be running. Visit:

- `http://localhost:3000` - Main application
- `http://localhost:3000/health` - Health check

## Example: Creating Your First Route

Edit `server.js`:

```javascript
app.get('/api/users', (req, res) => {
  res.json({ users: [] });
});
```

That's it! No configuration needed.

## Starter Applications

If you selected starter apps during installation:

### Blog API
```bash
cd apps/blog-api
pnpm dev
```

Features:
- `/api/posts` - CRUD operations
- `/api/auth` - Authentication
- `/api/comments` - Comments system

### Media Server
```bash
cd apps/media-server
pnpm dev
```

Features:
- `/api/upload` - File upload
- `/api/media` - Media management
- Image resizing & optimization

## Next Steps

- [Quick Start Tutorial](quickstart.md)
- [Directory Structure](structure.md)
- [Database Guide](../database/getting-started.md)
- [Routing](../http/routing.md)
