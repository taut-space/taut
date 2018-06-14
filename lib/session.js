const errors = require('restify-errors');

const backend = require('./backend');

// Checks that the session is a valid login
module.exports = function (req, res, next) {
    const route =
        `/backend-authenticate/internalapi/asset/${req.params.hashname}/set/`;
    backend({
        method: 'GET',
        uri: route,
        headers: {
            'Cookie': req.auth.cookie,
            'X-CSRFTOKEN': req.auth.tautcsrftoken
        }
    }, function (err, res) {
        if (err) return next(new errors.ForbiddenError);
        if (res.statusCode !== 200) return next(new errors.ForbiddenError);

        next();
    });
};
