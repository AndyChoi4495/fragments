// auth.test.js
const mockCognito = jest.fn();
const mockBasicAuth = jest.fn();

jest.mock('../../src/auth/cognito', () => mockCognito);
jest.mock('../../src/auth/basic-auth', () => mockBasicAuth);

describe('Auth Module Export', () => {
  afterEach(() => {
    jest.resetModules();
    delete process.env.AWS_COGNITO_POOL_ID;
    delete process.env.AWS_COGNITO_CLIENT_ID;
    delete process.env.HTPASSWD_FILE;
    delete process.env.NODE_ENV;
  });

  test('should prefer Amazon Cognito if AWS_COGNITO_POOL_ID and AWS_COGNITO_CLIENT_ID are set', () => {
    process.env.AWS_COGNITO_POOL_ID = 'test-pool-id';
    process.env.AWS_COGNITO_CLIENT_ID = 'test-client-id';

    const authModule = require('../../src/auth');
    expect(authModule).toBe(mockCognito);
  });

  test('should use basic auth if HTPASSWD_FILE is set and NODE_ENV is not production', () => {
    process.env.HTPASSWD_FILE = '/path/to/.htpasswd';
    process.env.NODE_ENV = 'development';

    const authModule = require('../../src/auth');
    expect(authModule).toBe(mockBasicAuth);
  });

  test('should throw an error if no valid configuration is found', () => {
    expect(() => require('../../src/auth')).toThrow(
      'missing env vars: no authorization configuration found'
    );
  });

  test('should throw an error if AWS_COGNITO_POOL_ID is set but AWS_COGNITO_CLIENT_ID is not set', () => {
    process.env.AWS_COGNITO_POOL_ID = 'test-pool-id';

    expect(() => require('../../src/auth')).toThrow(
      'missing env vars: no authorization configuration found'
    );
  });

  test('should throw an error if AWS_COGNITO_CLIENT_ID is set but AWS_COGNITO_POOL_ID is not set', () => {
    process.env.AWS_COGNITO_CLIENT_ID = 'test-client-id';

    expect(() => require('../../src/auth')).toThrow(
      'missing env vars: no authorization configuration found'
    );
  });
});
