const request = require('request');

/**
 * Makes an HTTP request to the backend API. Thin wrapper on top of
 * the `request` module: https://github.com/request/request
 * @param {object} Request options (see documentation for Request module)
 * @callback {object}
 */
module.exports = function (opts, callback) {
    // Apply defaults
    opts.host = BACKEND_HOST;
    opts.uri = opts.host + opts.uri;

    // Apply headers
    opts.headers = opts.headers || {};

    // Make HTTP request
    request(opts, callback);
};
