// Type definitions for environment variables

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test';
      PORT: string;
      MONGODB_URI: string;
      JWT_SECRET: string;
      CORS_ORIGIN: string;
      LOG_LEVEL: 'error' | 'warn' | 'info' | 'debug';
    }
  }
}

export {};
