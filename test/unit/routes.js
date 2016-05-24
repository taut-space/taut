const test = require('tap').test;
const routes = require('../../lib/routes');

test('spec', function (t) {
    t.type(routes, 'object');
    t.type(routes.post, 'function');
    t.type(routes.put, 'function');
    t.type(routes.get, 'function');
    t.end();
});
