const test = require('tap').test;
const backend = require('../../lib/backend');

test('spec', function (t) {
    t.type(backend, 'function');
    t.end();
});

test('200', function (t) {
    backend({
        method: 'GET',
        uri: '/'
    }, function (err, res, body) {
        t.equal(err, null);
        t.type(res, 'object');
        t.equal(res.statusCode, 200);
        t.type(body, 'string');
        t.end();
    });
});

test('404', function (t) {
    backend({
        method: 'GET',
        uri: '/foo/bar/baz'
    }, function (err, res, body) {
        t.equal(err, null);
        t.type(res, 'object');
        t.equal(res.statusCode, 404);
        t.type(body, 'string');
        t.end();
    });
});
