const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');

module.exports = async (req, res) => {
  try {
    const userId = req.user;
    const expand = req.query.expand === '1';

    // Fetch all fragments for the authenticated user
    const fragments = await Fragment.find({ ownerId: userId });

    // Prepare the response
    const response = {
      status: 'ok',
      fragments: expand
        ? fragments.map((fragment) => ({
            id: fragment.id,
            ownerId: fragment.ownerId,
            created: fragment.created,
            updated: fragment.updated,
            type: fragment.type,
            size: fragment.size,
          }))
        : fragments.map((fragment) => ({ id: fragment.id })),
    };

    logger.info('Fetched fragments successfully', { userId, expand });

    // Return the response
    res.status(200).json(response);
  } catch (err) {
    logger.error('Error fetching fragments', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
