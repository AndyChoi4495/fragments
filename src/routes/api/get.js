// src/routes/api/get.js
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');
/**
 * Get a list of fragments for the current user
 */

module.exports = async (req, res) => {
  // TODO: this is just a placeholder to get something working

  try {
    const ownerId = req.user;
    // Get all fragments for the user
    const fragments = await Fragment.byUser(ownerId, false);

    return res.status(200).json({
      status: 'ok',
      fragments: fragments,
    });
  } catch (error) {
    logger.error('Error retrieving fragments', error);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};
