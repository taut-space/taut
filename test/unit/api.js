const test = require('tap').test;
const api = require('../../lib/api');

test('spec', function (t) {
    t.type(api, 'function');
    t.end();
});

test('valid', function (t) {
    api({
        method: 'GET',
        uri: '/'
    }, function (err, body) {
        t.equal(err, null);
        t.type(body, 'object');
        t.end();
    });
});

test('invalid', function (t) {
    api({
        method: 'GET',
        uri: '/foo/bar/baz'
    }, function (err, body) {
        t.type(err, 'object');
        t.type(body, 'undefined');
        t.end();
    });
});
