# Solution 4: Hybrid Approach (Workspace + Framework Bundle)

## Concept
Combine **PNPM workspace hoisting** + **Framework bundled deps** + **Optional overrides**.

Best of all worlds!

## Project Structure
```
my-project/
├── node_modules/                    # 🔥 ROOT - All dependencies hoisted here
│   ├── vasuzex/                     # Framework
│   ├── express/                     # Shared backend deps
│   ├── cors/
│   ├── helmet/
│   ├── bcryptjs/
│   ├── joi/
│   ├── jsonwebtoken/
│   ├── guruorm/
│   ├── react/                       # Shared frontend deps
│   ├── react-dom/
│   ├── vue/
│   ├── vite/
│   └── sharp/
├── apps/
│   ├── blog/
│   │   ├── api/
│   │   │   ├── src/
│   │   │   └── package.json        # Declares deps, but installed at root
│   │   └── web/
│   │       ├── src/
│   │       └── package.json
│   ├── shop/
│   │   ├── api/
│   │   │   └── package.json
│   │   └── web/
│   │       └── package.json
│   └── media-server/
│       └── package.json
├── package.json                     # 🔥 Manages all shared dependencies
├── pnpm-workspace.yaml
└── .npmrc                           # 🔥 Hoisting configuration
```

## Key Files

### 1. Root package.json (Manages ALL deps)
```json
{
  "name": "my-vasuzex-project",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "apps/**/api",
    "apps/**/web",
    "apps/media-server"
  ],
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "db:migrate": "vasuzex migrate"
  },
  "dependencies": {
    "vasuzex": "^1.0.11",
    "guruorm": "^2.0.0",
    "express": "^5.2.1",
    "cors": "^2.8.5",
    "helmet": "^8.1.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "joi": "^17.13.3",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "vue": "^3.4.0",
    "svelte": "^4.2.0",
    "axios": "^1.13.2",
    "sharp": "^0.33.5"
  },
  "devDependencies": {
    "turbo": "^2.6.1",
    "nodemon": "^3.1.11",
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.2.1",
    "@vitejs/plugin-vue": "^5.0.0",
    "@sveltejs/vite-plugin-svelte": "^3.0.0"
  },
  "pnpm": {
    "overrides": {
      "express": "^5.2.1",
      "react": "^18.2.0"
    }
  }
}
```

**🔥 Key Points:**
- ALL common dependencies listed once
- Installed once at root
- Apps inherit automatically
- Can override versions if needed

---

### 2. .npmrc (Hoisting Configuration)
```ini
# Hoist all dependencies to workspace root
hoist=true
hoist-pattern[]=*

# Use shamefully-hoist for better compatibility
shamefully-hoist=true

# Shared lockfile for entire workspace
shared-workspace-lockfile=true

# Strict peer dependencies (can be false for flexibility)
strict-peer-dependencies=false

# Auto install peers
auto-install-peers=true
```

**🔥 This file is KEY!**
- Makes pnpm install everything at root
- Apps access deps from parent node_modules

---

### 3. pnpm-workspace.yaml
```yaml
packages:
  - 'apps/**/api'
  - 'apps/**/web'
  - 'apps/media-server'
```

---

### 4. apps/blog/api/package.json (API App)
```json
{
  "name": "blog-api",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "nodemon src/index.js",
    "start": "node src/index.js"
  }
}
```

**🔥 NO dependencies section!**
**Inherits from root package.json automatically!**

---

### 5. apps/blog/web/package.json (React App)
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
  }
}
```

**🔥 NO dependencies section!**
**Gets react, vite from root!**

---

### 6. apps/shop/web/package.json (Vue App - Optional Override)
```json
{
  "name": "shop-web",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  },
  "dependencies": {
    "vue": "^3.5.0"
  }
}
```

**🔥 Special case:**
**This app needs newer Vue, so declares it explicitly**
**PNPM installs this specific version for this app only**

---

## How It Works

### Installation Process
```bash
# User creates project
create-vasuzex my-project
cd my-project

# Single install at root
pnpm install

# What happens:
# 1. Reads root package.json
# 2. Reads all app package.json files
# 3. Hoists common deps to root node_modules
# 4. Creates symlinks in app folders if needed
# 5. Installs app-specific deps separately (if any)
```

### Dependency Resolution
```
1. App needs 'express'
   ↓
2. Checks app's node_modules → Not found
   ↓
3. Checks parent node_modules → Found!
   ↓
4. Uses root's express@5.2.1
```

---

## Benefits

### 1. **Maximum Disk Savings**
```
Before:
- blog-api/node_modules: 120MB
- shop-api/node_modules: 120MB
- customer-api/node_modules: 120MB
- blog-web/node_modules: 80MB
- shop-web/node_modules: 80MB
Total: 520MB

After:
- root/node_modules: 150MB
Total: 150MB

Savings: 370MB (71%)!
```

### 2. **Centralized Version Control**
One place to update all dependencies:
```bash
# Update express everywhere
pnpm update express

# Updates in root package.json
# All apps get new version automatically
```

### 3. **Flexibility When Needed**
```json
// Most apps use react@18.2.0 from root
// But admin panel needs react@19.0.0

// apps/admin/web/package.json
{
  "dependencies": {
    "react": "^19.0.0"  // ✅ Gets its own version
  }
}
```

### 4. **Faster CI/CD**
```bash
# Instead of 5 separate installs
pnpm install  # blog-api
pnpm install  # shop-api
pnpm install  # customer-api
pnpm install  # blog-web
pnpm install  # shop-web

# Just one install
pnpm install  # Everything!

# Time: 3 minutes → 45 seconds
```

### 5. **Better Caching**
```bash
# Turborepo cache works better
turbo build

# Shared deps = better cache hits
# Faster builds across apps
```

---

## Advanced Features

### 1. Version Overrides (pnpm only)
```json
// root/package.json
{
  "pnpm": {
    "overrides": {
      "express": "5.2.1",           // Force exact version
      "lodash": ">=4.17.21",         // Minimum version
      "moment": "npm:dayjs@^1.11.0"  // Replace package
    }
  }
}
```

### 2. Dependency Catalogs (pnpm 8.7+)
```json
// root/package.json
{
  "pnpm": {
    "catalogs": {
      "default": {
        "express": "^5.2.1",
        "react": "^18.2.0"
      }
    }
  }
}

// apps/blog/api/package.json
{
  "dependencies": {
    "express": "catalog:",  // Uses version from catalog
    "cors": "catalog:"
  }
}
```

### 3. Workspace Protocol
```json
// apps/blog/api/package.json
{
  "dependencies": {
    "vasuzex": "workspace:*",  // Uses local vasuzex if developing framework
    "express": "^5.2.1"
  }
}
```

---

## Comparison: Hybrid vs Laravel-Style

| Feature | Hybrid | Laravel-Style |
|---------|--------|---------------|
| **Disk Space** | 150MB | 150MB |
| **User Complexity** | Medium | Low |
| **Flexibility** | High | Low |
| **Framework Control** | Shared | Total |
| **App Isolation** | Medium | Low |
| **Version Overrides** | ✅ Easy | ❌ Hard |
| **Best For** | Advanced users | Beginners |

---

## When to Use Hybrid

✅ **Perfect for:**
- Large teams with varied needs
- Projects with some custom requirements
- Gradual migration from microservices
- When some apps need different versions
- Enterprise with complex dependencies

✅ **Also good for:**
- Open source projects
- Multi-tenant SaaS platforms
- White-label solutions

---

## Migration Guide

### From Current to Hybrid

#### Step 1: Create .npmrc
```bash
cat > .npmrc << 'EOF'
hoist=true
hoist-pattern[]=*
shamefully-hoist=true
shared-workspace-lockfile=true
auto-install-peers=true
EOF
```

#### Step 2: Move deps to root
```bash
# Combine all app dependencies into root package.json
cat > package.json << 'EOF'
{
  "name": "my-project",
  "private": true,
  "workspaces": ["apps/**/api", "apps/**/web"],
  "dependencies": {
    "vasuzex": "^1.0.11",
    "express": "^5.2.1",
    "cors": "^2.8.5",
    "helmet": "^8.1.0",
    "bcryptjs": "^2.4.3",
    "joi": "^17.13.3",
    "jsonwebtoken": "^9.0.2",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "vue": "^3.4.0"
  },
  "devDependencies": {
    "turbo": "^2.6.1",
    "nodemon": "^3.1.11",
    "vite": "^5.0.0"
  }
}
EOF
```

#### Step 3: Clean app package.json files
```bash
# Keep only scripts, remove dependencies
cat > apps/blog/api/package.json << 'EOF'
{
  "name": "blog-api",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "nodemon src/index.js",
    "start": "node src/index.js"
  }
}
EOF
```

#### Step 4: Clean and reinstall
```bash
rm -rf node_modules
rm -rf apps/*/node_modules
rm -rf apps/*/*/node_modules
rm pnpm-lock.yaml

pnpm install
```

#### Step 5: Verify
```bash
# Check size
du -sh node_modules
# Should be ~100-150MB total

# Test apps
pnpm dev:blog-api
pnpm dev:blog-web

# All should work!
```

---

## Real-World Example

### Before
```
my-ecommerce/
├── apps/
│   ├── customer-api/node_modules/     120MB
│   ├── admin-api/node_modules/        120MB
│   ├── vendor-api/node_modules/       120MB
│   ├── customer-web/node_modules/      80MB
│   ├── admin-web/node_modules/         80MB
│   └── vendor-web/node_modules/        80MB
Total: 600MB
Install time: 4 minutes
```

### After (Hybrid)
```
my-ecommerce/
├── node_modules/                      150MB
│   ├── vasuzex/
│   ├── express/
│   ├── react/
│   └── (all shared deps)
└── apps/
    ├── customer-api/   (no node_modules)
    ├── admin-api/      (no node_modules)
    ├── vendor-api/     (no node_modules)
    ├── customer-web/   (no node_modules)
    ├── admin-web/      (no node_modules)
    └── vendor-web/     (no node_modules)
Total: 150MB
Install time: 50 seconds

Savings: 450MB (75%)
Time saved: 3m 10s (79%)
```

---

## Conclusion

**Hybrid approach** gives you:
- ✅ **Simplicity** of framework bundling
- ✅ **Flexibility** of workspace management
- ✅ **Performance** of shared dependencies
- ✅ **Control** when you need it

**Best for:** Production-ready monorepos with multiple apps

**Recommended:** Implement in v1.1.0 as **default** approach
