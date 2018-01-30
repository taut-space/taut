if (typeof process.env.NEW_RELIC_LICENSE_KEY === 'string') {
    require('newrelic');
}

const restify = require('restify');
const restifyCors = require('restify-cors-middleware');
const cookies = require('restify-cookies');

const auth = require('./lib/auth');
const session = require('./lib/session');
const setup = require('./lib/setup');
const log = require('./lib/log');
const routes = require('./lib/routes');

// Create HTTP server and bind middleware
const server = restify.createServer();
server.use(log.middleware);
server.use(cookies.parse);
server.pre(restify.pre.sanitizePath());

// Max body size in megabytes
const MAX_BODY_SIZE = parseInt(process.env.MAX_BODY_SIZE || '10', 10);
server.use(restify.plugins.bodyParser({
    maxBodySize: MAX_BODY_SIZE * 1024 * 1024
}));
server.use(restify.plugins.queryParser({
    mapParams: true
}));

// CORS
var cors = restifyCors({
    preflightMaxAge: 5,
    origins: (process.env.CORS_ORIGINS || '*').split(','),
    allowHeaders: ['x-requested-with', 'x-token', 'accept-language'],
    exposeHeaders: []
});
server.pre(cors.preflight);
server.use(cors.actual);

// Throttle
const USE_THROTTLE = parseInt(process.env.USE_THROTTLE || '1', 10);
const THROTTLE_BURST = parseInt(process.env.THROTTLE_BURST || '200', 10);
const THROTTLE_RATE = parseInt(process.env.THROTTLE_RATE || '50', 10);
const THROTTLE_MAX_KEYS = parseInt(process.env.THROTTLE_MAX_KEYS || '10000',
    10);

if (USE_THROTTLE) {
    server.use(restify.plugins.throttle({
        burst: THROTTLE_BURST,
        rate: THROTTLE_RATE,
        xff: true,
        maxKeys: THROTTLE_MAX_KEYS
    }));
}

// Handle uncaught exceptions
server.on('restifyError', (req, res, err) => {
    if (!err.handled) log.error(err);
    res.send(500);
});

// Routes
server.get('/', routes.health);
server.get('/health', routes.health);
server.get('/crossdomain.xml', routes.crossdomain);

// 3.0 routes
server.get('/:hashname', routes.get);
server.post('/:hashname', auth, session, setup, routes.post);

// Legacy routes (@deprecated)
server.get('/internalapi/asset/:hashname/get', routes.get);
server.post('/internalapi/asset/:hashname/set', auth, session, setup, routes.post);

// Start listening for HTTP requests
const port = process.env.PORT || 8557;
server.listen(port, function () {
    log.info('Server listening on port ' + port);
});

