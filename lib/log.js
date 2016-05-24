var bunyan = require('bunyan');

var log = module.exports = bunyan.createLogger({
    name: 'projects',
    serializers: {
        // @todo Obfuscate authentication tokens
        req: bunyan.stdSerializers.req
    }
});

log.middleware = function (req, res, next) {
    req.log = log;
    if (req.method !== undefined) log.info({req: req});
    next();
};
