import { validateChargePayload } from "../validators/payloadValidator.js";
import { calculateRiskScore } from "../services/fraudService.js";
import { generateRiskExplanation } from "../services/llmService.js";
import { selectPaymentProvider } from "../services/paymentRouter.js";
import logger from "../utils/logger.js";
import { transactions } from '../logs/memoryLogs.js';
import { v4 as uuidv4 } from 'uuid';

const processCharge = async (req, res, next) => {
    try {
        const data = await validateChargePayload(req.body);
        const { amount, currency, source, email } = data;
        const provider = selectPaymentProvider();
        const riskScore = calculateRiskScore({ amount, email });
        const explanation = await generateRiskExplanation({ riskScore, amount, email, provider });

        if (riskScore >= 0.5) {
            logger.info(`chargeController#processCharge - Transaction blocked for ${email} with riskScore: ${riskScore}`);
            return res.status(403).json({
                status: 'blocked',
                provider,
                riskScore,
                explanation
            });
        }

        const transactionId = `txn_${uuidv4()}`;
        try {
        const transaction = {
            transactionId,
            provider,
            status: 'success',
            riskScore,
            explanation,
            metadata: { amount, currency, source, email },
            timestamp: new Date().toISOString()
        };

        transactions.push(transaction);
        logger.info(`chargeController#processCharge - Transaction processed: ${transactionId}`);

        return res.status(200).json({
            transactionId,
            provider,
            status: 'success',
            riskScore,
            explanation
        });
        } catch (err) {
            return next(err);
        }
        
    } catch (err) {
        logger.error(`chargeController#processCharge - Error: ${err.message}`);
        return next(err);
    }
};

const getTransactions = (req, res, next) => {
    try {
        logger.info('chargeController#getTransactions - Returning all transactions');
        return res.json(transactions);
    } catch (err) {
        logger.error(`chargeController#getTransactions - Error: ${err.message}`);
        return next(err);
    }
};

export { processCharge, getTransactions };