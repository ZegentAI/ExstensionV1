import { logger } from '../logger.js';
import { HTTP_STATUS, ERROR_MESSAGES } from '../config/constants.js';

export class AppError extends Error {
  constructor(message, statusCode, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    Error.captureStackTrace(this, this.constructor);
  }
}

export const handleError = (err, res) => {
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    statusCode: err.statusCode
  });

  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  }

  // Programming or unknown errors
  return res.status(HTTP_STATUS.SERVER_ERROR).json({
    status: 'error',
    message: ERROR_MESSAGES.SERVER_ERROR
  });
}; 