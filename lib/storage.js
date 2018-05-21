const aws = require('aws-sdk');
const stream = require('stream');
const assetTypes = require('scratch-asset-types');

const fs = require('fs');
const https = require('https');

const log = require('./log');

const MAX_BODY_SIZE_BYTES =
    parseInt(process.env.MAX_BODY_SIZE_BYTES || '10000000', 10);

/**
 * Handles communication to and from Amazon S3.
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
            connectTimeout: process.env.CONNECT_TIMEOUT || 3000,
            timeout: process.env.DATA_TIMEOUT || 30000
        }
    });
}

Storage.prototype.renameObject = function (
        oldKey,
        newKey,
        contentType,
        callback
    ) {
    this.client.copyObject({
        Bucket: this.bucket,
        CopySource: '/' + this.bucket + '/' + oldKey,
        Key: newKey,
        ContentType: contentType.toString(),
        MetadataDirective: 'REPLACE',
        ACL: 'public-read'
    }, (err, copyInfo) => {
        if (err) return callback(err);
        this.deleteObject(oldKey, (err, deleteInfo) => {
            if (err) return callback(err);
            return callback(null, { ...copyInfo, ...deleteInfo });
        });
    });
};

Storage.prototype.deleteObject = function (key, callback) {
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
Storage.prototype.metadata = function (key, callback) {
    this.client.headObject({
        Bucket: this.bucket,
        Key: key.toString()
    }, function (err, obj) {
        if (err) return callback(err);
        return callback(null, {
            etag: obj.ETag.replace(/['"]+/g,''),
            ...obj.Metadata
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
Storage.prototype.streamObjectIn = function (req, useTemp, callback) {
    var body = new stream.PassThrough();
    var firstData = true;
    var totalSize = 0;
    var key = req.backend.hashname;
    var detectedContentType = {mime: 'application/octet-stream'};

    req.pipe(body)
        .pause()
        .on('data', (data) => {
            if (firstData) {
                firstData = false;
                detectedContentType = assetTypes.bufferCheck(data);
                if (detectedContentType === null)
                    detectedContentType = {mime: 'application/octet-stream'};
            }
            totalSize += Buffer.byteLength(data);
        });

    if (useTemp) key = key + '.tmp';

    this.client.upload({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ACL: 'public-read',
        sslEnabled: false,
        Metadata: {
            user: req.backend.user
        }
    }, {
        partSize: 10 * 1024 * 1024,
        queueSize: 1,
    }, (err, status) => {
        if (err) {
            log.error(err);
            return callback(err, null);
        }
        status.size = totalSize;
        status.contentType = detectedContentType.mime;
        status.ETag = status.ETag.replace(/['"]+/g,'');
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
Storage.prototype.streamObjectOut = function (key, res, callback) {
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
            return callback(null);
        });
};

/**
 * Puts a new object in S3. WARNING: this will overwrite any existing files
 * with the same key.
 * @param {string} key Object key
 * @param {string} user Username of object owner
 * @param {object} body JSON payload to be written to S3
 * @callback {void}
 */
Storage.prototype.set = function (key, user, body, callback) {
    this.client.putObject({
        Bucket: this.bucket,
        Key: key.toString(),
        Body: body,
        ACL:'public-read',
        Metadata: {
            user: user
        }
    }, function (err) {
        if (err) return callback(err);
        callback(null);
    });
};

/**
 * Returns basic connection information about the storage client.
 * @returns {Object}
 */
Storage.prototype.health = function () {
    return {
        ssl: this.client.config.sslEnabled,
        region: this.client.config.region,
        retries: this.client.config.maxRetries
    };
};

module.exports = new Storage();
