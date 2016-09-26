const errors = require('restify-errors');

const api = require('./api');

module.exports = function (req, res, next) {
    const title = req.params.title || 'Untitled';
    const original = req.params.original_id || undefined;
    const copy = req.params.is_copy || undefined;
    const language = req.session.language || 'en';

    api({
        method: 'POST',
        uri: '/users/' + req.session.username + '/projects',
        headers: {
            'x-token': req.session.token
        },
        json: {
            title: title,
            original: original,
            copy: copy,
            language: language
        }
    }, function (err, body) {
        if (err) return next(new errors.ForbiddenError);
        req.create = {
            id: body.id,
            title: body.title || title,
            b64: new Buffer(body.title || title).toString('base64')
        };
        next();
    });
};
