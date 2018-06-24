const errors = require('restify-errors');

// Sets up variables in the request for later usage
module.exports = function setup (req, res, next) {
    const hashpieces = req.params.hashname.split('.');
    if (hashpieces.length > 0 && hashpieces[0].length === 32) {
        req.store = {
            hashname: req.params.hashname,
            hash: hashpieces[0],
            user: res.header('x-user') || 'unknown'
        };
    } else {
        return next(new errors.BadRequestError());
    }

    next();
};
