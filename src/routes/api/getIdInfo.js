const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');

module.exports = async (req, res) => {
  const { id } = req.params;

  try {
    // Find the fragment by ID and user ID
    const fragment = await Fragment.findOne({ id, ownerId: req.user });

    if (!fragment) {
      logger.warn(`Fragment not found: ${id}`);
      return res.status(404).json({ error: 'Fragment not found' });
    }

    // Return the fragment's metadata
    res.status(200).json({
      status: 'ok',
      fragment: {
        id: fragment.id,
        ownerId: fragment.ownerId,
        created: fragment.created,
        updated: fragment.updated,
        type: fragment.type,
        size: fragment.size,
      },
    });
  } catch (err) {
    logger.error('Error retrieving fragment metadata', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
