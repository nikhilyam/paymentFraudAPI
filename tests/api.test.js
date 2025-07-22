import request from 'supertest';
import app from '../src/app.js';

describe('Payment Fraud API', () => {

    test('POST /charge - should return risk score and status with success', async () => {
        const payload = {
            amount: 900,
            currency: "USD",
            source: "tok_test",
            email: "donor@test.com"
        };

        const response = await request(app)
            .post('/charge')
            .send(payload);

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('transactionId');
        expect(response.body).toHaveProperty('provider');
        expect(response.body).toHaveProperty('status', 'success');
        expect(response.body).toHaveProperty('riskScore');
        expect(response.body).toHaveProperty('explanation');
    }, 10000);

    test('POST /charge - should block high risk payment', async () => {
        const payload = {
            amount: 1000,
            currency: "USD",
            source: "tok_test",
            email: "donor@test.com"
        };

        const response = await request(app).post('/charge').send(payload);
        expect(response.statusCode).toBe(403);
        expect(response.body).toHaveProperty('status', 'blocked');
        expect(response.body).toHaveProperty('riskScore');
        expect(response.body).toHaveProperty('explanation');
    });

    test('GET /transactions - should return all transactions after charge', async () => {
        const response = await request(app).get('/transactions');

        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);

        const transaction = response.body[0];

        expect(transaction).toHaveProperty('transactionId');
        expect(transaction).toHaveProperty('provider');
        expect(transaction).toHaveProperty('status');
        expect(transaction).toHaveProperty('riskScore');
        expect(transaction).toHaveProperty('explanation');
        expect(transaction).toHaveProperty('metadata');
        expect(transaction).toHaveProperty('timestamp');
    }, 10000);
});
