if (typeof process.env.NEW_RELIC_LICENSE_KEY === 'string') {
    require('newrelic');
}

const restify = require('restify');
const cookies = require('restify-cookies');

const auth = require('./lib/auth');
const create = require('./lib/create');
const log = require('./lib/log');
const parse = require('./lib/parse');
const routes = require('./lib/routes');
const update = require('./lib/update');

const USE_THROTTLE = parseInt(process.env.USE_THROTTLE || '1');
const THROTTLE_BURST = parseInt(process.env.THROTTLE_BURST || '25');
const THROTTLE_RATE = parseInt(process.env.THROTTLE_RATE || '10');
const THROTTLE_MAX_KEYS = parseInt(process.env.THROTTLE_MAX_KEYS || '5000');

// Create HTTP server and bind middleware
const server = restify.createServer();
server.use(log.middleware);
server.use(cookies.parse);
server.pre(restify.pre.sanitizePath());
server.use(restify.bodyParser({
    maxBodySize: 2.5 * 1000 * 1000
}));
server.use(restify.queryParser());
server.use(restify.CORS());

if (USE_THROTTLE) {
    server.use(restify.throttle({
        burst: THROTTLE_BURST,
        rate: THROTTLE_RATE,
        xff: true,
        maxKeys: THROTTLE_MAX_KEYS
    }));
}

// Handle uncaught exceptions
server.on('uncaughtException', (req, res, route, err) => {
    log.error(err);
    res.send(500);
});

// Routes
server.get('/', routes.health);
server.get('/health', routes.health);
server.get('/crossdomain.xml', routes.crossdomain);

// 3.0 routes
server.get('/:id', routes.get);
server.get('/:id/:hash', routes.get);
server.post('/', auth, parse, create, routes.post);
server.put('/:id', auth, parse, update, routes.put);

// Legacy routes (@deprecated)
server.get('/internalapi/project/:id/get', routes.get);
server.get('/internalapi/project/:id/get/:hash', routes.get);
server.post('/internalapi/project/new/set', auth, parse, create, routes.post);
server.post('/internalapi/project/:id/set', auth, parse, update, routes.put);

// Start listening for HTTP requests
const port = process.env.PORT || 8444;
server.listen(port, function () {
    log.info('Server listening on port ' + port);
});
