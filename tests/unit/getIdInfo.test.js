const request = require('supertest');
const express = require('express');
const router = require('../routes/fragments');
const { Fragment } = require('../../model/fragment');
const app = express();

app.use(express.json());
app.use(router);

jest.mock('../../model/fragment');

describe('GET /v1/fragments/:id/info', () => {
  let fragment;

  beforeEach(() => {
    fragment = {
      id: '4dcc65b6-9d57-453a-bd3a-63c107a51698',
      ownerId: 'user1',
      created: '2021-11-08T01:08:20.269Z',
      updated: '2021-11-08T01:17:21.830Z',
      type: 'text/plain',
      size: 20,
    };
    Fragment.findOne = jest.fn().mockResolvedValue(fragment);
  });

  it('should return fragment metadata', async () => {
    const res = await request(app)
      .get('/v1/fragments/4dcc65b6-9d57-453a-bd3a-63c107a51698/info')
      .set('Authorization', 'Bearer valid-token');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      status: 'ok',
      fragment: {
        id: '4dcc65b6-9d57-453a-bd3a-63c107a51698',
        ownerId: 'user1',
        created: '2021-11-08T01:08:20.269Z',
        updated: '2021-11-08T01:17:21.830Z',
        type: 'text/plain',
        size: 20,
      },
    });
  });

  it('should return 404 if fragment not found', async () => {
    Fragment.findOne.mockResolvedValue(null);
    const res = await request(app)
      .get('/v1/fragments/unknown-id/info')
      .set('Authorization', 'Bearer valid-token');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Fragment not found');
  });

  it('should return 500 if there is a server error', async () => {
    Fragment.findOne.mockRejectedValue(new Error('Database error'));
    const res = await request(app)
      .get('/v1/fragments/4dcc65b6-9d57-453a-bd3a-63c107a51698/info')
      .set('Authorization', 'Bearer valid-token');
    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Internal Server Error');
  });
});
