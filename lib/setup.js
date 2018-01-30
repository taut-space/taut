const errors = require('restify-errors');

// Checks that the session is a valid login
// Also sets up variables in the request for later usage
module.exports = function (req, res, next) {
    
    const hashpieces = req.context.hashname.split('.');
    if (hashpieces.length > 0 && hashpieces[0].length === 32) {
        req.backend = {
            hashname: req.context.hashname,
            hash: hashpieces[0],
            user: res.headers['x-user'] || 'unknown'
        };
    } else {
        return next(new errors.BadRequestError());
    }

    next();
};
