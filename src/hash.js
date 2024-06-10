const crypto = require('crypto');

function hashEmail(email) {
  return crypto.createHash('sha256').update(email).digest('hex');
}

module.exports = hashEmail;
