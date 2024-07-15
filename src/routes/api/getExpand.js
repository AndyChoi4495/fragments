const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');

module.exports = async (req, res) => {
  try {
    const ownerId = req.user;
    const expand = req.query.expand === '1';

    // Fetch all fragments for the authenticated user
    const fragments = await Fragment.byUser({ ownerId, expand });

    // Prepare the response
    const response = {
      status: 'ok',
      fragments: expand
        ? fragments.map((fragment) => ({
            id: fragment.id,
            ownerId: fragment.ownerId,
            created: fragment.created.toISOString(),
            updated: fragment.updated.toISOString(),
            size: fragment.size,
            type: fragment.type,
          }))
        : fragments.map((fragment) => ({ id: fragment.id })),
    };

    logger.info('Fetched fragments successfully', { ownerId, expand });

    // Return the response
    res.status(200).json(response);
  } catch (err) {
    logger.error('Error fetching fragments', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
