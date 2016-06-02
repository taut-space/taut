if (typeof process.env.NEW_RELIC_LICENSE_KEY === 'string') {
    require('newrelic');
}

const restify = require('restify');

const auth = require('./lib/auth');
const log = require('./lib/log');
const parse = require('./lib/parse');
const routes = require('./lib/routes');

// Create HTTP server and bind middleware
const server = restify.createServer();
server.use(log.middleware);
server.use(restify.bodyParser({
    maxBodySize: 2.5 * 1024 * 1024
}));
server.use(restify.queryParser());
server.use(restify.CORS());
server.use(restify.throttle({
    burst: 25,
    rate: 10,
    xff: true,
    maxKeys: 5000
}));

// Routes
server.get('/health', routes.health);
server.post('/', auth, parse, routes.post);
server.put('/:id', auth, parse, routes.put);
server.get('/:id', routes.get);

// Legacy routes (@deprecated)
server.post('/internalapi/project/new/set', auth, parse, routes.post);
server.post('/internalapi/project/:id/set', auth, parse, routes.put);

// Start listening for HTTP requests
const port = process.env.PORT || 8444;
server.listen(port, function () {
    log.info('Server listening on port ' + port);
});
