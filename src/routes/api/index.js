// src/routes/api/index.js
const contentType = require('content-type');
const { Fragment } = require('../../model/fragment');

const rawBody = () =>
  express.raw({
    inflate: true,
    limit: '5mb',
    type: (req) => {
      // See if we can parse this content type. If we can, `req.body` will be
      // a Buffer (e.g., `Buffer.isBuffer(req.body) === true`). If not, `req.body`
      // will be equal to an empty Object `{}` and `Buffer.isBuffer(req.body) === false`
      const { type } = contentType.parse(req);
      return Fragment.isSupportedType(type);
    },
  });

/**
 * The main entry-point for the v1 version of the fragments API.
 */
const express = require('express');

// Create a router on which to mount our API endpoints
const router = express.Router();

// Define our first route, which will be: GET /v1/fragments
router.get('/fragments', require('./get'));

router.get('/fragments/:id', require('./getById'));
router.get('/fragments?expand=1', require('./getExpand'));
router.get('/fragments/:id/info', require('./getIdInfo'));
router.get('/fragments/:id.:ext', require('./getById'));

// Other routes (POST, DELETE, etc.) will go here later on...
router.post('/fragments', rawBody(), require('./post'));
router.put('/fragments/:id', rawBody(), require('./putFragment'));
router.delete('/fragments/:id', require('./delete'));

module.exports = router;
