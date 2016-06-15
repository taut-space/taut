const errors = require('restify-errors');

const storage = require('./storage');

module.exports = function (req, res, next) {
    // Check to ensure `session` object is attached to the request
    if (req.session === undefined) return next(new errors.ForbiddenError);

    // Get project and check author meta header against session
    storage.metadata(req.params.id, function (err, meta) {
        if (err) return next(new errors.NotFoundError);
        if (meta.user === undefined) return next(new errors.ForbiddenError);
        if (meta.user !== req.session.username) {
            return next(new errors.ForbiddenError);
        }
        next();
    });
};
