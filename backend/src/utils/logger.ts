import winston from 'winston';
import { config } from '../config/index.js';

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ level, message, timestamp, stack, ...meta }) => {
    let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta)}`;
    }
    if (stack) {
      log += `\n${stack}`;
    }
    return log;
  })
);

const jsonFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

export const logger = winston.createLogger({
  level: config.env === 'production' ? 'info' : 'debug',
  format: config.env === 'production' ? jsonFormat : logFormat,
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

export const createContextLogger = (context: string) => {
  return {
    info: (message: string, meta?: Record<string, unknown>) =>
      logger.info(`[${context}] ${message}`, meta),
    error: (message: string, error?: Error | unknown, meta?: Record<string, unknown>) =>
      logger.error(`[${context}] ${message}`, { error, ...meta }),
    warn: (message: string, meta?: Record<string, unknown>) =>
      logger.warn(`[${context}] ${message}`, meta),
    debug: (message: string, meta?: Record<string, unknown>) =>
      logger.debug(`[${context}] ${message}`, meta),
  };
};
