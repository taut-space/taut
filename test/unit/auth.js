const test = require('tap').test;
const auth = require('../../lib/auth');

test('spec', function (t) {
    t.type(auth, 'function');
    t.end();
});

test('valid', function (t) {
    const req = {
        headers: {
            cookie: 'foobar'
        },
        cookies: {
            tautsessionsid: 'foo',
            tautcsrftoken: 'bar'
        }
    };
    auth(req, {}, function (err) {
        t.type(err, 'undefined');
        t.end();
    });
});

test('missing cookie header', function (t) {
    const req = {
        cookies: {
            tautsessionsid: 'foo',
            tautcsrftoken: 'bar'
        }
    };
    auth(req, {}, function (err) {
        t.type(err, 'object');
        t.end();
    });
});

test('missing session', function (t) {
    const req = {
        headers: {
            cookie: 'foobar'
        },
        cookies: {
            tautcsrftoken: 'bar'
        }
    };
    auth(req, {}, function (err) {
        t.type(err, 'object');
        t.end();
    });
});

test('missing csrf', function (t) {
    const req = {
        headers: {
            cookie: 'foobar'
        },
        cookies: {
            tautsessionsid: 'foo'
        }
    };
    auth(req, {}, function (err) {
        t.type(err, 'object');
        t.end();
    });
});
