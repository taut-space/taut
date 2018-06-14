const errors = require('restify-errors');
const fs = require('fs');
const request = require('request');
const os = require('os');
const path = require('path');

const async = require('async');

const log = require('./log');
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
 * Route handler for uploading an asset:
 * 1) check that the asset does not already exist in primary storage.
 * 2) If it does exist and is good, drop out early and respond with an ok_json.
 * 3) If it does exist, begin streaming the upload directly into primary storage
 *    under a temporary name (TEMP_PREFIX + key)
 * 4) Once stored, check that the ETag (md5 hash) matches the filename
 * 5) If not matching, remove the temporary file and respond with BadRequest
 * 6) If matching, rename the temporary file to the final name (hash.ext)
 * 7) If some other error occurs, respond with InternalServerError
 *
 * @param {object} Request
 * @param {object} Response
 */
routes.post = function (req, res) {
    // Ensure that the object does *NOT* exist
    storage.has(req.params.hashname, function (err, exists, metadata) {
        const ok_json = {
            'status': 'ok',
            'content-name': req.params.hashname,
        };

        if (exists && metadata.etag === req.backend.hash) {
            // It exists, and S3's idea of its hash matches this hash name
            // Don't (re)save it
            return res.json(ok_json);
        }

        // It does not exist or, what is there does not have
        // a correct etag/hash
        // Store the data into the backend via streaming directly
        // Use a temporary name until we confirm that the etag/hash
        // matches the hashname so that we do not overwrite what is
        // already there.
        async.auto({
            uploadInfo: function (cb) {
                var useTemp = true;
                storage.streamObjectIn(req, useTemp,
                    function (err, uploadInfo) {
                        if (err) {
                            log.error(err);
                            if (err.message.includes('too large')) {
                                return cb(413);
                            }
                            return cb(new errors.BadRequestError);
                        }
                        return cb(null, uploadInfo);
                    });
            },
            checkUpload: ['uploadInfo', function (obj, cb) {
                // Check that the ETag matches the filename
                // i.e. the md5 hash matches the filename
                if (obj.uploadInfo.ETag !== req.backend.hash) {
                    log.info('Filename md5 hash mismatch, expected hash:',
                        req.backend.hash,
                        ' actual hash:',
                        obj.uploadInfo.ETag,
                        ' - Removing temporary file'
                    );

                    storage.deleteTempObject(
                        req.params.hashname, function (err) {
                            if (err) {
                                log.error(err);
                                return cb(new errors.InternalServerError);
                            }
                            return cb(new errors.BadRequestError, null);
                        }
                    );
                } else {
                    // Everything checks out, rename the object to its
                    // final name and make sure Metadata is updated
                    obj.uploadInfo.metadata = { user: req.backend.user };
                    storage.renameTempObject(
                        req.params.hashname,
                        obj.uploadInfo,
                        function (err) {
                            if (err) {
                                log.error(err);
                                return cb(new errors.InternalServerError);
                            }
                            return cb(null, obj.uploadInfo);
                        });
                }
            }],
        }, function (err) {
            if (err) {
                return res.send(err);
            }
            return res.json(ok_json);
        });
    });
};

/**
 * Handle GET requests
 * First check primary storage if the file exists, and if so,
 * stream it out.
 * If not, make an attempt to retreive it from the older storge
 * backend via the legacy API and stream it directly.
 *
 * @param  {object} req The restify/https request
 * @param  {object} res The restify/https response
 */
routes.get = function(req, res) {
    storage.has(req.params.hashname, (err, exists) => {
        // Check if the resource exists in primary Storage
        if (exists) {
            storage.streamObjectOut(req.params.hashname, res, (err) => {
                if (err) log.error(err);
            });
        } else {
            // Try backend storage instead
            var url =
                'https://' +
                storage.backendAssetsHost +
                '/internalapi/asset/' +
                req.params.hashname +
                '/get/';
            log.info('not found in primary storage, looking in backend: ',url);
            // proxy directly between client and backend
            req.pipe(request(url)).pipe(res);
        }
    });
};

