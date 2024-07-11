const request = require('supertest');
const express = require('express');
const router = require('../../src/routes/index');
const { Fragment } = require('../../src/model/fragment');
const app = express();

app.use(express.json());
app.use(router);

jest.mock('../../src/model/fragment.js');

describe('GET /v1/fragments/:id.ext', () => {
  let fragment;

  beforeEach(() => {
    fragment = {
      id: '4dcc65b6-9d57-453a-bd3a-63c107a51698',
      ownerId: 'user1',
      type: 'text/markdown',
      data: '# This is a fragment',
    };
    Fragment.findOne = jest.fn().mockResolvedValue(fragment);
  });

  it('should return converted fragment data if valid extension is provided', async () => {
    const res = await request(app)
      .get('/v1/fragments/4dcc65b6-9d57-453a-bd3a-63c107a51698.html')
      .set('Authorization', 'Bearer valid-token');
    expect(res.status).toBe(200);
    expect(res.header['content-type']).toBe('text/html; charset=utf-8');
    expect(res.text).toBe('<h1>This is a fragment</h1>\n');
  });

  it('should return 404 if fragment not found', async () => {
    Fragment.findOne.mockResolvedValue(null);
    const res = await request(app)
      .get('/v1/fragments/unknown-id.html')
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

  it('should return 500 if there is a server error', async () => {
    Fragment.findOne.mockRejectedValue(new Error('Database error'));
    const res = await request(app)
      .get('/v1/fragments/4dcc65b6-9d57-453a-bd3a-63c107a51698.html')
      .set('Authorization', 'Bearer valid-token');
    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Internal Server Error');
  });
});
