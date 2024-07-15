const request = require('supertest');
const app = require('../../src/app');
const { Fragment } = require('../../src/model/fragment');

jest.mock('../../src/model/fragment.js');

describe('GET /v1/fragments/:id', () => {
  let server;
  let fragment;

  beforeAll((done) => {
    server = app.listen(done);
  });

  afterAll((done) => {
    server.close(done);
  });

  beforeEach(() => {
    fragment = {
      id: '4dcc65b6-9d57-453a-bd3a-63c107a51698',
      ownerId: 'user1@email.com',
      type: 'text/markdown',
      data: 'This is a fragment',
    };
    Fragment.byId = jest.fn().mockResolvedValue(fragment);
  });

  it('should return fragment data with original content type', async () => {
    const res = await request(server)
      .get('/v1/fragments/4dcc65b6-9d57-453a-bd3a-63c107a51698')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain');
    expect(res.status).toBe(200);
    expect(res.header['content-type']).toBe('text/markdown; charset=utf-8');
  });

  it('should return 404 if fragment not found', async () => {
    Fragment.byId.mockResolvedValue(null);
    const res = await request(server)
      .get('/v1/fragments/unknown-id')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Fragment not found');
  });

  it('should return 415 if unsupported extension is provided', async () => {
    const res = await request(server)
      .get('/v1/fragments/4dcc65b6-9d57-453a-bd3a-63c107a51698.unsupported')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain');
    expect(res.status).toBe(415);
    expect(res.body.error).toBe('Unsupported media type conversion: unsupported');
  });

  it('should return converted fragment data if valid extension is provided', async () => {
    const res = await request(server)
      .get('/v1/fragments/4dcc65b6-9d57-453a-bd3a-63c107a51698.html')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain');
    expect(res.status).toBe(200);
    expect(res.header['content-type']).toBe('text/html; charset=utf-8');
    expect(res.text).toBe('<p>This is a fragment</p>\n');
  });
});
