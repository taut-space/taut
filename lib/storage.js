const aws = require('aws-sdk');

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
        maxRetries: 2
    });
}

/**
 * Checks to see if the specified object exists within S3.
 * @param {string} Object key
 * @callback
 * @param {object} error
 * @param {boolean} exists
 * @param {object} S3metadata
 */
Storage.prototype.has = function (key, callback) {
    this.client.headObject({
        Bucket: this.bucket,
        Key: key.toString()
    }, function (err, obj) {
        if (err) return callback(null, false, null);
        const metadata = {
            etag: obj.ETag.replace(/['"]+/g,''),
            ...obj.Metadata
        };
        callback(null, true, metadata);
    });
};

/**
 * Gets the metadata of the specified object from S3.
 * @param {string} Object key
 * @callback {object}
 */
Storage.prototype.metadata = function (key, callback) {
    this.client.headObject({
        Bucket: this.bucket,
        Key: key.toString()
    }, function (err, obj) {
        if (err) return callback(err);
        callback(null, {
            etag: obj.ETag,
            ...obj.Metadata
        });
    });
};

/**
 * Gets the specified object from S3.
 * @param {string} Object key
 * @callback {object}
 */
Storage.prototype.get = function (key, callback) {
    this.client.getObject({
        Bucket: this.bucket,
        Key: key.toString()
    }, function (err, obj) {
        if (err) return callback(err);
        const buffer = new Buffer(obj.Body, 'utf-8');
        const project = JSON.parse(buffer.toString());
        callback(null, project);
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
