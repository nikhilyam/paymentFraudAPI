import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import router from './routes/index.js';
import logger from './utils/logger.js';

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/', router);

// Error handling middleware
app.use((err, req, res, next) => {
    logger.error(`app.js#ErrorHandler - ${err.message}`);
    return res.status(400).json({ error: err.message });
});

export default app;