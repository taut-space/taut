var bunyan = require('bunyan');

// Create bunyan logger and request (req) serializer
var log = module.exports = bunyan.createLogger({
    name: 'taut',
    serializers: {
        req: bunyan.stdSerializers.req
    }
});

/**
 * Middleware function for logging a HTTP request.
 * @param {object} Request
 * @param {object} Response
 * @callback {void}
 */
log.middleware = function logMiddleware (req, res, next) {
    req.log = log;
    if (req.method !== undefined) log.info({req: req, uuid: req.uuid});
    next();
};
