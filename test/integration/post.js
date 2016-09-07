const test = require('tap').test;
const fs = require('fs');
const path = require('path');
const request = require('request');

test('200', function (t) {
    request({
        method: 'POST',
        uri: 'http://localhost:8444/?title=foobar',
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
        method: 'POST',
        uri: 'http://localhost:8444/',
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
        uri: 'http://localhost:8444/?title=Untitled',
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
        uri: 'http://localhost:8444/?title=Untitled',
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
