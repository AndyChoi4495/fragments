const request = require('supertest');
const app = require('../../src/app');
const { Fragment } = require('../../src/model/fragment');

jest.mock('../../src/model/fragment.js');

describe('GET /v1/fragments?expand=1', () => {
  let server;

  beforeAll((done) => {
    server = app.listen(done);
  });

  afterAll((done) => {
    server.close(done);
  });

  beforeEach(() => {
    Fragment.byUser = jest.fn();
  });

  it('should return fragments without expansion', async () => {
    const fragments = [{ id: '1' }, { id: '2' }];
    Fragment.byUser.mockResolvedValue(fragments);

    const res = await request(server)
      .get('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'application/json');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      status: 'ok',
      fragments: fragments.map((fragment) => ({ id: fragment.id })),
    });
  });

  it('should return fragments with expansion', async () => {
    const fragments = [
      {
        id: '1',
        ownerId: 'user1@email.com',
        created: new Date(),
        updated: new Date(),
        size: 100,
        type: 'text/plain',
      },
    ];
    Fragment.byUser.mockResolvedValue(fragments);

    const res = await request(server)
      .get('/v1/fragments?expand=1')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'application/json');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      status: 'ok',
      fragments: fragments.map((fragment) => ({
        id: fragment.id,
        ownerId: fragment.ownerId,
        created: fragment.created.toISOString(),
        updated: fragment.updated.toISOString(),
        size: fragment.size,
        type: fragment.type,
      })),
    });
  });

  it('should handle errors when fetching fragments', async () => {
    Fragment.byUser.mockRejectedValue(new Error('Test error'));

    const res = await request(server)
      .get('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'application/json');

    expect(res.status).toBe(500);
    expect(res.body).toEqual({
      message: 'Internal Server Error',
      status: 'error',
    });
  });
});
