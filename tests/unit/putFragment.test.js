const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const putFragment = require('../../src/routes/api/putFragment');
const { Fragment } = require('../../src/model/fragment.js');

// Mock dependencies
jest.mock('../../src/model/fragment.js');
jest.mock('../../src/logger.js');

// Setup an express app
const app = express();
app.use(bodyParser.raw({ type: '*/*' }));
app.put('/fragments/:id', putFragment);

describe('PUT /fragments/:id', () => {
  it('should return a 404 if the fragment does not exist', async () => {
    Fragment.byId.mockResolvedValue(null);

    const res = await request(app)
      .put('/fragments/nonexistentid')
      .set('Content-Type', 'text/plain')
      .send('New content');

    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe('Fragment not found');
  });

  it('should return a 400 if the Content-Type does not match', async () => {
    const fragmentData = {
      id: 'testid',
      ownerId: 'ownerId',
      type: 'text/plain',
      data: 'Original content',
    };
    Fragment.byId.mockResolvedValue(fragmentData);

    const res = await request(app)
      .put('/fragments/testid')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({ new: 'content' }));

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe(
      'Content-Type mismatch: Expected text/plain, received application/json'
    );
  });

  it('should update the fragment data and return 200 with metadata', async () => {
    const fragmentData = {
      id: 'testid',
      ownerId: 'ownerId',
      type: 'text/plain',
      data: 'Original content',
      created: '2021-11-02T15:09:50.403Z',
      updated: '2021-11-02T15:09:50.403Z',
      save: jest.fn(),
    };
    Fragment.byId.mockResolvedValue(fragmentData);

    const res = await request(app)
      .put('/fragments/testid')
      .set('Content-Type', 'text/plain')
      .send('Updated content');

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.fragment.id).toBe(fragmentData.id);
    expect(res.body.fragment.type).toBe('text/plain');
    expect(res.body.fragment.size).toBe(Buffer.byteLength('Updated content'));
  });
});
