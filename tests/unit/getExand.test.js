const request = require('supertest');
const app = require('../../src/app');
const { Fragment } = require('../../src/model/fragment');

jest.mock('../../src/model/fragment');

describe('GET /v1/fragments?expand=1', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should fetch all fragments and return minimal information when expand is not set', async () => {
    const fragments = [{ id: '1' }, { id: '2' }];

    Fragment.byUser = jest.fn().mockReturnValue(fragments);

    const res = await request(app)
      .get('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .expect(200);
    expect(res.body).toEqual({
      status: 'ok',
      fragments: fragments.map((fragment) => ({ id: fragment.id })),
    });
  });

  test('should fetch all fragments and return detailed information when expand is set to 1', async () => {
    const fragments = [
      {
        id: '1',
        ownerId: 'testUserId',
        created: new Date(),
        updated: new Date(),
        size: 100,
        type: 'text/markdown',
      },
      {
        id: '2',
        ownerId: 'testUserId',
        created: new Date(),
        updated: new Date(),
        size: 200,
        type: 'text/html',
      },
    ];

    Fragment.byUser = jest.fn().mockReturnValue(fragments);

    const res = await request(app)
      .get('/v1/fragments?expand=1')
      .auth('user1@email.com', 'password1')
      .expect(200);
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

  test('should handle errors and return 500 status code', async () => {
    const error = new Error('Test error');
    Fragment.byUser.mockRejectedValue(error);

    const res = await request(app)
      .get('/v1/fragments?expand=1')
      .auth('user1@email.com', 'password1')
      .expect(500);

    expect(res.body).toEqual({ message: 'Internal Server Error', status: 'error' });
  });
});
