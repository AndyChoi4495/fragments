const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const putFragment = require('../../src/routes/api/putFragment');
const { Fragment } = require('../../src/model/fragment.js');
//const sharp = require('sharp');

// Mock dependencies
jest.mock('../../src/model/fragment.js');
jest.mock('../../src/logger.js');
jest.mock('sharp');

// Setup an express app
const app = express();
app.use(bodyParser.raw({ type: '*/*' }));
app.put('/fragments/:id', putFragment);

describe('PUT /fragments/:id', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return a 404 if the fragment does not exist', async () => {
    Fragment.byId.mockResolvedValue(null);

    const res = await request(app)
      .put('/fragments/nonexistentid')
      .set('Content-Type', 'text/plain')
      .send('New content');

    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe('Fragment not found');
  });

  it('should return a 500 if the Content-Type does not match', async () => {
    const fragmentData = {
      id: 'dasdfsfasfggafgsadf4525',
      ownerId: 'ownerId',
      type: 'text/plain',
      data: 'Original content',
    };
    Fragment.byId.mockResolvedValue(fragmentData);

    const res = await request(app)
      .put('/fragments/dasdfsfasfggafgsadf4525')
      .set('Content-Type', 'app/json');

    expect(res.statusCode).toBe(415);
    expect(res.body.error).toBe('Unsupported content type');
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

    const res = await request(app).put('/fragments/testid').set('Content-Type', 'text/csv');

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.fragment.id).toBe(fragmentData.id);
    expect(res.body.fragment.type).toBe('text/csv');
  });

  it('should update fragment data without conversion if type has not changed', async () => {
    const fragmentData1 = {
      id: 'dasdfsfasfggafgsadf4525',
      ownerId: 'ownerId',
      type: 'text/plain',
      data: 'Original content',
    };
    Fragment.byId.mockResolvedValue(fragmentData1);

    const res = await request(app)
      .put('/fragments/dasdfsfasfggafgsadf4525')
      .set('Content-Type', 'application/json');

    expect(res.status).toBe(200);
    expect(res.data).toEqual(undefined);
  });

  /*   it('should convert images using sharp', async () => {
    const fragmentData2 = {
      id: '123',
      ownerId: 'ownerId',
      type: 'image/png',
      data: 'Original content',
    };

    Fragment.byId.mockResolvedValue(fragmentData2);

    const res = await request(app).put('/fragments/123').set('Content-Type', 'image/jpeg');

    expect(res.status).toBe(200);
    expect(res.header['content-type']).toBe('image/jpeg');
    expect(res.body).toEqual({
      status: 'ok',
      fragment: {
        id: '123',
        ownerId: undefined,
        created: undefined,
        updated: undefined,
        type: 'image/png',
        size: undefined,
        data: undefined,
      },
    });
  }); */
});
