const errors = require('restify-errors');
const fs = require('fs');
const os = require('os');
const path = require('path');

const crypto = require('crypto');

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
    // Calling metadata is a more direct and useful way of
    // discovering if the file already exists and what its existing hash is
    storage.has(req.backend.hashname, function (err, exists, metadata) {
        // Ignore any errors, just act on if it exists or not
        const ok_json = {
            'status': 'ok',
            'content-name': req.backend.hashname,
        };

        if (exists && metadata.etag === req.backend.hash) {
            // It exists, and S3's idea of its hash matches this hash name
            // Don't (re)save it
            return res.json(ok_json);
        }

        // Proceed with more checks to make sure this should be stored
        req.backend.computedHash =
            crypto.createHash('md5').update(req.body).digest('hex');
        if (req.backend.computedHash !== req.backend.hash)
        {
            log.error( `hash mismatch: ${req.backend.computedHash}` +
                ` != ${req.backend.hash}, user: ${req.backend.user}`);
            return res.send(new errors.ForbiddenError);
        }

        // Store the data into the backend
        storage.set(req.backend.hashname, req.backend.user, req.body,
            function (err) {
                if (err) {
                    log.error('S3 Error on set:', err);
                    return res.send(new errors.InternalServerError);
                }
                return res.json(ok_json);
            });
    });
};

routes.get = function(req,res) {
    log.info(`route.get(${req},${res}) not yet implemented`);
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
