const MarkdownIt = require('markdown-it');
const md = new MarkdownIt();
const logger = require('../logger');

// Helper function to get the content type for a given extension
const getContentTypeForExtension = (extension) => {
  const extensionMap = {
    txt: 'text/plain',
    md: 'text/markdown',
    html: 'text/html',
    csv: 'text/csv',
    json: 'application/json',
  };
  return extensionMap[extension] || null;
};
// Helper function to convert JSON to CSV

const jsonToCsv = (json) => {
  const array = typeof json !== 'object' ? JSON.parse(json) : json;
  const headers = Object.keys(array[0]);
  const csvRows = array.map((row) => headers.map((header) => row[header]).join(','));
  return [headers.join(','), ...csvRows].join('\n');
};

// Helper function to perform the conversion
const convertFragment = async (fragment, extension) => {
  const { type, data } = fragment;
  try {
    switch (extension) {
      case 'html':
        if (type === 'text/markdown') {
          return md.render(data);
        }
        break;
      case 'txt':
        if (type === 'text/markdown' || type === 'text/html' || type === 'application/json') {
          return data;
        }
        break;
      case 'csv':
        if (type === 'application/json') {
          return jsonToCsv(JSON.parse(data));
        }
        if (type === 'text/csv') {
          return data;
        }
        break;
      default:
        return data;
    }
    return data;
  } catch (error) {
    logger.error('Error converting fragment', { error });
    throw new Error('ConversionError');
  }
};

module.exports = { getContentTypeForExtension, convertFragment, jsonToCsv };
