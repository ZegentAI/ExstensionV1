import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

const config = {
  server: {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
    corsOrigin: process.env.CORS_ORIGIN || '*',
    maxRequestSize: process.env.MAX_REQUEST_SIZE || '50mb'
  },
  api: {
    claudeKey: process.env.CLAUDE_API_KEY,
    etherscanKey: process.env.ETHERSCAN_API_KEY
  },
  rateLimiting: {
    dailyLimit: parseInt(process.env.DAILY_REQUEST_LIMIT) || 100
  },
  paths: {
    screenshots: path.join(process.cwd(), 'screenshots')
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info'
  }
};

// Validate required configuration
const requiredKeys = ['api.claudeKey', 'api.etherscanKey'];
requiredKeys.forEach(key => {
  const value = key.split('.').reduce((obj, k) => obj?.[k], config);
  if (!value) {
    throw new Error(`Missing required configuration: ${key}`);
  }
});

export default config; 