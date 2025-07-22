import app from './app.js';
import envConfig from './config/envConfig.js';
import logger from './utils/logger.js';

app.listen(envConfig.APP_PORT, () => {
    logger.info(`Server running on port ${envConfig.APP_PORT} in ${envConfig.NODE_ENV} mode`);
});