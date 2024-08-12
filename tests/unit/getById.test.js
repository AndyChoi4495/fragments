const request = require('supertest');
const express = require('express');
const { Fragment } = require('../../src/model/fragment.js');
const getById = require('../../src/routes/api/getById');
const logger = require('../../src/logger');

jest.mock('../../src/model/fragment.js');
jest.mock('../../src/logger.js');

const app = express();
app.get('/api/fragments/:id', getById);

describe('GET /api/fragments/:id', () => {
  let user;

  beforeEach(() => {
    user = { id: 'user1' };
    jest.clearAllMocks();
  });

  test('should return a fragment with the correct content type', async () => {
    const fragment = { type: 'text/plain', data: 'Hello, world!' };
    Fragment.byId.mockResolvedValue(fragment);

    const response = await request(app).get('/api/fragments/123').set('user', user);

    expect(response.status).toBe(200);
    expect(response.header['content-type']).toBe('text/plain; charset=utf-8');
    expect(response.text).toBe('{"type":"text/plain","data":"Hello, world!"}');
  });

  test('should return 404 if fragment is not found', async () => {
    Fragment.byId.mockResolvedValue(null);

    const response = await request(app).get('/api/fragments/123').set('user', user);

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Fragment not found');
    expect(logger.warn).toHaveBeenCalledWith('Fragment not found: 123');
  });

  test('should return 415 if unsupported media type conversion is requested', async () => {
    const fragment = { type: 'text/plain', data: 'Hello, world!' };
    Fragment.byId.mockResolvedValue(fragment);

    const response = await request(app).get('/api/fragments/123.xyz').set('user', user);

    expect(response.status).toBe(415);
    expect(response.body.error).toBe('Unsupported media type conversion: xyz');
    expect(logger.warn).toHaveBeenCalledWith('Unsupported media type conversion: xyz');
  });

  test('should convert a fragment to the requested format', async () => {
    const fragment = { type: 'application/json', data: JSON.stringify({ hello: 'world' }) };
    Fragment.byId.mockResolvedValue(fragment);

    const response = await request(app).get('/api/fragments/123.csv').set('user', user);

    expect(response.status).toBe(200);
    expect(response.header['content-type']).toBe('text/csv; charset=utf-8');
    expect(response.text).toContain('hello');
    expect(response.text).toContain('world');
  });

  test('should return 500 on internal server error', async () => {
    Fragment.byId.mockRejectedValue(new Error('Something went wrong'));

    const response = await request(app).get('/api/fragments/123').set('user', user);

    expect(response.status).toBe(500);
    expect(response.body.error).toBe('Internal Server Error');
    expect(logger.error).toHaveBeenCalledWith('Error retrieving fragment', {
      error: 'Something went wrong',
    });
  });
});
