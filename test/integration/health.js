const test = require('tap').test;
const request = require('request');

test('200', function (t) {
    request({
        method: 'GET',
        uri: 'http://localhost:8444/health',
        json: {}
    }, function (err, res, body) {
        t.equal(err, null);
        t.type(res, 'object');
        t.type(res.statusCode, 200);
        t.type(body, 'object');
        t.end();
    });
});
