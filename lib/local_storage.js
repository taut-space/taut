const fs = require('fs');
const path = require('path');
const stream = require('stream');
const {once} = require('lodash');

const log = require('./log');

const TEMP_PREFIX = 'tmp/';

// Limit object sizes to 10MB by default
Storage.prototype.maxObjectSizeBytes =
    parseInt(process.env.MAX_OBJECT_SIZE_BYTES || '10000000', 10);

Storage.prototype.localStore = process.env.LOCAL_STORE || 'data';
/**
 * Handles communication to and from Amazon S3. aka primary storage
 * Fails fast on connection timeouts to S3: default 1.5 seconds
 * Fails fast on data flow timeouts: default 15 seconds
 *
 * @constructor
 */
function Storage () {
    log.info('Using local storage');
    log.info(`Making sure ${this.localStore} directory exists`);
    this.mkdirp(this.localStore);
    log.info(`Making sure ${path.join(this.localStore,TEMP_PREFIX)} exists`);
    this.mkdirp(path.join(this.localStore,TEMP_PREFIX));
}


/**
 * Rename object in primary storage
 * Used to move a temporary upload object to its final name.
 *
 * @param  {string}   oldKey      Old/current key
 * @param  {string}   newKey      New key to rename to
 * @param  {[type]}   contentType Toss in the detected content mime type
 * @param  {Function} callback    callback
 * @return {callback}             return the callback
 */
Storage.prototype.renameTempObject = function (
    key,
    info,
    callback
) {
    this.client.copyObject({
        Bucket: this.bucket,
        CopySource: '/' + this.bucket + '/' + TEMP_PREFIX + key,
        Key: key,
        ContentType: info.contentType.toString(),
        Metadata: {
            ...info.metadata
        },
        MetadataDirective: 'REPLACE',
        ACL: 'public-read'
    }, (err, copyInfo) => {
        if (err) return callback(err);
        this.deleteTempObject(key, (err, deleteInfo) => {
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
 *
 * @param  {string}   key      Key for object in store
 * @param  {Function} callback callback
 * @return {callback}          return the callback
 */
Storage.prototype.deleteTempObject = function (key, callback) {
    this.client.deleteObject({
        Bucket: this.bucket,
        Key: TEMP_PREFIX + key
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
    var fullPath = path.join(this.localStore, key);
    log.info('has:', fullPath);
    fs.access(fullPath, fs.constants.F_OK, (err) => {
        if (err) return callback(null, false, null);
        return callback(null, true, null);
    });
};


Storage.prototype.mkdirp = function (filePath) {
    var dirname = path.dirname(filePath);
    if (fs.existsSync(dirname)) {
        return true;
    }
    this.mkdirp(dirname);
    fs.mkdirSync(dirname);
}

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
    var totalSize = 0;
    var key = req.store.hashname;
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
    if (useTemp) key = TEMP_PREFIX + req.uuid + '-' + key;
    var newFile = fs.createWriteStream(key);
    newFile
        .on('finish', (err) => {
            if (err) {
                log.error(err);
                return callback(err, null);
            }
            var status = {};
            status.size = totalSize;
            status.contentType = detectedContentType.mime;
            status.ETag = status.ETag.replace(/['"]+/g,'');
            log.info('Upload complete, status:',status);
            return callback(null, status);
        });

    uploadStream.pipe(newFile);

    uploadStream.on('data', (data) => {
        contentTypeDetection(data);  // Called once
        totalSize += Buffer.byteLength(data);
        if (totalSize > this.maxObjectSizeBytes) {
            stopTransfer(uploadStream, totalSize); // Called once
        }
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
    var fullPath = path.join(this.localStore, key);
    log.info('Trying to open:', fullPath);
    const readStream = fs.createReadStream(fullPath);
    var totalSize = 0;
    readStream.pipe(res);
    readStream
        .on('error',  err => {
            return callback(err);
        })
        .on('finish', function() {
            log.info(`Read: ${totalSize} bytes`);
            return callback(null);
        })
        .on('data', chunk => {
            totalSize += chunk.length;
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
