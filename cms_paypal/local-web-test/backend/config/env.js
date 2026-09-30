require('dotenv').config();

// Fail fast if required secrets are missing
if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET is not set in .env. Exiting.');
  process.exit(1);
}
if (process.env.NODE_ENV !== 'development' && (!process.env.SWAGGER_USER || !process.env.SWAGGER_PASSWORD)) {
  console.error('FATAL: SWAGGER_USER and SWAGGER_PASSWORD must be set in .env (non-dev). Exiting.');
  process.exit(1);
}

const env = process.env.NODE_ENV || 'development';

const config = {
  env,
  isDev: env === 'development',
  isProd: env === 'production',
  isRecette: env === 'recette',
  isIntegration: env === 'integration',
  
  server: {
    port: process.env.PORT || 20005,
    url: process.env.SERVER_URL || 'http://localhost:20005',
  },
  
  db: {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
  },
  
  security: {
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
    jwtSecret: process.env.JWT_SECRET,
  },
  
  swagger: {
    user: process.env.SWAGGER_USER || 'admin',
    password: process.env.SWAGGER_PASSWORD || 'admin123',
  },
  
  logger: {
    level: process.env.LOG_LEVEL || (env === 'production' ? 'warn' : 'info'),
  }
};

module.exports = config;
