var aws = require('aws-sdk');

/**
 * Handles communication to and from Amazon S3.
 * @constructor
 */
function Storage () {
    this.bucket = process.env.AWS_S3_BUCKET || 'scratch2-projects-test';
    this.client = new aws.S3({
        apiVersion: '2006-03-01',
        region: 'us-east-1',
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
        sslEnabled: true,
        maxRetries: 3
    });
}

/**
 * Checks to see if the specified object exists within S3.
 * @param {string} Object key
 * @callback {boolean}
 */
Storage.prototype.has = function (key, callback) {
    this.client.getObjectAcl({
        Bucket: this.bucket,
        Key: key.toString()
    }, function (err) {
        if (err) return callback(null, false);
        callback(null, true);
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
        callback(null, obj);
    });
};

/**
 * Puts a new object in S3. WARNING: this will overwrite any existing files
 * with the same key.
 * @param {string} Object key
 * @param {object} JSON payload to be written to S3
 * @callback {void}
 */
Storage.prototype.set = function (key, body, callback) {
    this.client.putObject({
        Bucket: this.bucket,
        Key: key.toString(),
        Body: JSON.stringify(body)
    }, function (err) {
        if (err) return callback(err);
        callback(null);
    });
};

module.exports = new Storage();
