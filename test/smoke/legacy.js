const test = require('tap').test;
const request = require('request');

const host = process.env.SMOKE_HOST || 'http://localhost:8444';

test('200', function (t) {
    request({
        method: 'GET',
        uri: host + '/internalapi/project/1000013887/get/',
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
        uri: host + '/internalapi/project/1000013887/get/foo',
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
        uri: host + '/internalapi/project/1000013887/set',
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
        uri: host + '/internalapi/project/new/set/',
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
