import pino from 'pino';
import envConfig from '../config/envConfig.js';

const logger = pino({
    timestamp: pino.stdTimeFunctions.isoTime,
    ...(envConfig.NODE_ENV === 'development' && {
        transport: {
            target: 'pino-pretty',
            options: { colorize: true }
        }
    })
});

export default logger;
