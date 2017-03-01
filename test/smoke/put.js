const test = require('tap').test;
const request = require('request');

const host = process.env.SMOKE_HOST || 'http://localhost:8444';

test('200', function (t) {
    request({
        method: 'PUT',
        uri: host + '/1000014540',
        json: require('../fixtures/default.json'),
        headers: {
            Cookie: require('../fixtures/users.json').valid
        }
    }, function (err, res, body) {
        t.equal(err, null);
        t.equal(res.statusCode, 200);
        t.type(res, 'object');
        t.type(body, 'object');
        t.end();
    });
});

test('403', function (t) {
    request({
        method: 'PUT',
        uri: host + '/1000013887',
        json: require('../fixtures/default.json'),
        headers: {
            Cookie: require('../fixtures/users.json').invalid
        }
    }, function (err, res, body) {
        t.equal(err, null);
        t.equal(res.statusCode, 403);
        t.type(res, 'object');
        t.type(body, 'object');
        t.end();
    });
});
