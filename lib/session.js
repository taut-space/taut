const errors = require('restify-errors');

const backend = require('./backend');

// Checks that the session is a valid login
// Also sets up variables in the request for later usage
module.exports = function (req, res, next) {
    next();
    const route = `/backend-authenticate/internalapi/asset/${req.name}/set`;
    backend({
        method: 'GET',
        uri: route,
        headers: {
            'Cookie': req.auth.cookie,
            'X-CSRFTOKEN': req.auth.scratchcsrftoken
        }
    }, function (err, res) {
        if (err) return next(new errors.ForbiddenError);
        if (res.statusCode !== 200) return next(new errors.ForbiddenError);

        req.backend = {
            id: req.params.id,
            title: res.headers['x-projecttitle'],
            user: res.headers['x-user'],
            autosave: res.headers['x-autosaveinterval']
        };

        next();
    });
};
