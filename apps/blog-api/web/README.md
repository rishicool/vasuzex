# blog-api WEB

blog-api web application with authentication.

## Structure

```
apps/blog-api/web/
├── src/
│   ├── controllers/         # Controllers (extend base Controller)
│   │   ├── Controller.js   # Base controller
│   │   └── AuthController.js
│   ├── models/             # Models (database entities)
│   │   └── User.js
│   ├── services/           # Business logic
│   │   └── AuthService.js
│   ├── middleware/         # Express middleware
│   │   ├── authMiddleware.js
│   │   └── errorHandler.js
│   ├── routes/             # API routes
│   │   ├── index.js
│   │   └── auth.routes.js
│   ├── requests/           # Request validators
│   │   └── AuthRequests.js
│   ├── index.js            # Framework bootstrap
│   └── server.js           # Express server
├── package.json
└── .env.example
```

## Installation

```bash
cd apps/blog-api/web
pnpm install
cp .env.example .env
```

## Development

```bash
pnpm dev
```

## API Endpoints

### Health Check
```
GET /health
```

### Authentication
```
POST /api/auth/register  - Register new user
POST /api/auth/login     - Login user
GET  /api/auth/me        - Get current user (protected)
POST /api/auth/logout    - Logout (protected)
```

## Authentication Flow

1. **Register:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","password":"123456"}'
```

2. **Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"123456"}'
```

3. **Access Protected Route:**
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Environment Variables

```env
APP_NAME=blog-api-web
APP_PORT=3000
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
```
