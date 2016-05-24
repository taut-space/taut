const restify = require('restify');

const auth = require('./lib/auth');
const log = require('./lib/log');
const parse = require('./lib/parse');
const routes = require('./lib/routes');

// Create HTTP server and bind middleware
var server = restify.createServer();
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
// @todo Add legacy routes for older versions of the editor
server.post('/', auth, parse, routes.post);
server.put('/:id', auth, parse, routes.put);
server.get('/:id', routes.get);

// Start listening for HTTP requests
var port = process.env.PORT || 8444;
server.listen(port, function () {
    log.info('Server listening on port ' + port);
});
