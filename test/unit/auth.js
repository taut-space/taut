const test = require('tap').test;
const auth = require('../../lib/auth');

test('spec', function (t) {
    t.type(auth, 'function');
    t.end();
});
