import Joi from 'joi';
import logger from '../utils/logger.js';

export const chargeSchema = Joi.object({
    amount: Joi.number().positive().required(),
    currency: Joi.string().length(3).uppercase().required(),
    source: Joi.string().required(),
    email: Joi.string().email().required()
});

export function validateChargePayload(payload) {
    logger.info('payloadValidator#validateChargePayload - Invoked');
    const { error, value } = chargeSchema.validate(payload);
    if (error) {
        logger.error(`chargeValidation#validateChargePayload - Validation failed: ${error.message}`);
        throw new Error(`Validation error: ${error.message}`);
    }
    return value;
}