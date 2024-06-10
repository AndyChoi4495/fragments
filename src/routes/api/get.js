// src/routes/api/get.js
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');
const { parse } = require('content-type');
/**
 * Get a list of fragments for the current user
 */

module.exports = async (req, res) => {
  // TODO: this is just a placeholder to get something working

  try {
    const ownerId = req.user;
    const { id } = req.params;

    if (!id) {
      // Get all fragments for the user
      const fragments = await Fragment.byUser(ownerId, false);
      return res.status(200).json({
        status: 'ok',
        fragments: fragments,
      });
    }
    const [fragmentId, extension] = id.split('.');
    const fragment = await Fragment.byId(ownerId, fragmentId);

    if (!fragment) {
      logger.warn(`Fragment not found: ${fragmentId}`);
      return res.status(404).json({ error: 'Fragment not found' });
    }

    let data = await fragment.getData();
    let type = fragment.type;

    res.setHeader('Content-Type', type);
    res.send(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};
