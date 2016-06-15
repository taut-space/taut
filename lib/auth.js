const errors = require('restify-errors');

const api = require('./api');
const signer = require('./signer');

const salt = process.env.SESSION_SALT ||
    'django.contrib.sessions.backends.signed_cookies';
const secret = process.env.SESSION_SECRET ||
    'jn4d-q3zk_86f9y($pc-($47#tml5v&$9d5-3vy#y4qao%u-$r';

/**
 * Check authentication cookies against API to ensure request is being made by
 * a valid user account.
 * @param {Object} Request
 * @param {Object} Response
 * @callback {void}
 */
module.exports = function (req, res, next) {
    // Check cookies for session
    const cookie = req.cookies.scratchsessionsid;
    if (cookie === undefined) return next(new errors.ForbiddenError);

    // Unsign and unpack cookie
    var session = signer.unsign(salt, cookie, secret);
    session = signer.unpack(session);
    if (session === undefined) return next(new errors.ForbiddenError);

    // Attach session to request object
    req.session = session;

    // Check to make sure user exists
    api({
        method: 'GET',
        uri: '/users/' + session.username
    }, function (err) {
        if (err) return next(new errors.ForbiddenError);
        next();
    });
};
