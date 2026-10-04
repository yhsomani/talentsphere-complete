import { Logger } from 'pino';
export interface CreateLoggerOptions {
    name?: string;
    level?: string;
    redact?: string[];
}
export declare function createLogger(options?: CreateLoggerOptions): Logger;
export declare const logger: Logger;
//# sourceMappingURL=logger.d.ts.map