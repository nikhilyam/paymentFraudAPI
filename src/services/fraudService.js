import fraudRules from '../config/fraudRules.js';
import logger from '../utils/logger.js';

const calculateRiskScore = ({ amount, email }) => {
    logger.info('fraudService#calculateRiskScore - Invoked');
    let score = 0.0;

    if (amount >= fraudRules.largeAmountThreshold) {
        logger.info('fraudService#calculateRiskScore - Large amount detected');
        score += 0.3;
    }

    fraudRules.suspiciousDomains.forEach(domain => {
        if (email.endsWith(domain)) {
            logger.info(`fraudService#calculateRiskScore - Suspicious domain detected: ${domain}`);
            score += 0.3;
        }
    });

    const finalScore = parseFloat(Math.min(score, 1.0).toFixed(2));
    logger.info(`fraudService#calculateRiskScore - Computed risk score: ${finalScore}`);
    return finalScore;
};

export { calculateRiskScore };

