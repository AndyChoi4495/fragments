// src/routes/api/getIdInfo.js
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');

module.exports = async (req, res) => {
  const { id } = req.params;
  const parts = id.split('/');
  const baseId = parts[0];
  try {
    // Find the fragment by ID and user ID
    const fragment = await Fragment.byId(req.user, baseId);

    if (!fragment) {
      logger.warn(`Fragment not found: ${id}`);
      return res.status(404).json({ error: 'Fragment not found' });
    }

    // Return the fragment's metadata
    return res.status(200).json({
      status: 'ok',
      fragment: fragment,
    });
  } catch (err) {
    logger.error('Error retrieving fragment metadata', err);
    res.status(500).json({ error: 'Internal Server Error', id });
  }
};
