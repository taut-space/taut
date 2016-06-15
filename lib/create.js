const errors = require('restify-errors');

const api = require('./api');

module.exports = function (req, res, next) {
    api({
        method: 'POST',
        uri: '/users' + req.session.username + '/projects',
        headers: {
            // @todo API token
        },
        json: {
            // @todo Remix, Title, etc.
        }
    }, function (err) {
        if (err) return next(new errors.ForbiddenError);
        // @todo Attach to `req.project`
        next();
    });
};
