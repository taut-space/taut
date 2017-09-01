const test = require('tap').test;
const fs = require('fs');
const path = require('path');
const request = require('request');

const host = process.env.SMOKE_HOST || 'http://localhost:8444';

test('200', function (t) {
    request({
        method: 'POST',
        uri: host + '/?title=foobar',
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

test('200', function (t) {
    request({
        method: 'POST',
        uri: host + '/',
        json: require('../fixtures/default.json'),
        qs: {
            title: 'foobar',
            is_copy: 1,
            original_id: 1000014540
        },
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
        method: 'POST',
        uri: host + '/',
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

test('413', function (t) {
    request({
        method: 'POST',
        uri: host + '/?title=Untitled',
        json: require('../fixtures/large.json'),
        headers: {
            Cookie: require('../fixtures/users.json').valid
        }
    }, function (err, res, body) {
        t.equal(err, null);
        t.equal(res.statusCode, 413);
        t.type(res, 'object');
        t.type(body, 'object');
        t.end();
    });
});

test('500', function (t) {
    var file = path.resolve(__dirname, '../fixtures/corrupt.json');
    var json = fs.readFileSync(file).toString('utf8');

    request({
        method: 'POST',
        uri: host + '/?title=Untitled',
        json: json,
        headers: {
            Cookie: require('../fixtures/users.json').valid
        }
    }, function (err, res, body) {
        t.equal(err, null);
        t.equal(res.statusCode, 500);
        t.type(res, 'object');
        t.type(body, 'undefined');
        t.end();
    });
});
