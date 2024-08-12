/* const logger = require('../logger');
const sharp = require('sharp');
const { Parser } = require('json2csv');
const yaml = require('js-yaml');
const MarkdownIt = require('markdown-it');
const md = new MarkdownIt();
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
  const parser = new Parser();
  return parser.parse(json);
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
        if (type === 'text/html') {
          return data; // HTML can be returned as is
        }
        break;
      case 'txt':
        if (
          [
            'text/markdown',
            'text/html',
            'application/json',
            'application/yaml',
            'text/plain',
            'text/csv',
          ].includes(type)
        ) {
          return data; // Plain text can handle markdown, HTML, JSON, YAML, CSV, or plain text as is
        }
        break;
      case 'csv':
        if (type === 'application/json') {
          return jsonToCsv(JSON.parse(data));
        }
        if (type === 'text/csv') {
          return data; // CSV can be returned as is
        }
        break;
      case 'json':
        if (type === 'application/json') {
          return data; // JSON can be returned as is
        }
        if (type === 'text/csv') {
          return JSON.stringify(data); // Convert CSV to JSON
        }
        if (type === 'application/yaml') {
          // Convert YAML to JSON
          return JSON.stringify(yaml.load(data));
        }
        break;
      case 'yaml':
      case 'yml':
        if (type === 'application/json') {
          return yaml.dump(JSON.parse(data)); // Convert JSON to YAML format
        }
        if (type === 'application/yaml') {
          return data; // YAML can be returned as is
        }
        break;
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'webp':
      case 'gif':
      case 'avif':
        if (['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/avif'].includes(type)) {
          // Use sharp to convert the image format
          return await sharp(Buffer.from(data)).toFormat(extension).toBuffer();
        }
        break;
      default:
        return data; // Return the data as is for unsupported extensions
    }
    return data;
  } catch (error) {
    logger.error('Error converting fragment', { error });
    throw new Error('ConversionError');
  }
};

module.exports = { getContentTypeForExtension, convertFragment, jsonToCsv };
 */
