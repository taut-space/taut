const errors = require('restify-errors');

const storage = require('./storage');

const routes = module.exports = {};

/**
 * Route handler for creating a new project.
 * @param {object} Request
 * @param {object} Response
 */
routes.post = function (req, res) {
    // @todo Create project id / push to API
    // @todo Push to S3
    // @todo Respond
    res.json();
    res.end();
};

/**
 * Route handler for updating an existing project.
 * @param {object} Request
 * @param {object} Response
 */
routes.put = function (req, res) {
    // @todo Check if exists
    // @todo Push to S3
    // @todo Respond
    res.json();
    res.end();
};

/**
 * Route handler for getting an existing project.
 * @param {object} Request
 * @param {object} Response
 */
routes.get = function (req, res) {
    storage.get(req.params.id, function (err, obj) {
        if (err) res.send(new errors.NotFoundError);
        res.json(obj);
        res.end();
    });
};
