const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');

const { getContentTypeForExtension, convertFragment } = require('../../../utils/helper');

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
