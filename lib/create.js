const errors = require('restify-errors');

const api = require('./api');

module.exports = function (req, res, next) {
    const title = req.params.title || 'Unititled';
    const remix = req.params.original_id || undefined;
    const language = req.session.language || 'en';

    api({
        method: 'POST',
        uri: '/users/' + req.session.username + '/projects',
        headers: {
            'x-token': req.session.token
        },
        json: {
            title: title,
            remix: remix,
            language: language
        }
    }, function (err, body) {
        if (err) return next(new errors.ForbiddenError);
        req.create = {
            id: body.id,
            title: title,
            b64: new Buffer(title).toString('base64')
        };
        next();
    });
};
