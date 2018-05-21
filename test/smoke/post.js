const test = require('tap').test;
const fs = require('fs');
const request = require('request');

const host = process.env.SMOKE_HOST || 'http://localhost:8557';

// Send a good everything, get a 200 and json
test('200', function (t) {
    var image = fs.readFileSync('./test/fixtures/a.png');
    request({
        method: 'POST',
        uri: host + '/eed459aa6ca84d7403768731519d60d3.png',
        body: image,
        headers: {
            Cookie: require('../fixtures/users.json').valid
        }
    }, function (err, res, body) {
        t.equal(err, null);
        t.equal(res.statusCode, 200);
        t.type(res, 'object');
        t.type(body, 'string');
        var obj = JSON.parse(body);
        t.equal(obj.status, 'ok');
        t.equal(obj['content-name'], 'eed459aa6ca84d7403768731519d60d3.png');
        t.end();
    });
});

// Send a good everything and invalid credentials, get Forbidden
test('403', function (t) {
    var image = fs.readFileSync('./test/fixtures/a.png');
    request({
        method: 'POST',
        uri: host + '/eed459aa6ca84d7403768731519d60d3.png',
        body: image,
        headers: {
            Cookie: require('../fixtures/users.json').invalid
        }
    }, function (err, res) {
        t.equal(err, null);
        t.equal(res.statusCode, 403);
        t.end();
    });
});

// Send a good everything and no credentials, get Forbidden
test('403', function (t) {
    var image = fs.readFileSync('./test/fixtures/a.png');
    request({
        method: 'POST',
        uri: host + '/eed459aa6ca84d7403768731519d60d3.png',
        body: image
    }, function (err, res) {
        t.equal(err, null);
        t.equal(res.statusCode, 403);
        t.end();
    });
});

// Send a bad hashname, get BadRequest
test('400', function (t) {
    var image = fs.readFileSync('./test/fixtures/a.png');
    request({
        method: 'POST',
        uri: host + '/whoathisisshort.png',
        body: image,
        headers: {
            Cookie: require('../fixtures/users.json').valid
        }
    }, function (err, res) {
        t.equal(err, null);
        t.equal(res.statusCode, 400);
        t.end();
    });
});
