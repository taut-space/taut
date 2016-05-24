const test = require('tap').test;
const storage = require('../../lib/storage');

test('spec', function (t) {
    t.type(storage, 'object');
    t.type(storage.has, 'function');
    t.type(storage.get, 'function');
    t.type(storage.set, 'function');
    t.end();
});

test('has', function (t) {
    storage.has(1, function (err, res) {
        t.equal(err, null);
        t.equal(res, true);
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
    storage.set(1, example, function (err) {
        t.equal(err, null);
        t.end();
    });
});
