const request = require('supertest');
const app = require('../../src/app');
const { Fragment } = require('../../src/model/fragment');

jest.mock('../../src/model/fragment.js');

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
    Fragment.byId = jest.fn().mockResolvedValue(fragment);
  });

  it('should return fragment metadata', async () => {
    const res = await request(app)
      .get('/v1/fragments/4dcc65b6-9d57-453a-bd3a-63c107a51698/info')
      .auth('user1@email.com', 'password1');
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
    Fragment.byId.mockResolvedValue(null);
    const res = await request(app)
      .get('/v1/fragments/unknown-id/info')
      .auth('user1@email.com', 'password1');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Fragment not found');
  });

  it('should return 500 if there is a server error', async () => {
    Fragment.byId.mockRejectedValue(new Error('Database error'));
    const res = await request(app)
      .get('/v1/fragments/4dcc65b6-9d57-453a-bd3a-63c107a51698/info')
      .auth('user1@email.com', 'password1');
    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Internal Server Error');
  });
});
