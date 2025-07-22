import axios from "axios";
import envConfig from "../config/envConfig.js";
import logger from "../utils/logger.js";
const explanationCache = new Map();

const generateRiskExplanation = async ({ riskScore, amount, email, provider }) => {
    logger.info('llmService#generateRiskExplanation - Invoked');
    const key = `${riskScore}-${amount}-${email}`;

    if (explanationCache.has(key)) {
        logger.info('llmService#generateRiskExplanation - Cache hit for explanation');
        return explanationCache.get(key);
    }

    let explanationParts = [];
    if (amount >= 1000) explanationParts.push("a large amount");
    if (email.endsWith('.ru') || email.endsWith('test.com')) {
        explanationParts.push("a suspicious email domain");
    }
    if (explanationParts.length === 0) explanationParts.push("no significant risk factors");

    const llmGeneratedExplanation = await generateLLMExplanation({ riskScore, explanationParts, provider });

    explanationCache.set(key, llmGeneratedExplanation);

    logger.info('llmService#generateRiskExplanation - Explanation generated');
    return llmGeneratedExplanation;
};

const generateLLMExplanation = async ({ riskScore, explanationParts, provider }) => {
    logger.info('llmService#generateLLMExplanation - Invoked');
    if (!explanationParts || explanationParts.length === 0) {
        return 'This transaction is considered safe with no significant risk factors.';
    }

    try {
        const endPoint = `${envConfig.OPENAI_API_URL}/chat/completions`;
        const prompt = `Summarize the following fraud analysis factors: This payment was routed to ${provider} due to a moderately high low score ${riskScore} based on ${explanationParts.join(' and ')}.`;
        const response = await axios.post(`${endPoint}`, {
            model: "gpt-4o-mini",
            store: true,
            messages: [
                {"role": "user", "content": prompt},
            ],
            max_tokens: 60
        }, {
            headers: {
                'Authorization': `Bearer ${envConfig.OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        if (response.data && response.data.choices && response.data.choices.length > 0) {
            logger.warn('llmService.js#generateLLMExplanation - LLM response structure');
            return response.data.choices[0]?.message?.content?.trim() || "No explanation generated.";
        } else {
            return 'No significant risks detected.';
        }
    } catch (err) {
        if (err.response && err.response.status === 429) {
            const { data } = err.response;
            logger.error(`llmService#generateLLMExplanation - OpenAI API - Error: ${data.error.message}`);
            logger.error('llmService#generateLLMExplanation - OpenAI API rate limit exceeded (429)');
        } else {
            logger.error(`llmService#generateLLMExplanation - Error calling OpenAI API: ${err.message}`);
        }

        const fallback = `This payment was routed to ${provider} due to a moderately high low score ${riskScore} based on ${explanationParts.join(' and ')}.`;
        return fallback;
    }
}

export { generateRiskExplanation };