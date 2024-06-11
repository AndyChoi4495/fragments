const contentType = require('content-type');
const { Fragment } = require('../../src/model/fragment.js');
const logger = require('../../src/logger.js');
const postHandler = require('../../src/routes/api/post.js');

jest.mock('content-type');
jest.mock('../../src/model/fragment.js');
jest.mock('../../src/logger.js');

describe('postHandler', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: Buffer.from('test data'),
      headers: { 'content-type': 'text/plain' },
      user: 'testUser',
      protocol: 'http',
      get: jest.fn().mockReturnValue('localhost:3000'),
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      location: jest.fn().mockReturnThis(),
    };

    contentType.parse.mockReturnValue({ type: 'text/plain' });
    Fragment.isSupportedType.mockReturnValue(true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should return 400 if request body is not a buffer', async () => {
    req.body = 'not a buffer';

    await postHandler(req, res);

    expect(logger.warn).toHaveBeenCalledWith('Request body is not a buffer');
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid request body' });
  });

  test('should return 415 if content type is not supported', async () => {
    Fragment.isSupportedType.mockReturnValue(false);

    await postHandler(req, res);

    expect(logger.warn).toHaveBeenCalledWith('Unsupported media type: text/plain');
    expect(res.status).toHaveBeenCalledWith(415);
    expect(res.json).toHaveBeenCalledWith({ error: 'Unsupported media type: text/plain' });
  });

  test('should return 201 and create a new fragment', async () => {
    const fragmentMock = {
      id: 'fragmentId',
      ownerId: 'testUser',
      created: '2024-06-10T00:00:00Z',
      updated: '2024-06-10T00:00:00Z',
      type: 'text/plain',
      size: 9,
      setData: jest.fn(),
    };
    Fragment.mockImplementation(() => fragmentMock);

    await postHandler(req, res);

    expect(logger.info).toHaveBeenCalledWith('Created new fragment object', {
      fragment: fragmentMock,
    });
    expect(fragmentMock.setData).toHaveBeenCalledWith(req.body);
    expect(logger.info).toHaveBeenCalledWith('Fragment data set successfully');
    expect(logger.info).toHaveBeenCalledWith('Fragment created successfully', {
      fragment: fragmentMock,
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.location).toHaveBeenCalledWith('http://localhost:3000/v1/fragments/fragmentId');
    expect(res.json).toHaveBeenCalledWith({
      status: 'ok',
      fragment: {
        id: 'fragmentId',
        ownerId: 'testUser',
        created: '2024-06-10T00:00:00Z',
        updated: '2024-06-10T00:00:00Z',
        type: 'text/plain',
        size: 9,
      },
    });
  });

  test('should return 500 on internal server error', async () => {
    const error = new Error('Internal Server Error');
    Fragment.mockImplementation(() => {
      throw error;
    });

    await postHandler(req, res);

    expect(logger.error).toHaveBeenCalledWith('Error creating fragment', error);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Internal Server Error' });
  });
});
