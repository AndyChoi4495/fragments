const { getContentTypeForExtension, convertFragment, jsonToCsv } = require('../../utils/helper');
const MarkdownIt = require('markdown-it');

describe('Helper Functions', () => {
  describe('getContentTypeForExtension', () => {
    test('should return correct content type for known extensions', () => {
      expect(getContentTypeForExtension('txt')).toBe('text/plain');
      expect(getContentTypeForExtension('md')).toBe('text/markdown');
      expect(getContentTypeForExtension('html')).toBe('text/html');
      expect(getContentTypeForExtension('csv')).toBe('text/csv');
      expect(getContentTypeForExtension('json')).toBe('application/json');
    });

    test('should return null for unknown extensions', () => {
      expect(getContentTypeForExtension('unknown')).toBeNull();
    });
  });

  describe('jsonToCsv', () => {
    test('should convert JSON to CSV format', () => {
      const json = [
        { name: 'John', age: 30 },
        { name: 'Jane', age: 25 },
      ];
      const expectedCsv = 'name,age\nJohn,30\nJane,25';
      expect(jsonToCsv(json)).toBe(expectedCsv);
    });
  });

  describe('convertFragment', () => {
    const md = new MarkdownIt();

    test('should convert markdown to HTML', async () => {
      const fragment = { data: '# Title', type: 'text/markdown' };
      const result = await convertFragment(fragment, 'html');
      expect(result).toBe(md.render('# Title'));
    });

    test('should convert JSON to CSV', async () => {
      const fragment = {
        data: JSON.stringify([{ name: 'John', age: 30 }]),
        type: 'application/json',
      };
      const result = await convertFragment(fragment, 'csv');
      expect(result).toBe('name,age\nJohn,30');
    });

    test('should return plain text for markdown to txt', async () => {
      const fragment = { data: '# Title', type: 'text/markdown' };
      const result = await convertFragment(fragment, 'txt');
      expect(result).toBe('# Title');
    });

    test('should return plain text for HTML to txt', async () => {
      const fragment = { data: '<h1>Title</h1>', type: 'text/html' };
      const result = await convertFragment(fragment, 'txt');
      expect(result).toBe('<h1>Title</h1>');
    });

    test('should return plain text for JSON to txt', async () => {
      const fragment = { data: JSON.stringify({ name: 'John' }), type: 'application/json' };
      const result = await convertFragment(fragment, 'txt');
      expect(result).toBe(JSON.stringify({ name: 'John' }));
    });

    test('should return plain text for CSV to txt', async () => {
      const fragment = { data: 'name,age\nJohn,30\nJane,25', type: 'text/csv' };
      const result = await convertFragment(fragment, 'txt');
      expect(result).toBe('name,age\nJohn,30\nJane,25');
    });

    test('should return original data for unknown conversion', async () => {
      const fragment = { data: 'unknown data', type: 'unknown/type' };
      const result = await convertFragment(fragment, 'unknown');
      expect(result).toBe('unknown data');
    });
  });
});
