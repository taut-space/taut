// Conditionally include newrelic, based on advice from NR
// https://discuss.newrelic.com/t/conditional-startsegment/55843/2
// This allows other calls to newrelic to be stubbed out, such as
// newrelic.startSegment() without further conditional handling
process.env.NEW_RELIC_ENABLED =
    typeof process.env.NEW_RELIC_LICENSE_KEY === 'string';
const newrelic = require('newrelic');

const aws = require('aws-sdk');
const stream = require('stream');
const {once} = require('lodash');
const assetTypes = require('scratch-asset-types');
const assetErrors = require('./asset-errors');
const log = require('./log');

const async = require('async');

const TEMP_PREFIX = 'tmp/';

// Limit object sizes to 10MB by default
Storage.prototype.maxObjectSizeBytes =
    parseInt(process.env.MAX_OBJECT_SIZE_BYTES || '10000000', 10);

/**
 * Handles communication to and from Amazon S3. aka primary storage
 * Fails fast on connection timeouts to S3: default 1.5 seconds
 * Fails fast on data flow timeouts: default 15 seconds
 *
 * @constructor
 */
function Storage () {
    this.bucket = process.env.AWS_S3_BUCKET || 'scratch2-assets-test';
    this.client = new aws.S3({
        apiVersion: '2006-03-01',
        region: 'us-east-1',
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
        sslEnabled: true,
        maxRetries: 2,
        httpOptions: {
            connectTimeout: process.env.CONNECT_TIMEOUT || 1500,
            timeout: process.env.DATA_TIMEOUT || 15000
        }
    });
}


/**
 * Rename object in primary storage
 * Used to move a temporary upload object to its final name.
 *
 * @param  {object}   opts             Information from the upload 
 * @param  {string}   opts.key         final key to object in S3
 * @param  {string}   opts.tempKey     temporary key name to rename in S3
 * @param  {string}   opts.contentType detected content-type from upload
 * @param  {Function} callback         callback
 * @return {callback}                  return the callback
 */
Storage.prototype.renameTempObject = function renameTempObject (
    info,
    callback
) {
    this.client.copyObject({
        Bucket: this.bucket,
        CopySource: '/' + this.bucket + '/' + info.tempKey,
        Key: info.key,
        ContentType: info.contentType.toString(),
        Metadata: {
            ...info.metadata
        },
        MetadataDirective: 'REPLACE',
        ACL: 'public-read'
    }, (err, copyInfo) => {
        if (err) return callback(err);
        this.deleteObject(info.tempKey, (err, deleteInfo) => {
            if (err) return callback(err);
            return callback(null, { ...copyInfo, ...deleteInfo });
        });
    });
};


/**
 * delete object form primary storage
 *
 * @param  {string}   key      Key for object in store
 * @param  {Function} callback callback
 * @return {callback}          return the callback
 */
Storage.prototype.deleteObject = function deleteObject (key, callback) {
    this.client.deleteObject({
        Bucket: this.bucket,
        Key: key
    }, (err, deleteInfo) => {
        if (err) return callback(err);
        return callback(null, deleteInfo);
    });
};

/**
 * Checks to see if the specified object exists within S3, using
 * headObject().
 * If the object exists, returns {null, true, metadata}
 * If the object does not exist, returns {null, false, null}
 *
 * @param  {string}   key      Name of object
 * @param  {Function} callback callback
 * @return {Function} callback promise, always with a null error condition,
 *                             a boolean for if the object exists, and
 *                             possibly metadata about the object.
 */
Storage.prototype.has = function (key, callback) {
    this.metadata(key, (err, metadata) => {
        if (err) return callback(null, false, null);
        return callback(null, true, metadata);
    });
};


/**
 * Gets the metadata of the specified object from S3.
 * @param  {[type]}   key      Name of object
 * @param  {Function} callback callback
 * @return {Function}          promise
 */
Storage.prototype.metadata = function metadata (key, callback) {
    this.client.headObject({
        Bucket: this.bucket,
        Key: key.toString()
    }, function (err, obj) {
        if (err) return callback(err);
        return callback(null, {
            ETag: obj.ETag.replace(/['"]+/g,''),
            ContentLength: obj.ContentLength || 0,
            ContentType: obj.ContentType || 'application/octet-stream'
        });
    });
};


/**
 * Streams an object into S3. Performs asset type checking
 * on the object to ensure it is a recognized type.
 *
 *
 * @param  {[type]}   req      [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
Storage.prototype.streamObjectIn = function streamObjectIn (
    req, useTemp, callback
) {
    var body = new stream.PassThrough();
    var totalSize = 0;
    var key = req.store.hashname;
    var detectedContentType = null;
    var tempKey;

    // Provide a single run function to detect the
    // mime type of the upload
    const contentTypeDetection = once( (firstData) => {
        detectedContentType = assetTypes.bufferCheck(firstData) ||
            {mime: 'application/octet-stream'};
    });

    // Provide a single run function to stop the transfer
    // and avoid re-calling the function if another `data`
    // event is triggered before the transfer is fully
    // shutdown.
    const stopTransfer = once( (dataStream, currentSize) => {
        dataStream.destroy(new assetErrors.TooBigAssetError(currentSize));
    });

    // Setup stream `data` event handling for the upload
    // Provides entry point for type detecting on the first `data` event
    // and if the upload is too large to accept
    // Stream is immediately paused and is started by the S3
    // client.upload call below
    var uploadStream = req.pipe(body).pause();

    uploadStream
        .on('data', (data) => {
            contentTypeDetection(data);  // Called once
            totalSize += Buffer.byteLength(data);
            if (totalSize > this.maxObjectSizeBytes) {
                stopTransfer(uploadStream, totalSize); // Called once
            }
        })
        .on('error', (err) => {
            log.error({uuid: req.uuid},'streamObjectIn pipe Error:', err);
        });

    if (useTemp) {
        tempKey = TEMP_PREFIX + req.uuid + '-' + key;
    } else {
        tempKey = key;
    }

    this.client.upload({
        Bucket: this.bucket,
        Key: tempKey,
        Body: body,
        ACL: 'public-read',
        sslEnabled: false,
        Metadata: {
            user: req.store.user
        }
    }, {
        partSize: this.maxObjectSizeBytes,
        queueSize: 1,
    }, (err, status) => {
        if (err) {
            // this gets logged as part of async.auto in Storage.upload
            if (err instanceof assetErrors.AssetError) {
                return callback(err);
            }  
            return callback(new assetErrors.FailedAssetError(err));
        }
        status.size = totalSize;
        status.contentType = detectedContentType.mime;
        status.ETag = status.ETag.replace(/['"]+/g,'');
        status.uuid = req.uuid;
        status.key = key;
        status.tempKey = tempKey;
        log.info({uuid: req.uuid, status: status},'Upload complete');
        return callback(null, status);
    });
};


/**
 * Streams the specified object from S3.
 * @param  {[type]}   key      [description]
 * @param  {[type]}   res      [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
Storage.prototype.streamObjectOut = function streamObjectOut (
    key, res, callback
) {
    return this.client.getObject({
        Bucket: this.bucket,
        Key: key.toString()
    })
        .on('httpHeaders', (statusCode, headers) => {
            res.set('content-type', headers['content-type']);
            res.set('content-length', headers['content-length']);
        })
        .createReadStream()
        .pipe(res)
        .on('finish', () => {
            log.info({uuid: res.uuid}, 'Finished streaming out');
            return callback(null);
        })
        .on('error', (err) => {
            var storageErr = assetErrors.FailedAssetError(err);
            log.error({uuid: res.uuid}, 
                'streamObjectOut pipe Error:', storageErr);
        });
};

/**
 * Storage upload handler
 *  1) Streams data direclty into primary storage under a 
 *      temporary name (TEMP_PREFIX + UUID + key)
 *  2) Once stored, check that the ETag (md5 hash) matches the filename
 *  3) If not matching, remove the temporary file and respond with HASH_MISMATCH
 *  4) If matching, rename the temporary file to the final name (hash.ext)
 *  5) If some other error occurs, respond with (|RENAME_|DELETE_)FAILED
 *  
 * @param  {object}   req      request object
 * @param  {Function} callback callback function
 */
Storage.prototype.upload = function upload (req, callback) {
    const storage = this;
    
    // Use a temporary name until we confirm that the etag/hash
    // matches the hashname so that we do not overwrite what is
    // already there.
    async.auto({
        uploadInfo: function (asyncCallback) {
            var useTemp = true;
            newrelic.startSegment('storage.streamObjectIn', false, () => {
                storage.streamObjectIn(req, useTemp,
                    function (err, uploadInfo) {
                        if (err) return asyncCallback(err);
                        return asyncCallback(null, uploadInfo);
                    });
            });
        },
        checkUpload: ['uploadInfo', (obj, asyncCallback) => {
            // Check that the ETag matches the filename
            // i.e. the md5 hash matches the filename
            if (obj.uploadInfo.ETag !== req.store.hash) {
                storage.deleteObject(
                    obj.uploadInfo.tempKey, (err) => {
                        if (err) {
                            return asyncCallback(
                                new assetErrors.DeleteFailedAssetError(err)
                            );
                        }
                        return asyncCallback(
                            new assetErrors.HashMismatchAssetError(
                                new assetErrors.AssetError(
                                    'expected:' + req.store.hash +
                                    ' actual:' + obj.uploadInfo.ETag)));
                    }
                );
            } else {
                // Everything checks out, rename the object to its
                // final name and make sure Metadata is updated
                obj.uploadInfo.metadata = { user: req.store.user };
                storage.renameTempObject(
                    obj.uploadInfo,
                    (err) => {
                        if (err) {
                            return asyncCallback(
                                new assetErrors.RenameFailedAssetError(err)
                            );
                        }
                        return asyncCallback(null, obj.uploadInfo);
                    });
            }
        }],
    }, function (err) {
        if (err) {
            log.error({uuid: req.uuid, err: err}, 'upload');
            return callback(err);
        }
        return callback(null);
    });
    
};

/**
 * Returns basic connection information about the storage client.
 * @returns {Object}
 */
Storage.prototype.health = function health () {
    return {
        ssl: this.client.config.sslEnabled,
        region: this.client.config.region,
        retries: this.client.config.maxRetries
    };
};

module.exports = new Storage();
