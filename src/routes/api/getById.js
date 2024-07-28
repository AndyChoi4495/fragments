// src/routes/api/getById.js

const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');

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

module.exports = async (req, res) => {
  const { id } = req.params;
  const parts = id.split('.');
  const baseId = parts[0];
  const extension = parts.length > 1 ? parts.pop() : null;

  try {
    // Find the fragment by ID
    const fragment = await Fragment.byId(req.user, baseId);
    if (!fragment) {
      logger.warn(`Fragment not found: ${id}`);
      return res.status(404).json({ error: 'Fragment not found' });
    }

    if (extension) {
      const targetContentType = getContentTypeForExtension(extension);
      if (!targetContentType) {
        logger.warn(`Unsupported media type conversion: ${extension}`);
        return res.status(415).json({ error: `Unsupported media type conversion: ${extension}` });
      }

      // Convert the fragment to the target type if necessary
      const convertedData = await convertFragment(fragment, extension);
      return res.status(200).contentType(targetContentType).send(convertedData);
    }

    // Return the raw fragment data with the original content type
    res.status(200).contentType(fragment.type).send(fragment);
  } catch (err) {
    logger.error('Error retrieving fragment', { error: err.message });
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
