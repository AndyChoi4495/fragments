// src/routes/api/getById.test.js

const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const getById = require('../../src/routes/api/getById');
const sharp = require('sharp');
const { Parser } = require('json2csv');
const yaml = require('js-yaml');
const { Fragment } = require('../../src/model/fragment.js');

// Mock dependencies
jest.mock('sharp');
jest.mock('json2csv');
jest.mock('js-yaml');
jest.mock('../../src/model/fragment.js');
jest.mock('../../src/logger.js');

// Setup an express app
const app = express();
app.use(bodyParser.json());
app.get('/api/fragment/:id', getById);

describe('GET /api/fragment/:id', () => {
  it('should return a 404 if fragment is not found', async () => {
    Fragment.byId.mockResolvedValue(null);

    const res = await request(app).get('/api/fragment/nonexistentid');

    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe('Fragment not found');
  });

  it('should convert markdown to HTML', async () => {
    const fragmentData = {
      type: 'text/markdown',
      data: '# This is a title\n\nThis is a paragraph.',
    };
    Fragment.byId.mockResolvedValue(fragmentData);

    const res = await request(app).get('/api/fragment/testid.html');

    expect(res.statusCode).toBe(200);
    expect(res.header['content-type']).toBe('text/html; charset=utf-8');
    expect(res.text).toContain('<h1>This is a title</h1>');
    expect(res.text).toContain('<p>This is a paragraph.</p>');
  });

  it('should convert JSON to CSV', async () => {
    const jsonToCsv = require('json2csv').Parser;
    jsonToCsv.mockImplementation(() => ({
      parse: jest.fn(() => 'name,age\nJohn Doe,30\nJane Doe,25'),
    }));

    const fragmentData = {
      type: 'application/json',
      data: JSON.stringify([
        { name: 'John Doe', age: 30 },
        { name: 'Jane Doe', age: 25 },
      ]),
    };
    Fragment.byId.mockResolvedValue(fragmentData);

    const res = await request(app).get('/api/fragment/testid.csv');

    expect(res.statusCode).toBe(200);
    expect(res.header['content-type']).toBe('text/csv; charset=utf-8');
    expect(res.text).toBe('name,age\nJohn Doe,30\nJane Doe,25');
  });

  it('should return a 415 for unsupported media type conversion', async () => {
    const fragmentData = {
      type: 'application/json',
      data: JSON.stringify({ name: 'John Doe', age: 30 }),
    };
    Fragment.byId.mockResolvedValue(fragmentData);

    const res = await request(app).get('/api/fragment/testid.unsupported');

    expect(res.statusCode).toBe(415);
    expect(res.body.error).toBe('Unsupported media type conversion: unsupported');
  });

  it('should handle image conversion using sharp', async () => {
    sharp.mockImplementation(() => ({
      toFormat: jest.fn().mockReturnThis(),
      toBuffer: jest.fn(() => Buffer.from('image data')),
    }));

    const fragmentData = {
      type: 'image/png',
      data: Buffer.from('original image data'),
    };
    Fragment.byId.mockResolvedValue(fragmentData);

    const res = await request(app).get('/api/fragment/testid.jpg');

    expect(res.statusCode).toBe(200);
    expect(res.header['content-type']).toBe('image/jpeg');
    expect(res.body).toEqual(Buffer.from('image data'));
  });

  it('should convert JSON to YAML', async () => {
    yaml.dump.mockReturnValue('name: John Doe\nage: 30\n');

    const fragmentData = {
      type: 'application/json',
      data: JSON.stringify({ name: 'John Doe', age: 30 }),
    };
    Fragment.byId.mockResolvedValue(fragmentData);

    const res = await request(app).get('/api/fragment/testid.yaml');

    expect(res.statusCode).toBe(200);
    expect(res.header['content-type']).toBe('application/yaml; charset=utf-8');
    expect(res.text).toBe('name: John Doe\nage: 30\n');
  });

  it('should convert YAML to JSON', async () => {
    // Mock the YAML load function to return a JSON object
    yaml.load.mockReturnValue({ name: 'John Doe' });

    // Mock the fragment data to simulate a YAML fragment
    const fragmentData = {
      type: 'application/yaml',
      data: 'name: John Doe',
    };
    Fragment.byId.mockResolvedValue(fragmentData);

    // Make the request to the server
    const res = await request(app)
      .get('/api/fragment/testid.json')
      .set('Accept', 'application/json') // Ensure the request expects a JSON response
      .expect('Content-Type', /json/) // Expect the content type to be JSON
      .expect(200);

    // Manually parse the response text to JSON
    const jsonResponse = JSON.parse(res.text);

    // Assert that the JSON response matches the expected output
    expect(jsonResponse).toEqual({ name: 'John Doe' });
  });

  it('should handle plain text correctly', async () => {
    const fragmentData = {
      type: 'text/plain',
      data: 'This is a plain text fragment',
    };
    Fragment.byId.mockResolvedValue(fragmentData);

    const res = await request(app).get('/api/fragment/testid.txt');

    expect(res.statusCode).toBe(200);
    expect(res.header['content-type']).toBe('text/plain; charset=utf-8');
    expect(res.text).toBe(fragmentData.data);
  });

  it('should handle direct CSV response without conversion', async () => {
    const fragmentData = {
      type: 'text/csv',
      data: 'name,age\nJohn Doe,30\nJane Doe,25',
    };
    Fragment.byId.mockResolvedValue(fragmentData);

    const res = await request(app).get('/api/fragment/testid.csv');

    expect(res.statusCode).toBe(200);
    expect(res.header['content-type']).toBe('text/csv; charset=utf-8');
    expect(res.text).toBe(fragmentData.data);
  });

  it('should convert JSON to CSV', async () => {
    // Mock the json2csv.Parser function
    const mockParser = new Parser();
    mockParser.parse.mockReturnValue('name,age\nJohn Doe,30\nJane Doe,25');

    // Mock the fragment data to simulate a JSON fragment
    const fragmentData = {
      type: 'application/json',
      data: JSON.stringify([
        { name: 'John Doe', age: 30 },
        { name: 'Jane Doe', age: 25 },
      ]),
    };
    Fragment.byId.mockResolvedValue(fragmentData);

    // Make the request to the server
    const res = await request(app)
      .get('/api/fragment/testid.csv')
      .set('Accept', 'text/csv') // Ensure the request expects a CSV response
      .expect('Content-Type', /csv/) // Expect the content type to be CSV
      .expect(200);

    // Assert that the CSV response matches the expected output
    expect(res.text).toBe('name,age\nJohn Doe,30\nJane Doe,25');
  });
});
