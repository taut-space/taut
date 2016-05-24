const test = require('tap').test;
const parse = require('../../lib/parse');

test('spec', function (t) {
    t.type(parse, 'function');
    t.end();
});

test('undefined', function (t) {
    const req = {
        body: undefined
    };
    parse(req, {}, function (err) {
        t.type(err, 'object');
        t.equal(err.body.code, 'BadRequest');
        t.end();
    });
});

test('undefined', function (t) {
    const req = {
        body: 'foobar'
    };
    parse(req, {}, function (err) {
        t.type(err, 'object');
        t.equal(err.body.code, 'BadRequest');
        t.end();
    });
});

test('object', function (t) {
    const req = {
        body: {}
    };
    parse(req, {}, function (err) {
        t.type(err, 'undefined');
        t.end();
    });
});
