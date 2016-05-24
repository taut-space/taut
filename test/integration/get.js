var test = require('tap').test;
var request = require('request');

test('200', function (t) {
    request({
        method: 'GET',
        uri: 'http://localhost:8444/1',
        json: {}
    }, function (err, res, body) {
        t.equal(err, null);
        t.type(res, 'object');
        t.type(res.statusCode, 200);
        t.type(body, 'object');
        t.end();
    });
});

test('404', function (t) {
    request({
        method: 'GET',
        uri: 'http://localhost:8444/foobar',
        json: {}
    }, function (err, res, body) {
        t.equal(err, null);
        t.type(res, 'object');
        t.type(res.statusCode, 404);
        t.type(body, 'object');
        t.end();
    });
});
