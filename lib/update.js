const errors = require('restify-errors');
const util = require('util');

const backend = require('./backend');

module.exports = function (req, res, next) {
    const route = '/backend-authenticate/internalapi/project/%s/set/';
    backend({
        method: 'GET',
        uri: util.format(route, req.params.id),
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
