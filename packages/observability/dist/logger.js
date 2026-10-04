import { pino } from 'pino';
export function createLogger(options = {}) {
    const pinoOptions = {
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
//# sourceMappingURL=logger.js.map