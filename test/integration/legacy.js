const test = require('tap').test;
const request = require('request');

test('200', function (t) {
    request({
        method: 'GET',
        uri: 'http://localhost:8444/internalapi/project/113799886/get/',
        json: {}
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
        method: 'GET',
        uri: 'http://localhost:8444/internalapi/project/113799886/get/foo',
        json: {}
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
        uri: 'http://localhost:8444/internalapi/project/113799886/set',
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
        uri: 'http://localhost:8444/internalapi/project/new/set/',
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
