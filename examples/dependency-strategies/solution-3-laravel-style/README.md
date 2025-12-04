# Solution 3: Laravel-Style Framework Core Bundle

## Concept
Vasuzex package includes **ALL** common dependencies. User projects have minimal setup.

## Project Structure
```
my-project/
├── node_modules/
│   └── vasuzex/                    # Framework package
│       ├── framework/
│       ├── config/
│       ├── database/
│       └── node_modules/           # 🔥 ALL deps bundled here
│           ├── express/
│           ├── cors/
│           ├── helmet/
│           ├── bcryptjs/
│           ├── joi/
│           ├── jsonwebtoken/
│           ├── guruorm/
│           └── sharp/
├── apps/
│   ├── blog/
│   │   ├── api/
│   │   │   ├── src/
│   │   │   └── package.json        # ONLY: { "dependencies": { "vasuzex": "^1.0.11" } }
│   │   └── web/
│   │       ├── src/
│   │       └── package.json        # ONLY: { "dependencies": { "vasuzex": "^1.0.11", "react": "^18.2.0" } }
│   └── shop/
│       ├── api/
│       │   └── package.json        # ONLY: { "dependencies": { "vasuzex": "^1.0.11" } }
│       └── web/
│           └── package.json        # ONLY: { "dependencies": { "vasuzex": "^1.0.11", "vue": "^3.4.0" } }
├── package.json                    # Workspace config
└── pnpm-workspace.yaml
```

## Key Files

### 1. Root package.json (User Project)
```json
{
  "name": "my-vasuzex-project",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "apps/**/api",
    "apps/**/web"
  ],
  "devDependencies": {
    "turbo": "^2.6.1",
    "nodemon": "^3.1.11"
  }
}
```

**Total dependencies declared by user: 2** (turbo, nodemon)

---

### 2. vasuzex/package.json (Framework Package)
```json
{
  "name": "vasuzex",
  "version": "1.0.11",
  "description": "Laravel-inspired framework for Node.js",
  "type": "module",
  "main": "./framework/index.js",
  "exports": {
    ".": "./framework/index.js",
    "./Database": "./framework/Database/index.js",
    "./Http": "./framework/Http/index.js",
    "./Support": "./framework/Support/index.js"
  },
  "dependencies": {
    "express": "^5.2.1",
    "cors": "^2.8.5",
    "helmet": "^8.1.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "joi": "^17.13.3",
    "guruorm": "^2.0.0",
    "axios": "^1.13.2",
    "chalk": "^5.6.2",
    "dotenv": "^16.6.1",
    "multer": "^2.0.2",
    "sharp": "^0.33.5",
    "maxmind": "^5.0.1",
    "pg": "^8.16.3"
  },
  "peerDependencies": {
    "react": ">=18.0.0",
    "react-dom": ">=18.0.0",
    "vue": ">=3.0.0",
    "svelte": ">=4.0.0"
  },
  "peerDependenciesMeta": {
    "react": { "optional": true },
    "react-dom": { "optional": true },
    "vue": { "optional": true },
    "svelte": { "optional": true }
  }
}
```

**All backend deps bundled in vasuzex!**
**Web frameworks as optional peer deps**

---

### 3. apps/blog/api/package.json (API App)
```json
{
  "name": "blog-api",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "nodemon src/index.js",
    "start": "node src/index.js"
  },
  "dependencies": {
    "vasuzex": "^1.0.11"
  }
}
```

**That's it! Just vasuzex dependency.**
**Gets: express, cors, helmet, bcryptjs, joi, jsonwebtoken, guruorm automatically!**

---

### 4. apps/blog/web/package.json (React App)
```json
{
  "name": "blog-web",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "vasuzex": "^1.0.11",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.2.1"
  }
}
```

**Only web-specific deps declared.**
**Vasuzex provides backend integration utilities.**

---

## How It Works

### Installation
```bash
# User creates project
create-vasuzex my-project

# Structure created automatically
cd my-project

# Single install command
pnpm install

# What happens:
# 1. Installs vasuzex@1.0.11
# 2. Vasuzex brings all backend deps
# 3. Apps only declare web framework (react/vue/svelte)
# 4. Total node_modules: ~150MB (vs 800MB before)
```

### Import Usage (No Change!)
```javascript
// apps/blog/api/src/controllers/AuthController.js
import { Controller } from 'vasuzex';
import express from 'express';        // ✅ Available via vasuzex
import bcrypt from 'bcryptjs';        // ✅ Available via vasuzex
import jwt from 'jsonwebtoken';       // ✅ Available via vasuzex
import Joi from 'joi';                // ✅ Available via vasuzex

// Everything works the same!
```

---

## Benefits

### 1. **Zero Configuration**
User doesn't manage dependencies. Framework does it.

### 2. **Guaranteed Compatibility**
All packages tested together by framework maintainers.

### 3. **Smaller User Projects**
```json
// User's package.json = 5-10 lines
{
  "name": "my-app",
  "dependencies": {
    "vasuzex": "^1.0.11"
  }
}
```

### 4. **Faster Updates**
```bash
# Update entire stack
pnpm update vasuzex

# Gets new versions of:
# - express
# - bcryptjs
# - joi
# - All other deps
```

### 5. **Perfect for Beginners**
No need to understand npm/pnpm/dependencies. Just install vasuzex!

---

## Disk Space Comparison

### Before (Current)
```
5 API apps × 120MB each = 600MB
3 Web apps × 80MB each = 240MB
Total: 840MB
```

### After (Laravel-style)
```
vasuzex node_modules: 100MB
React (3 apps shared): 30MB
Vue (2 apps shared): 20MB
Total: 150MB

Savings: 690MB (82% reduction!)
```

---

## Trade-offs

### Pros ✅
- Simplest for users
- True framework experience
- Maximum disk savings
- Centralized version control
- Laravel/Rails philosophy

### Cons ⚠️
- Vasuzex package becomes larger (~50MB)
- Less flexibility (but this is intentional!)
- Users can't easily use different package versions

---

## When to Use This

✅ **Perfect for:**
- Framework-first projects
- Teams that want consistency
- Beginners learning backend development
- Projects with multiple apps using same stack

❌ **Not ideal for:**
- Projects needing different package versions per app
- Microservices architecture (use separate repos instead)
- Highly customized setups

---

## Migration Guide

### From Current Vasuzex to Laravel-Style

#### Step 1: Clean existing node_modules
```bash
cd my-project
rm -rf apps/*/node_modules
rm -rf apps/*/*/node_modules
```

#### Step 2: Update app package.json files
```bash
# Simplify each app's package.json
cat > apps/blog/api/package.json << 'EOF'
{
  "name": "blog-api",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "nodemon src/index.js",
    "start": "node src/index.js"
  },
  "dependencies": {
    "vasuzex": "^1.0.11"
  }
}
EOF
```

#### Step 3: Reinstall
```bash
pnpm install
```

#### Step 4: Verify
```bash
# Check node_modules
du -sh node_modules
# Should be ~100-150MB

# Test apps
pnpm dev:blog-api
pnpm dev:blog-web
```

---

## Conclusion

**Laravel-style bundling** makes Vasuzex feel like a true framework, not just a collection of tools. Users focus on building apps, not managing dependencies.

**Recommended for:** v2.0.0 release (breaking change)
