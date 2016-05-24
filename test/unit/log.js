var test = require('tap').test;
var log = require('../../lib/log');

test('spec', function (t) {
    t.type(log, 'object');
    t.type(log.info, 'function');
    t.type(log.error, 'function');
    t.type(log.fatal, 'function');
    t.type(log.middleware, 'function');
    t.end();
});

test('middleware', function (t) {
    var req = {};
    var res = {};
    log.middleware(req, res, function (err) {
        t.equal(err, undefined);
        t.end();
    });
});
