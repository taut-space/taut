const errors = require('restify-errors');
const fs = require('fs');
const request = require('request');
const os = require('os');
const path = require('path');
const assetErrors = require('./asset-errors');

// Conditionally include newrelic, based on advice from NR
// https://discuss.newrelic.com/t/conditional-startsegment/55843/2
// This allows other calls to newrelic to be stubbed out, such as
// newrelic.startSegment() without further conditional handling
process.env.NEW_RELIC_ENABLED =
    typeof process.env.NEW_RELIC_LICENSE_KEY === 'string';
const newrelic = require('newrelic');

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
routes.health = function health (req, res, next) {
    res.json({
        uptime: os.uptime(),
        load:   os.loadavg(),
        storage: storage.health()
    });
    res.end();
    return next();
};

/**
 * Route handler for uploading an asset:
 * 1) check that the asset does not already exist in primary storage.
 * 2) If it does exist and is good, drop out early and respond with an ok_json.
 * 3) If a failure occurs during upload, respond with appropriate error
 *
 * @param {object} Request
 * @param {object} Response
 */
routes.post = function post (req, res, next) {
    newrelic.addCustomAttributes({
        'UUID': req.uuid,
        'hashname': req.params.hashname
    });

    // Ensure that the object does *NOT* exist
    storage.has(req.params.hashname, function (err, exists, metadata) {
        const ok_json = {
            'status': 'ok',
            'content-name': req.params.hashname,
        };

        if (exists && metadata.ETag === req.store.hash) {
            // It exists, and the store's idea of its hash matches this hash name
            // Don't (re)save it
            res.json(ok_json);
            return next();
        }

        // It does not exist or, what is there does not have
        // a correct etag/hash
        // Store the data into the store via streaming directly
        storage.upload(req, (err) => {
            if (err) {
                switch (err.constructor) {
                case assetErrors.TooBigAssetError:
                    res.send(new errors.PayloadTooLargeError);
                    break;
                case assetErrors.HashMismatchAssetError:
                    res.send(new errors.BadRequestError);
                    break;
                case assetErrors.FailedAssetError:
                case assetErrors.DeleteFailedAssetError:
                case assetErrors.RenameFailedAssetError:
                default:
                    res.send(new errors.InternalServerError);
                    break;
                }
            } else {
                res.send(ok_json);
            }
            return next();
        });
    });
};

/**
 * Handle GET requests
 * First check primary storage if the file exists, and if so,
 * stream it out.
 *
 * @param  {object} req The restify/https request
 * @param  {object} res The restify/https response
 */
routes.get = function get (req, res, next) {
    storage.has(req.params.hashname, (err, exists) => {
        // Check if the resource exists in primary Storage
        if (exists) {
            newrelic.startSegment('storage.streamObjectOut', false, () => {
                storage.streamObjectOut(req.params.hashname, res, (err) => {
                    if (err) log.error(err);
                    return next();
                });
            });
        }
    });
};

/**
 * Handle HEAD requests
 * First check primary storage if the file exists, and if so,
 * send back the headers that are appropriate.
 *
 * @param  {object} req The restify/https request
 * @param  {object} res The restify/https response
 */
routes.head = function head (req, res, next) {
    if (req.params.hashname == undefined) {
        return routes.health(req, res);
    } else {
        storage.has(req.params.hashname, (err, exists, metadata) => {
            if (exists) {
                res.header('content-length', metadata.ContentLength);
                res.header('content-type', metadata.ContentType);
                res.send(200);
                res.end();
                return next();
            }
        });
    }
};

/**
 * Route handler for crossdomain.xml requests used by Scratch 2.0.
 * @param {object} req The restify/https request
 * @param {object} res The restify/https response
 */
routes.crossdomain = function crossdomain (req, res) {
    res.header('Content-Type', 'application/xml');
    res.end(cdFile);
};
