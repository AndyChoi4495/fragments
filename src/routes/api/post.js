const contentType = require('content-type');
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');

module.exports = async (req, res) => {
  try {
    // Parse the Content-Type header
    const { type } = contentType.parse(req.headers['content-type']);

    // Validate the Content-Type
    if (!Fragment.isSupportedType(type)) {
      logger.warn(`Unsupported media type: ${type}`);
      return res.status(415).json({ error: `Unsupported media type: ${type}` });
    }
    // Check if the request body is a buffer
    if (!Buffer.isBuffer(req.body)) {
      logger.warn('Request body is not a buffer');
      return res.status(400).json({ error: 'Invalid request body' });
    }

    // Create a new fragment
    const fragment = new Fragment({
      ownerId: req.user,
      type,
      size: req.body.length,
      data: req.body,
    });
    logger.info('Created new fragment object', { fragment });

    // Set the fragment data
    await fragment.setData(req.body);
    logger.info('Fragment data set successfully');

    // Construct the location URL for the new fragment
    const location = new URL(
      `${process.env.API_URL || req.protocol + '://' + req.get('host')}/v1/fragments/${fragment.id}`
    );

    logger.info('Fragment created successfully', { fragment });

    // Return a successful response
    res
      .status(201)
      .location(location.toString())
      .json({
        status: 'ok',
        fragment: {
          id: fragment.id,
          ownerId: fragment.ownerId,
          created: fragment.created,
          updated: fragment.updated,
          type: fragment.type,
          size: fragment.size,
          data: fragment.data,
        },
      });
  } catch (err) {
    logger.error('Error creating fragment', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
