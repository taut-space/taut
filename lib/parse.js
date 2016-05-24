const errors = require('restify-errors');

/**
 * Parses request body to ensure it is valid JSON and complies with the schema.
 * @param {Object} Request
 * @param {Object} Response
 * @callback {void}
 */
module.exports = function (req, res, next) {
    // Ensure body is defined
    if (typeof req.body === 'undefined') {
        return next(new errors.BadRequestError());
    }

    // Ensure body is an object
    if (typeof req.body !== 'object') {
        return next(new errors.BadRequestError());
    }

    // @todo Run through `scratch-parser`

    next();
};
