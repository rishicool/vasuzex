export default {
  // Default database connection
  default: process.env.DB_CONNECTION || 'postgresql',
  
  // Database connections
  connections: {
    postgresql: {
      driver: 'postgresql',
      host: process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
      database: process.env.POSTGRES_DB || 'vasuzex_dev',
      user: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD || '',
      charset: 'utf8',
      schema: 'public',
      pool: {
        min: 2,
        max: 10
      }
    },
    
    mysql: {
      driver: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306', 10),
      database: process.env.DB_DATABASE || 'vasuzex',
      user: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || '',
      charset: 'utf8mb4',
      collation: 'utf8mb4_unicode_ci'
    },
    
    sqlite: {
      driver: 'sqlite',
      database: process.env.DB_DATABASE || 'database.sqlite'
    }
  },
  
  // Migration configuration
  migrations: {
    table: 'migrations',
    directory: './database/migrations'
  },
  
  // Seeder configuration
  seeds: {
    directory: './database/seeders'
  }
};
