const request = require('supertest');
const express = require('express');
const router = require('../routes/fragments');
const { Fragment } = require('../../model/fragment');
const app = express();

app.use(express.json());
app.use(router);

jest.mock('../../model/fragment');

describe('GET /v1/fragments/:id', () => {
  let fragment;

  beforeEach(() => {
    fragment = {
      id: '4dcc65b6-9d57-453a-bd3a-63c107a51698',
      ownerId: 'user1',
      type: 'text/markdown',
      data: '# This is a fragment',
    };
    Fragment.findById = jest.fn().mockResolvedValue(fragment);
  });

  it('should return fragment data with original content type', async () => {
    const res = await request(app)
      .get('/v1/fragments/4dcc65b6-9d57-453a-bd3a-63c107a51698')
      .set('Authorization', 'Bearer valid-token');
    expect(res.status).toBe(200);
    expect(res.header['content-type']).toBe('text/markdown; charset=utf-8');
    expect(res.text).toBe('# This is a fragment');
  });

  it('should return 404 if fragment not found', async () => {
    Fragment.findById.mockResolvedValue(null);
    const res = await request(app)
      .get('/v1/fragments/unknown-id')
      .set('Authorization', 'Bearer valid-token');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Fragment not found');
  });

  it('should return 415 if unsupported extension is provided', async () => {
    const res = await request(app)
      .get('/v1/fragments/4dcc65b6-9d57-453a-bd3a-63c107a51698.unsupported')
      .set('Authorization', 'Bearer valid-token');
    expect(res.status).toBe(415);
    expect(res.body.error).toBe('Unsupported media type conversion: unsupported');
  });

  it('should return converted fragment data if valid extension is provided', async () => {
    const res = await request(app)
      .get('/v1/fragments/4dcc65b6-9d57-453a-bd3a-63c107a51698.html')
      .set('Authorization', 'Bearer valid-token');
    expect(res.status).toBe(200);
    expect(res.header['content-type']).toBe('text/html; charset=utf-8');
    expect(res.text).toBe('<h1># This is a fragment</h1>'); // Example conversion result
  });
});
