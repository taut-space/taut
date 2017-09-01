const test = require('tap').test;
const request = require('request');

const host = process.env.SMOKE_HOST || 'http://localhost:8444';

test('200', function (t) {
    request({
        method: 'GET',
        uri: host + '/health',
        json: {}
    }, function (err, res, body) {
        t.equal(err, null);
        t.type(res, 'object');
        t.type(res.statusCode, 200);
        t.type(body, 'object');
        t.end();
    });
});
