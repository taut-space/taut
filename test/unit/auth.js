const test = require('tap').test;
const auth = require('../../lib/auth');
const users = require('../fixtures/users.json');

test('spec', function (t) {
    t.type(auth, 'function');
    t.end();
});

test('valid cookie', function (t) {
    const req = {
        cookies: {
            scratchsessionsid: users.valid_session
        }
    };
    auth(req, {}, function (err) {
        t.type(err, 'undefined');
        t.end();
    });
});

test('invalid cookie', function (t) {
    const req = {
        cookies: {
            scratchsessionsid: users.invalid_session
        }
    };
    auth(req, {}, function (err) {
        t.type(err, 'object');
        t.end();
    });
});

test('no cookie', function (t) {
    const req = {
        cookies: {}
    };
    auth(req, {}, function (err) {
        t.type(err, 'object');
        t.end();
    });
});
