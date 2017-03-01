const test = require('tap').test;
const request = require('request');

const host = process.env.SMOKE_HOST || 'http://localhost:8444';

test('200', function (t) {
    request({
        method: 'GET',
        uri: host + '/1',
        json: {}
    }, function (err, res, body) {
        t.equal(err, null);
        t.type(res, 'object');
        t.type(res.statusCode, 200);
        t.type(body, 'object');
        t.end();
    });
});

test('200', function (t) {
    request({
        method: 'GET',
        uri: host + '/1000013887',
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
        uri: host + '/foobar',
        json: {}
    }, function (err, res, body) {
        t.equal(err, null);
        t.type(res, 'object');
        t.type(res.statusCode, 404);
        t.type(body, 'object');
        t.end();
    });
});
