# Changelog

All notable changes to Vasuzex will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.4] - 2025-12-04

### Added
- **Web Framework Scaffolding**: Full support for React, Vue, Svelte with Vite
  - Interactive framework selection during `generate:app --type web`
  - Auto-configured Vite setup for each framework
  - Complete starter templates with working counter examples
  - `--framework` flag for direct framework selection
- **Health Route**: Added `/health` endpoint to all generated API apps
- **Media Facade**: Exported `Media` facade from main framework entry point
- **Port Conflict Warnings**: Added warnings in .env and console when generating multiple apps

### Fixed
- **Critical Template Bug**: Fixed `this.app.get()` → `this.express.get()` in generated apps
- **BaseServer/BaseApp API**: Complete redesign to match template expectations
  - BaseServer now accepts options object: `{appName, projectRoot, port}`
  - BaseApp enhanced with `build()`, `registerRoute()`, `setupRoutes()` methods
- **Import Paths**: Fixed all centralized database imports (5 levels up from src/)
- **Turbo Dependency**: Added `turbo@^2.6.1` to root devDependencies in project generator
- **Auto-Install**: Fixed `pnpm install` to run automatically after app generation
- **NPX Commands**: Changed from `npx vasuzex` to `pnpm vasuzex` in create-vasuzex for reliability
- **pnpm Compatibility**: Upgraded from pnpm@8.0.0 to pnpm@10.0.0 for Node v25 support

### Changed
- **Production Status**: Framework now production-ready (95% complete)
- **Root Dev Command**: `pnpm dev` now runs all apps in parallel using turbo
- **Package Manager**: Updated packageManager field to pnpm@10.0.0

### Dependencies
- Added: `joi@^17.13.3`, `bcryptjs@^2.4.3`, `jsonwebtoken@^9.0.2`
- Updated: `pnpm@10.0.0`, `turbo@^2.6.1`

## [1.0.3] - 2025-12-03

### Added
- Initial stable release
- Modularized generator utilities (12 utility files)
- Comprehensive API scaffolding
- Media server generation
- Database migrations and seeders
- Eloquent ORM integration

### Changed
- Refactored monolithic generator files into modular structure
- Improved code organization and maintainability

## [1.0.2] - 2025-12-01

### Fixed
- Minor bug fixes
- Documentation improvements

## [1.0.1] - 2025-11-30

### Fixed
- Package export issues
- CLI command registration

## [1.0.0] - 2025-11-29

### Added
- Initial release
- Laravel-inspired architecture
- GuruORM integration
- Facade pattern
- Service Container
- Database migrations
- Authentication scaffolding
- Media server
- Zero-configuration setup

---

[1.0.4]: https://github.com/rishicool/vasuzex/compare/v1.0.3...v1.0.4
[1.0.3]: https://github.com/rishicool/vasuzex/compare/v1.0.2...v1.0.3
[1.0.2]: https://github.com/rishicool/vasuzex/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/rishicool/vasuzex/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/rishicool/vasuzex/releases/tag/v1.0.0
