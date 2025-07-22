import logger from "../utils/logger.js";

const selectPaymentProvider = () => {
    logger.info('paymentRouter#selectPaymentProvider - Invoked');
    const provider = Math.random() < 0.5 ? 'strip' : 'paypal';
    logger.info(`paymentRouter#selectPaymentProvider - Selected provider: ${provider}`);
    return provider;
};

export { selectPaymentProvider };