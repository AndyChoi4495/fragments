const request = require('supertest');
const express = require('express');
const { Fragment } = require('../../src/model/fragment.js');
const logger = require('../../src/logger');

// Import the delete handler
const deleteFragment = require('../../src/routes/api/delete.js');
jest.mock('../../src/model/fragment.js');
jest.mock('../../src/logger.js');

// Setup Express app
const app = express();
app.delete('/fragments/:id', deleteFragment);

describe('DELETE /fragments/:id', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 200 and status ok if fragment is successfully deleted', async () => {
    // Mock successful deletion (Fragment.delete resolves with undefined)
    Fragment.delete.mockResolvedValue(undefined);

    const res = await request(app).delete('/fragments/123').auth('user1@email.com', 'password1');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
    expect(Fragment.delete).toHaveBeenCalledWith(undefined, '123');
  });

  it('should return 404 if fragment is not found', async () => {
    // Mock Fragment.delete to indicate the fragment was not found
    Fragment.delete.mockResolvedValue('not found');

    const res = await request(app).delete('/fragments/123').auth('user1@email.com', 'password1');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Fragment not found' });
    expect(logger.warn).toHaveBeenCalledWith('Fragment not found: 123');
    expect(Fragment.delete).toHaveBeenCalledWith(undefined, '123');
  });

  it('should return 500 if there is an internal server error', async () => {
    // Mock Fragment.delete to throw an error
    const errorMessage = 'Database error';
    Fragment.delete.mockRejectedValue(new Error(errorMessage));

    const res = await request(app).delete('/fragments/123').auth('user1@email.com', 'password1');

    expect(res.status).toBe(500); // Correct the expected status code
    expect(res.body).toEqual({ error: 'Internal Server Error' });
    expect(logger.error).toHaveBeenCalledWith('Error deleting fragment', { error: errorMessage });
    expect(Fragment.delete).toHaveBeenCalledWith(undefined, '123');
  });
});
