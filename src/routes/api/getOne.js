/* const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');

module.exports = async (req, res) => {
  const { id } = req.params;
  const extension = id.split('.').pop();

  try {
    // Find the fragment by ID
    const fragment = await Fragment.findById(id.split('.')[0]);

    if (!fragment) {
      logger.warn(`Fragment not found: ${id}`);
      return res.status(404).json({ error: 'Fragment not found' });
    }

    // Handle conversion based on extension
    if (extension !== id && extension !== fragment.type.split('/')[1]) {
      if (extension === 'txt' && fragment.type === 'text/markdown') {
        // Convert Markdown to Plain Text (example conversion)
        const convertedData = fragment.data.toString(); // Assume plain text for simplicity
        res.set('Content-Type', 'text/plain');
        return res.status(200).send(convertedData);
      } else {
        logger.warn(`Unsupported media type conversion: ${extension}`);
        return res.status(415).json({ error: `Unsupported media type conversion: ${extension}` });
      }
    }

    // Return the raw fragment data
    res.set('Content-Type', fragment.type);
    res.status(200).send(fragment.data);
  } catch (err) {
    logger.error('Error retrieving fragment', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
 */
