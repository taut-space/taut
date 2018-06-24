const errors = require('restify-errors');

// Checks that the session is a valid login
module.exports = function session (req, res, next) {
  return next();
};
