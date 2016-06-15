var test = require('tap').test;
var signer = require('../../lib/signer');

test('spec', function (t) {
    t.type(signer, 'object');
    t.type(signer.b64UrlSafeEncode, 'function');
    t.type(signer.getSaltedHmacKey, 'function');
    t.type(signer.getSaltedHmac, 'function');
    t.type(signer.base64Hmac, 'function');
    t.type(signer.md5, 'function');
    t.type(signer.unsign, 'function');
    t.end();
});

test('unsign', function (t) {
    const result = signer.unsign(
        'test',
        'value:zyBNJHpGyml3X-RhCx0mbjLFzPs',
        'secret'
    );
    t.ok(result === 'value', 'Unsigns the value');
    t.end();
});

test('malformed signature', function (t) {
    const result = signer.unsign(
        'test',
        'value',
        'secret'
    );
    t.ok(typeof result === 'undefined');
    t.end();
});

test('bad signature', function (t) {
    const result = signer.unsign(
        'test',
        'value:ImA1337Hax0r',
        'secret'
    );
    t.ok(typeof result === 'undefined');
    t.end();
});
