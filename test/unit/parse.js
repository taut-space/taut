var test = require('tap').test;
var parse = require('../../lib/parse');

test('spec', function (t) {
    t.type(parse, 'function');
    t.end();
});

test('undefined', function (t) {
    var req = {
        body: undefined
    };
    parse(req, {}, function (err) {
        t.type(err, 'object');
        t.equal(err.body.code, 'BadRequest');
        t.end();
    });
});

test('undefined', function (t) {
    var req = {
        body: 'foobar'
    };
    parse(req, {}, function (err) {
        t.type(err, 'object');
        t.equal(err.body.code, 'BadRequest');
        t.end();
    });
});

test('object', function (t) {
    var req = {
        body: {}
    };
    parse(req, {}, function (err) {
        t.type(err, 'undefined');
        t.end();
    });
});
