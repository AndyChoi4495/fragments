const request = require('supertest');
const express = require('express');
const { Fragment } = require('../../src/model/fragment');
const logger = require('../../src/logger');

const getExpand = require('../../src/routes/api/getExpand');
jest.mock('../../src/model/fragment.js');
jest.mock('../../src/logger');

const app = express();
app.get('/fragments', getExpand);

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

  it('should return only fragment IDs when expand=0 or not provided', async () => {
    const fragments = [{ id: '123' }, { id: '124' }];

    Fragment.byUser.mockResolvedValue(fragments);

    const res = await request(app).get('/fragments').auth('user1', 'password1');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      status: 'ok',
      fragments: [{ id: '123' }, { id: '124' }],
    });
    expect(Fragment.byUser).toHaveBeenCalledWith({ ownerId: undefined, expand: false });
    expect(logger.info).toHaveBeenCalledWith('Fetched fragments successfully', {
      ownerId: undefined,
      expand: false,
    });
  });

  it('should return 500 and log error if there is an error fetching fragments', async () => {
    const errorMessage = 'Database error';
    Fragment.byUser.mockRejectedValue(new Error(errorMessage));

    const res = await request(app).get('/fragments').auth('user1', 'password1');

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Internal Server Error' });
    expect(logger.error).toHaveBeenCalledWith('Error fetching fragments', expect.any(Error));
  });

  it('should return fragments with detailed info when expand=1', async () => {
    const fragments = [
      {
        id: '123',
        ownerId: 'user1',
        created: new Date('2023-01-01T00:00:00.000Z'),
        updated: new Date('2023-01-02T00:00:00.000Z'),
        size: 1024,
        type: 'text/plain',
      },
    ];

    Fragment.byUser.mockResolvedValue(fragments);

    const res = await request(app).get('/fragments?expand=1').auth('user1', 'password1');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      status: 'ok',
      fragments: [
        {
          id: '123',
          ownerId: 'user1',
          created: '2023-01-01T00:00:00.000Z',
          updated: '2023-01-02T00:00:00.000Z',
          size: 1024,
          type: 'text/plain',
        },
      ],
    });
    expect(Fragment.byUser).toHaveBeenCalledWith({ ownerId: undefined, expand: true });
    expect(logger.info).toHaveBeenCalledWith('Fetched fragments successfully', {
      ownerId: undefined,
      expand: true,
    });
  });
});
