const request = require('supertest');
const express = require('express');
const { Fragment } = require('../../src/model/fragment');
const router = require('../../src/routes/index');
const { hashEmail } = require('../../src/hash');
const logger = require('../../src/logger');

const app = express();
app.use(express.raw({ type: '*/*', limit: '5mb' })); // Ensure raw body parser is used
app.use('/v1/fragments', router);

describe('POST /v1/fragments', () => {
  it('should create a fragment for authenticated user', async () => {
    const response = await request(app)
      .post('/v1/fragments')
      .set('Authorization', 'Basic test')
      .set('Content-Type', 'text/plain')
      .send('This is a test fragment');

    expect(response.status).toBe(201);
    expect(response.headers['content-type']).toContain('application/json');
    // expect(response.headers.location).toMatch(/\/v1\/fragments\/[a-f0-9-]+$/);

    expect(response.body).toEqual(
      expect.objectContaining({
        status: 'ok',
        fragment: expect.objectContaining({
          id: expect.any(String),
          ownerId: hashEmail('test@example.com'),
          type: 'text/plain',
          size: 21,
          created: expect.any(String),
          updated: expect.any(String),
        }),
      })
    );
  });

  it('should return 415 for unsupported content type', async () => {
    const response = await request(app)
      .post('/v1/fragments')
      .set('Authorization', 'Basic test')
      .set('Content-Type', 'application/msword')
      .send('This is a test fragment');

    expect(response.status).toBe(415);
    expect(response.body).toEqual({
      error: 'Unsupported media type: application/msword',
    });
  });

  it('should return 400 if request body is not a buffer', async () => {
    const response = await request(app)
      .post('/v1/fragments')
      .set('Authorization', 'Basic test')
      .set('Content-Type', 'text/plain')
      .send({ key: 'value' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: 'Invalid request body',
    });
  });

  /* it('should return 401 for unauthenticated requests', async () => {
    const response = await request(app)
      .post('/v1/fragments')
      .set('Content-Type', 'text/plain')
      .send('This is a test fragment');

    expect(response.status).toBe(401);
  }); */
});
