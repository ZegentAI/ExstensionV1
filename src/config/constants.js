export const API_ENDPOINTS = {
  CLAUDE: 'https://api.anthropic.com/v1/messages',
  ETHERSCAN: 'https://api.etherscan.io/api'
};

export const RATE_LIMIT = {
  WINDOW_MS: 24 * 60 * 60 * 1000, // 24 hours
  MAX_REQUESTS: 100
};

export const HTTP_STATUS = {
  OK: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  TOO_MANY_REQUESTS: 429,
  SERVER_ERROR: 500
};

export const ERROR_MESSAGES = {
  INVALID_TOKEN_ADDRESS: 'Invalid token address provided',
  RATE_LIMIT_EXCEEDED: 'Daily request limit exceeded',
  SERVER_ERROR: 'An internal server error occurred',
  MISSING_SCREENSHOT: 'Screenshot data is required',
  CONTRACT_NOT_FOUND: 'Contract source not found'
};

export const AI_MODELS = {
  CLAUDE: 'claude-3-sonnet-20240229'
};

export const FILE_PATHS = {
  SCREENSHOTS: 'screenshots',
  LOGS: 'logs'
}; 