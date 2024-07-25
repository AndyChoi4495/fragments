// src/routes/api/delete.js

const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');

module.exports = async (req, res) => {
  const { id } = req.params;
  const ownerId = req.user;

  try {
    // Delete the fragment by ID
    const result = await Fragment.delete(ownerId, id);
    if (result == undefined) {
      return res.status(200).json({ status: 'ok' });
    } else {
      logger.warn(`Fragment not found: ${id}`);
      return res.status(404).json({ error: 'Fragment not found' });
    }
  } catch (error) {
    logger.error('Error deleting fragment', { error: error.message });
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
