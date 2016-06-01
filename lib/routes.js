const errors = require('restify-errors');
const os = require('os');

const storage = require('./storage');

const routes = module.exports = {};

/**
 * Route handler for getting the general health of server instance.
 * @param {object} Request
 * @param {object} Response
 */
routes.health = function (req, res) {
    res.json({
        uptime: os.uptime(),
        load:   os.loadavg(),
        storage: storage.health()
    });
    res.end();
};

/**
 * Route handler for creating a new project.
 * @param {object} Request
 * @param {object} Response
 */
routes.post = function (req, res) {
    // @todo Create project id / push to API
    // @todo Push to S3
    // @todo Respond
    res.json({
        'status': 'ok',
        'content-name': '110992220',           // @todo Append project ID
        'content-title': 'VW50aXRsZWQtNA==',   // @todo Base64 of project title
        'autosave-interval': '120'
    });
    res.end();
};

/**
 * Route handler for updating an existing project.
 * @param {object} Request
 * @param {object} Response
 */
routes.put = function (req, res) {
    // Check to see if object exists
    storage.has(req.params.id, function (err, exists) {
        if (err) return res.send(new errors.InternalServerError);
        if (!exists) return res.send(new errors.NotFoundError);

        // Update object and respond
        storage.set(req.params.id, req.body, function (err) {
            if (err) return res.send(new errors.InternalServerError);
            res.json({
                'status': 'ok',
                'autosave-interval': 120
            });
            res.end();
        });
    });
};

/**
 * Route handler for getting an existing project.
 * @param {object} Request
 * @param {object} Response
 */
routes.get = function (req, res) {
    storage.get(req.params.id, function (err, obj) {
        if (err) return res.send(new errors.NotFoundError);
        res.json(obj);
        res.end();
    });
};
