const test = require('tap').test;
const storage = require('../../lib/storage');

test('spec', function (t) {
    t.type(storage, 'object');
    t.type(storage.has, 'function');
    t.type(storage.metadata, 'function');
    t.type(storage.get, 'function');
    t.type(storage.set, 'function');
    t.type(storage.health, 'function');
    t.end();
});

test('has', function (t) {
    storage.has(1, function (err, res) {
        t.equal(err, null);
        t.equal(res, true);
        t.end();
    });
});

test('metadata', function (t) {
    storage.metadata(1, function (err, res) {
        t.equal(err, null);
        t.type(res, 'object');
        t.end();
    });
});

test('get', function (t) {
    storage.get(1, function (err, res) {
        t.equal(err, null);
        t.type(res, 'object');
        t.end();
    });
});

test('set', function (t) {
    var example = require('../fixtures/default');
    storage.set(
        1,
        example,
        {
            username: 'uploadtest'
        },
        function (err) {
            t.equal(err, null);
            t.end();
        }
    );
});

test('health', function (t) {
    var result = storage.health();
    t.type(result, 'object');
    t.equal(result.ssl, true);
    t.equal(result.region, 'us-east-1');
    t.type(result.retries, 'number');
    t.end();
});
