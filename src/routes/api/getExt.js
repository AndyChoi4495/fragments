const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');
const MarkdownIt = require('markdown-it');
const md = new MarkdownIt();

module.exports = async (req, res) => {
  const { id, ext } = req.params;

  try {
    // Find the fragment by ID and user ID
    const fragment = await Fragment.findOne({ id, ownerId: req.user.id });

    if (!fragment) {
      logger.warn(`Fragment not found: ${id}`);
      return res.status(404).json({ error: 'Fragment not found' });
    }

    // Check if the extension is valid and perform conversion if necessary
    if (ext === 'html' && fragment.type === 'text/markdown') {
      // Convert Markdown to HTML
      const convertedData = md.render(fragment.data.toString());
      res.set('Content-Type', 'text/html');
      return res.status(200).send(convertedData);
    }

    // Unsupported conversion type
    logger.warn(`Unsupported media type conversion: ${ext}`);
    return res.status(415).json({ error: `Unsupported media type conversion: ${ext}` });
  } catch (err) {
    logger.error('Error retrieving fragment', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
