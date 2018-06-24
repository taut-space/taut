const uuidv4 = require('uuid/v4');

var uuid = module.exports;

/**
 * Middleware function for decorating a request with a UUID.
 * @param {object} Request
 * @param {object} Response
 * @callback {void}
 */
uuid.middleware = function (req, res, next) {
    req.uuid = uuidv4();
    res.uuid = req.uuid;
    next();
};
