const errors = require('restify-errors');
const fs = require('fs');
const os = require('os');
const path = require('path');

const log = require('./log');
const storage = require('./storage');

const cdPath = path.resolve(__dirname, './crossdomain.xml');
const cdFile = fs.readFileSync(cdPath, 'utf8');

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
    // Ensure that the object does *NOT* exist
    storage.has(req.backend.id, function (err, exists) {
        if (err) return res.send(new errors.InternalServerError);
        if (exists) {
            log.error('Project with ID ' + req.backend.id + ' exists');
            return res.send(new errors.InternalServerError);
        }

        // Push project to S3
        storage.set(req.backend.id, req.backend.user, req.body, function (err) {
            if (err) return res.send(new errors.InternalServerError);
            res.json({
                'status': 'ok',
                'content-name': req.backend.id,
                'content-title': req.backend.title,
                'autosave-interval': req.backend.autosave
            });
            res.end();
        });
    });
};

/**
 * Route handler for updating an existing project.
 * @param {object} Request
 * @param {object} Response
 */
routes.put = function (req, res) {
    storage.set(req.backend.id, req.backend.user, req.body, function (err) {
        if (err) return res.send(new errors.InternalServerError);
        res.json({
            'status': 'ok',
            'autosave-interval': req.backend.autosave
        });
        res.end();
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

/**
 * Route handler for crossdomain.xml requests used by Scratch 2.0.
 * @param {object} Request
 * @param {object} Response
 */
routes.crossdomain = function (req, res) {
    res.header('Content-Type', 'application/xml');
    res.end(cdFile);
};
