const request = require('request');

/**
 * Makes an HTTP request to the backend API. Thin wrapper on top of
 * the `request` module: https://github.com/request/request
 * @param {object} Request options (see documentation for Request module)
 * @callback {object}
 */
module.exports = function (opts, callback) {
    // Apply defaults
    opts.host = process.env.BACKEND_HOST || 'https://scratch.ly';
    opts.uri = opts.host + opts.uri;

    // Apply headers
    opts.headers = opts.headers || {};
    opts.headers['x-fastly-only-into-edge'] = 'knock-knock';
    opts.headers['x-scratch-api-only-into-edge'] = 'in-out-pick-one-cat';

    // Make HTTP request
    request(opts, callback);
};
