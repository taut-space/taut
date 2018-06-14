const errors = require('restify-errors');

/**
 * Extract Session, CSRF, and languages cookies and attach them to the request
 * object for later use by the backend
 * @param {Object} Request
 * @param {Object} Response
 * @callback {void}
 */
module.exports = function (req, res, next) {
    // Check for required cookies
    const cookie = (req.headers) ? req.headers.cookie : undefined;
    const session = req.cookies.tautsessionsid;
    const csrf = req.cookies.tautcsrftoken;
    if (typeof cookie === 'undefined') return next(new errors.ForbiddenError);
    if (typeof session === 'undefined') return next(new errors.ForbiddenError);
    if (typeof csrf === 'undefined') return next(new errors.ForbiddenError);

    // Attach session information to request object
    req.auth = {
        tautcsrftoken: csrf,
        cookie: req.headers.cookie
    };

    next();
};
