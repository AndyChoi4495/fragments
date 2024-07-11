const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');

// Helper function to get the content type for a given extension
const getContentTypeForExtension = (extension) => {
  const extensionMap = {
    txt: 'text/plain',
    md: 'text/markdown',
    html: 'text/html',
    csv: 'text/csv',
    json: 'application/json',
    yaml: 'application/yaml',
    yml: 'application/yaml',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    webp: 'image/webp',
    gif: 'image/gif',
    avif: 'image/avif',
  };
  return extensionMap[extension] || null;
};

// Helper function to perform the conversion (example implementation)
const convertFragment = async (fragment, extension) => {
  // Implement the actual conversion logic here based on fragment.type and extension
  if (extension === 'html' && fragment.type === 'text/markdown') {
    return `<h1>${fragment.data.toString()}</h1>`; // Simple Markdown to HTML conversion
  }
  if (extension === 'txt' && fragment.type === 'text/markdown') {
    return fragment.data.toString(); // Markdown to Plain Text conversion
  }
  // Add more conversion logic as needed
  return fragment.data; // Default to returning original data if no conversion needed
};

module.exports = async (req, res) => {
  const { id } = req.params;
  const parts = id.split('.');
  const baseId = parts[0];
  const extension = parts.length > 1 ? parts.pop() : null;

  try {
    // Find the fragment by ID
    const fragment = await Fragment.findById(baseId);

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
    res.status(200).contentType(fragment.type).send(fragment.data);
  } catch (err) {
    logger.error('Error retrieving fragment', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
