import { pino, Logger, LoggerOptions } from 'pino';

export interface CreateLoggerOptions {
  name?: string;
  level?: string;
  redact?: string[];
}

export function createLogger(options: CreateLoggerOptions = {}): Logger {
  const pinoOptions: LoggerOptions = {
    name: options.name || 'talentsphere',
    level: options.level || process.env.LOG_LEVEL || 'info',
    timestamp: pino.stdTimeFunctions.isoTime,
    redact: options.redact || [
      'req.headers.authorization',
      'headers.authorization',
      'password',
      'token',
      'apiKey',
      'secret',
      'accessToken',
      'refreshToken',
    ],
  };

  return pino(pinoOptions);
}

export const logger = createLogger();
