const fs = require('fs');
const request = require('request');
const test = require('tap').test;

const host = process.env.SMOKE_HOST || 'http://localhost:8557';

/**
 * Get the Scratch Cat via old API
 * @param  {[type]} t [description]
 * @return {[type]}   [description]
 */
test('200', function (t) {
    request({
        method: 'GET',
        uri: host +
            '/internalapi/assets/09dc888b0b7df19f70d81588ae73420e.svg/get/',
    }, function (err, res, body) {
        t.equal(err, null);
        t.equal(res.statusCode, 200);
        t.type(res, 'object');
        t.type(body, 'string');
        t.end();
    });
});

test('200', function (t) {
    var image = fs.readFileSync('./test/fixtures/a.png');
    request({
        method: 'POST',
        uri: host +
            '/internalapi/assets/eed459aa6ca84d7403768731519d60d3.png/set/',
        headers: {
            Cookie: require('../fixtures/users.json').valid
        },
        body: image
    }, function (err, res, body) {
        t.equal(err, null);
        t.equal(res.statusCode, 200);
        t.type(res, 'object');
        t.type(body, 'string');
        var info = JSON.parse(body);
        t.equal(info.status, 'ok');
        t.equal(info['content-name'], 'eed459aa6ca84d7403768731519d60d3.png');
        t.end();
    });
});
