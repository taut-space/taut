const request = require('request');

/**
 * Makes an HTTP request to the Scratch API. Thin wrapper on top of the
 * `request` module: https://github.com/request/request
 * @param {object} Request options (see documentation for Request module)
 * @callback {object}
 */
module.exports = function (opts, callback) {
    // Apply defaults
    opts.host = process.env.API_HOST || 'https://api-staging.scratch.mit.edu';
    opts.uri = opts.host + opts.uri;
    opts.json = {};

    // Make HTTP request
    request(opts, function (err, res, body) {
        if (err) return callback(err);
        if (res.statusCode !== 200) return callback(body);
        callback(null, body);
    });
};
