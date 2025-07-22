import express from 'express';
import { processCharge, getTransactions } from '../controllers/chargeController.js';
import logger from '../utils/logger.js';

const router = express.Router();

router.post('/charge', (req, res, next) => {
    logger.info('routes#index - POST /charge invoked');
    processCharge(req, res, next);
});

router.get('/transactions', (req, res, next) => {
    logger.info('routes#index - GET /transactions invoked');
    getTransactions(req, res, next);
});

export default router;