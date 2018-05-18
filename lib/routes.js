const errors = require('restify-errors');
const fs = require('fs');
const request = require('request');
const os = require('os');
const path = require('path');

const async = require('async');

const log = require('./log');
const storage = require('./storage');

const cdPath = path.resolve(__dirname, './crossdomain.xml');
const cdFile = fs.readFileSync(cdPath, 'utf8');

const routes = module.exports = {};

const backendAssetsHost = process.env.BACKEND_ASSETS_STORE || 'cdn.assets.scratch.mit.edu';

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
    storage.has(req.params.hashname, function (err, exists, metadata) {
        const ok_json = {
            'status': 'ok',
            'content-name': req.params.hashname,
        };

        if (exists && metadata.etag === req.params.hash) {
            // It exists, and S3's idea of its hash matches this hash name
            // Don't (re)save it
            return res.json(ok_json);
        }

        // It does not exist or, somehow what is there does not have
        // a correct etag/hash
        // Store the data into the backend via streaming directly
        // Use a temporary name until we confirm that the etag/hash
        // matches the hashname
        async.auto({
            uploadInfo: function (cb) {
                var useTemp = true;
                storage.streamObjectIn(req, useTemp,
                    function (err, statusInfo) {
                        if (err) return cb(err, null);
                        return cb(null, statusInfo);
                    });
            },
            renameObject: ['uploadInfo', function (obj, cb) {
                log.info('info:',obj.uploadInfo);
                storage.renameObject(req.params.hashname + '.tmp', req.params.hashname, function (err, renameInfo) {
                    if (err) return cb(err);
                });
                return cb(null, obj.uploadInfo);
            }],
        }, function (err, obj) {
                if (err) {
                    log.error('S3 upload error:', err);
                    return res.send(new errors.InternalServerError);
                }
                return res.json(ok_json);
        });
    });
};

routes.get = function(req, res) {
    // Check if the resource exists in primary Storage
    storage.has(req.params.hashname, (err, exists) => {
        if (exists) {
            storage.streamObjectOut(req.params.hashname, res, (err) => {
                if (err) log.error(err);
            });
        } else {
            // Try backend storage instead
            var url =
                'https://' +
                backendAssetsHost +
                '/internalapi/asset/' +
                req.params.hashname +
                '/get/';
            log.info('not found in primary storage, looking in backend: ',url);
            req.pipe(request(url)).pipe(res);
        }
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
