const test = require('tap').test;
const request = require('request');

const host = process.env.SMOKE_HOST || 'http://localhost:8557';

// Get the Scratch Cat via new API
test('200', function (t) {
    request({
        method: 'GET',
        uri: host + '/09dc888b0b7df19f70d81588ae73420e.svg',
        json: {}
    }, function (err, res, body) {
        t.equal(err, null);
        t.equal(res.statusCode, 200);
        t.type(res, 'object');
        t.type(body, 'string');
        t.end();
    });
});

// Get the crossdomain.xml via new API
test('200', function (t) {
    request({
        method: 'GET',
        uri: host + '/crossdomain.xml',
        json: {}
    }, function (err, res, body) {
        t.equal(err, null);
        t.equal(res.statusCode, 200);
        t.type(res, 'object');
        t.type(body, 'string');
        t.end();
    });
});

// Defaults to health info
test('200', function (t) {
    request({
        method: 'GET',
        uri: host + '/',
        json: {}
    }, function (err, res, body) {
        t.equal(err, null);
        t.equal(res.statusCode, 200);
        t.type(res, 'object');
        t.type(body, 'object');
        t.end();
    });
});

// The impossible asset
// You get Nothing! You lose! Good day sir!
test('404', function (t) {
    request({
        method: 'GET',
        uri: host + '/0x0x0x0x0x0x0',
        json: {}
    }, function (err, res, body) {
        t.equal(err, null);
        t.type(res, 'object');
        t.type(res.statusCode, 404);
        t.type(body, 'string');
        t.end();
    });
});
