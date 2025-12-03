# Media Server

Centralized media server for dynamic thumbnail generation.

## Installation

```bash
cd apps/media-server
pnpm install
```

## Development

```bash
pnpm dev
```

Server runs on: http://localhost:4003

## Usage

### Get Thumbnail
```
GET http://localhost:4003/image/uploads/products/123/photo.jpg?w=400&h=400
```

### Get Allowed Sizes
```
GET http://localhost:4003/sizes
```

### Get Cache Stats
```
GET http://localhost:4003/cache/stats
```

### Clear Cache
```
DELETE http://localhost:4003/cache/clear
```

## Configuration

Configure in root `.env`:

```env
MEDIA_SERVER_PORT=4003
STORAGE_DRIVER=local
MEDIA_CACHE_PATH=./storage/media/cache
```

## Production

```bash
pnpm start
```
