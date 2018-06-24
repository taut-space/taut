const request = require('request');

const BACKEND_HOST = process.env.BACKEND_HOST || 'https://scratch.ly';
const FASTLY_EDGE_HEADER = process.env.FASTLY_EDGE_HEADER || '';
const SCRATCH_EDGE_HEADER = process.env.SCRATCH_EDGE_HEADER || '';

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
    // Push these into secure env settings: 'knock-knock'
    opts.headers['x-fastly-only-into-edge'] = FASTLY_EDGE_HEADER;
    // Push into secure env settings: 'in-out-pick-one-cat'
    opts.headers['x-scratch-api-only-into-edge'] = SCRATCH_EDGE_HEADER;

    // Make HTTP request
    request(opts, callback);
};
