var test = require('tap').test;
var auth = require('../../lib/auth');

test('spec', function (t) {
    t.type(auth, 'function');
    t.end();
});
