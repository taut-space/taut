const test = require('tap').test;
const log = require('../../lib/log');

test('spec', function (t) {
    t.type(log, 'object');
    t.type(log.info, 'function');
    t.type(log.error, 'function');
    t.type(log.fatal, 'function');
    t.type(log.middleware, 'function');
    t.end();
});

test('middleware', function (t) {
    const req = {};
    const res = {};
    log.middleware(req, res, function (err) {
        t.equal(err, undefined);
        t.end();
    });
});
