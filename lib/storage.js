const aws = require('aws-sdk');
const stream = require('stream');
const {once} = require('lodash');
const assetTypes = require('scratch-asset-types');

const log = require('./log');

const TEMP_PREFIX = 'tmp/';

// Limit object sizes to 10MB by default
Storage.prototype.maxObjectSizeBytes =
    parseInt(process.env.MAX_OBJECT_SIZE_BYTES || '10000000', 10);
Storage.prototype.backendAssetsHost =
    process.env.BACKEND_ASSETS_STORE || 'cdn.assets.scratch.mit.edu';

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
 * @param  {object}   info        Object descriptor that includes key, tempKey, cntntTyp
 * @param  {Function} callback    callback
 * @return {callback}             return the callback
 */
Storage.prototype.renameTempObject = function (
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
        this.deleteTempObject(info, (err, deleteInfo) => {
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
 * delete temporary object form primary storage
 * Expects an object descriptor that contains tempKey
 *
 * @param  {object}   info     Object descriptor
 * @param  {Function} callback callback
 * @return {callback}          return the callback
 */
Storage.prototype.deleteTempObject = function (info, callback) {
    this.client.deleteObject({
        Bucket: this.bucket,
        Key: info.tempKey
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
Storage.prototype.streamObjectIn = function (req, useTemp, callback) {
    var body = new stream.PassThrough();
    var totalSize = 0;
    var key = req.backend.hashname;
    var detectedContentType = null;

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
        dataStream.destroy(new Error('Upload too large: ' + currentSize));
    });

    // Setup stream `data` event handling for the upload
    // Provides entry point for type detecting on the first `data` event
    // and if the upload is too large to accept
    // Stream is immediately paused and is started by the S3
    // client.upload call below
    var uploadStream = req.pipe(body).pause();

    uploadStream.on('data', (data) => {
        contentTypeDetection(data);  // Called once
        totalSize += Buffer.byteLength(data);
        if (totalSize > this.maxObjectSizeBytes) {
            stopTransfer(uploadStream, totalSize); // Called once
        }
    });

    if (useTemp) key = TEMP_PREFIX + req.uuid + '-' + key;

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
        partSize: this.maxObjectSizeBytes,
        queueSize: 1,
    }, (err, status) => {
        if (err) {
            log.error('uuid:',req.uuid,' error:',err);
            return callback(err, null);
        }
        status.size = totalSize;
        status.contentType = detectedContentType.mime;
        status.ETag = status.ETag.replace(/['"]+/g,'');
        status.uuid = req.uuid;
        status.tempKey = key;
        log.info('Upload complete, status:',status);
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
            log.info('Finished streaming: ', res.uuid);
            return callback(null);
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
