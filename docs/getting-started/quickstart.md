# Quick Start Guide

> **⚠️ WARNING: DEVELOPMENT VERSION**  
> This framework is currently under active development and is **NOT recommended for production use**.  
> Use at your own risk. APIs may change without notice. Expect bugs and breaking changes.

This guide will walk you through building your first Vasuzex application - a simple Todo API.

## Prerequisites

- Node.js 18+ installed
- pnpm installed (`npm install -g pnpm`)
- PostgreSQL, MySQL, or SQLite database

## Step 1: Create Project

```bash
npx create-vasuzex my-todo-app
```

The interactive CLI will ask:
- **App to create**: Select "Custom/Empty"
- **Database**: Choose PostgreSQL (or your preference)
- **Database details**: Enter your connection info

```bash
cd my-todo-app
pnpm install
```

## Step 2: Create Database Migration

Generate a migration for the todos table:

```bash
npx vasuzex make:migration create_todos_table
```

Edit the generated migration file in `database/migrations/`:

```javascript
// database/migrations/XXX_create_todos_table.mjs
export async function up(db) {
  await db.schema.createTable('todos', (table) => {
    table.increments('id');
    table.string('title');
    table.text('description').nullable();
    table.boolean('completed').defaultTo(false);
    table.timestamps();
  });
}

export async function down(db) {
  await db.schema.dropTable('todos');
}
```

Run the migration:

```bash
pnpm db:migrate
```

## Step 3: Create Model

Create a Todo model:

```bash
npx vasuzex make:model Todo
```

Edit `database/models/Todo.js`:

```javascript
import { Model } from 'vasuzex';

export class Todo extends Model {
  static table = 'todos';
  
  static fillable = [
    'title',
    'description',
    'completed'
  ];
  
  static casts = {
    completed: 'boolean'
  };
}
```

Export from `database/models/index.js`:

```javascript
export { User } from './User.js';
export { Todo } from './Todo.js';
```

## Step 4: Create Controller

Create a controller:

```bash
npx vasuzex make:controller TodoController
```

Edit `apps/api/controllers/TodoController.js`:

```javascript
import { Controller } from 'vasuzex';
import { Todo } from '#models';

export class TodoController extends Controller {
  // Get all todos
  async index(req, res) {
    const todos = await Todo.all();
    
    return res.json({
      success: true,
      data: todos
    });
  }
  
  // Create new todo
  async store(req, res) {
    const todo = await Todo.create({
      title: req.body.title,
      description: req.body.description,
      completed: false
    });
    
    return res.status(201).json({
      success: true,
      data: todo
    });
  }
  
  // Get single todo
  async show(req, res) {
    const todo = await Todo.find(req.params.id);
    
    if (!todo) {
      return res.status(404).json({
        success: false,
        message: 'Todo not found'
      });
    }
    
    return res.json({
      success: true,
      data: todo
    });
  }
  
  // Update todo
  async update(req, res) {
    const todo = await Todo.find(req.params.id);
    
    if (!todo) {
      return res.status(404).json({
        success: false,
        message: 'Todo not found'
      });
    }
    
    await todo.update(req.body);
    
    return res.json({
      success: true,
      data: todo
    });
  }
  
  // Delete todo
  async destroy(req, res) {
    const todo = await Todo.find(req.params.id);
    
    if (!todo) {
      return res.status(404).json({
        success: false,
        message: 'Todo not found'
      });
    }
    
    await todo.delete();
    
    return res.json({
      success: true,
      message: 'Todo deleted'
    });
  }
  
  // Toggle completed status
  async toggle(req, res) {
    const todo = await Todo.find(req.params.id);
    
    if (!todo) {
      return res.status(404).json({
        success: false,
        message: 'Todo not found'
      });
    }
    
    await todo.update({
      completed: !todo.completed
    });
    
    return res.json({
      success: true,
      data: todo
    });
  }
}
```

## Step 5: Define Routes

Create or edit `apps/api/routes/api.js`:

```javascript
import { Router } from 'express';
import { TodoController } from '../controllers/TodoController.js';

const router = Router();
const todoController = new TodoController();

// Todo routes
router.get('/todos', (req, res) => todoController.index(req, res));
router.post('/todos', (req, res) => todoController.store(req, res));
router.get('/todos/:id', (req, res) => todoController.show(req, res));
router.put('/todos/:id', (req, res) => todoController.update(req, res));
router.delete('/todos/:id', (req, res) => todoController.destroy(req, res));
router.patch('/todos/:id/toggle', (req, res) => todoController.toggle(req, res));

export default router;
```

## Step 6: Register Routes

Edit `apps/api/server.js`:

```javascript
import express from 'express';
import { Application } from 'vasuzex';
import apiRoutes from './routes/api.js';

const app = express();
const vasuzex = new Application(process.cwd());

// Boot framework
await vasuzex.boot();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Register routes
app.use('/api', apiRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
```

## Step 7: Test Your API

Start the server:

```bash
pnpm dev
```

### Create a todo

```bash
curl -X POST http://localhost:3000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title": "Learn Vasuzex", "description": "Complete the quick start guide"}'
```

### Get all todos

```bash
curl http://localhost:3000/api/todos
```

### Get single todo

```bash
curl http://localhost:3000/api/todos/1
```

### Update todo

```bash
curl -X PUT http://localhost:3000/api/todos/1 \
  -H "Content-Type: application/json" \
  -d '{"title": "Learn Vasuzex Framework"}'
```

### Toggle completed

```bash
curl -X PATCH http://localhost:3000/api/todos/1/toggle
```

### Delete todo

```bash
curl -X DELETE http://localhost:3000/api/todos/1
```

## Step 8: Add Validation

Create a form request for validation:

```javascript
// apps/api/requests/CreateTodoRequest.js
export class CreateTodoRequest {
  rules() {
    return {
      title: 'required|string|min:3|max:255',
      description: 'string|max:1000',
      completed: 'boolean'
    };
  }
  
  messages() {
    return {
      'title.required': 'Todo title is required',
      'title.min': 'Title must be at least 3 characters',
      'title.max': 'Title cannot exceed 255 characters'
    };
  }
}
```

Use it in your controller:

```javascript
import { Validator } from 'vasuzex';
import { CreateTodoRequest } from '../requests/CreateTodoRequest.js';

export class TodoController extends Controller {
  async store(req, res) {
    // Validate request
    const request = new CreateTodoRequest();
    const validator = new Validator(req.body, request.rules(), request.messages());
    
    if (validator.fails()) {
      return res.status(422).json({
        success: false,
        errors: validator.errors()
      });
    }
    
    const todo = await Todo.create(validator.validated());
    
    return res.status(201).json({
      success: true,
      data: todo
    });
  }
}
```

## Step 9: Add Database Seeder

Create a seeder for sample data:

```bash
npx vasuzex make:seeder TodoSeeder
```

Edit `database/seeders/TodoSeeder.js`:

```javascript
import { Todo } from '#models';

export class TodoSeeder {
  async run() {
    await Todo.create([
      {
        title: 'Learn Vasuzex',
        description: 'Complete the documentation',
        completed: false
      },
      {
        title: 'Build API',
        description: 'Create a REST API',
        completed: true
      },
      {
        title: 'Deploy App',
        description: 'Deploy to production',
        completed: false
      }
    ]);
  }
}
```

Run the seeder:

```bash
pnpm db:seed
```

## Step 10: Use Facades

Refactor using facades for cleaner code:

```javascript
import { DB, Cache, Log } from 'vasuzex';
import { Todo } from '#models';

export class TodoController extends Controller {
  async index(req, res) {
    // Cache todos for 1 hour
    const todos = await Cache.remember('todos', 3600, async () => {
      Log.info('Fetching todos from database');
      return await Todo.all();
    });
    
    return res.json({
      success: true,
      data: todos
    });
  }
  
  async store(req, res) {
    // Use DB transaction
    const todo = await DB.transaction(async () => {
      const newTodo = await Todo.create(req.body);
      
      // Clear cache
      await Cache.forget('todos');
      
      // Log activity
      Log.info('Todo created', { id: newTodo.id });
      
      return newTodo;
    });
    
    return res.status(201).json({
      success: true,
      data: todo
    });
  }
}
```

## Next Steps

Congratulations! You've built your first Vasuzex application. Here's what to explore next:

### Learn More About

- **[Database](../database/getting-started.md)**: Advanced queries, relationships, scopes
- **[Validation](../../framework/Services/Validation/README.md)**: Comprehensive validation rules
- **[Authentication](../auth/authentication.md)**: Add user authentication
- **[Middleware](../http/middleware.md)**: Create custom middleware
- **[Caching](../services/cache.md)**: Optimize with Redis
- **[File Upload](../services/upload.md)**: Handle file uploads

### Enhance Your Todo App

#### Add User Authentication

```javascript
import { Auth } from 'vasuzex';

// Protect routes
router.use('/todos', async (req, res, next) => {
  if (!await Auth.check()) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
});

// Associate todos with users
export class Todo extends Model {
  user() {
    return this.belongsTo('User');
  }
}
```

#### Add Filtering

```javascript
async index(req, res) {
  let query = Todo.query();
  
  // Filter by completed status
  if (req.query.completed !== undefined) {
    query.where('completed', req.query.completed === 'true');
  }
  
  // Search by title
  if (req.query.search) {
    query.where('title', 'like', `%${req.query.search}%`);
  }
  
  const todos = await query.get();
  
  return res.json({ success: true, data: todos });
}
```

#### Add Pagination

```javascript
import { Paginator } from 'vasuzex';

async index(req, res) {
  const page = parseInt(req.query.page) || 1;
  const perPage = 10;
  
  const todos = await Todo.paginate(page, perPage);
  
  return res.json({
    success: true,
    data: todos.data,
    meta: {
      current_page: todos.current_page,
      last_page: todos.last_page,
      per_page: todos.per_page,
      total: todos.total
    }
  });
}
```

#### Add Soft Deletes

```javascript
export class Todo extends Model {
  static softDeletes = true;
  
  // Use deleted_at column
  static dates = ['created_at', 'updated_at', 'deleted_at'];
}

// In migration
table.timestamp('deleted_at').nullable();

// Now delete() soft deletes
await todo.delete(); // Soft delete

// Force delete
await todo.forceDelete(); // Permanent

// Restore
await todo.restore();

// Query with trashed
const all = await Todo.withTrashed().get();
const onlyTrashed = await Todo.onlyTrashed().get();
```

## Common Patterns

### API Resource Transformation

```javascript
// resources/TodoResource.js
export class TodoResource {
  constructor(todo) {
    this.todo = todo;
  }
  
  toJSON() {
    return {
      id: this.todo.id,
      title: this.todo.title,
      description: this.todo.description,
      completed: this.todo.completed,
      created_at: this.todo.created_at,
      // Computed properties
      status: this.todo.completed ? 'done' : 'pending',
      // Relationships
      user: this.todo.user ? {
        id: this.todo.user.id,
        name: this.todo.user.name
      } : null
    };
  }
}

// Use in controller
const todos = await Todo.all();
return res.json({
  data: todos.map(t => new TodoResource(t).toJSON())
});
```

### Service Layer

```javascript
// services/TodoService.js
import { Todo } from '#models';
import { Cache, Log } from 'vasuzex';

export class TodoService {
  async getAllTodos(filters = {}) {
    let query = Todo.query();
    
    if (filters.completed !== undefined) {
      query.where('completed', filters.completed);
    }
    
    if (filters.user_id) {
      query.where('user_id', filters.user_id);
    }
    
    return await query.get();
  }
  
  async createTodo(data, userId) {
    const todo = await Todo.create({
      ...data,
      user_id: userId
    });
    
    await Cache.forget(`user_todos_${userId}`);
    Log.info('Todo created', { id: todo.id, user_id: userId });
    
    return todo;
  }
}
```

## Troubleshooting

### Database Connection Issues

```javascript
// Test database connection
import { DB } from 'vasuzex';

try {
  await DB.raw('SELECT 1');
  console.log('Database connected');
} catch (error) {
  console.error('Database error:', error.message);
}
```

### Migration Errors

```bash
# Check migration status
npx vasuzex migrate:status

# Rollback last migration
npx vasuzex migrate:rollback

# Fresh migration (drops all tables)
npx vasuzex migrate:fresh
```

### Model Not Found

```javascript
// Make sure model is exported
// database/models/index.js
export { Todo } from './Todo.js';

// Import correctly
import { Todo } from '#models';
```

## Further Reading

- [Directory Structure](structure.md)
- [Configuration](configuration.md)
- [Database Guide](../database/getting-started.md)
- [HTTP Controllers](../http/controllers.md)
- [Authentication](../auth/authentication.md)
