const errors = require('restify-errors');

const storage = require('./storage');

const routes = module.exports = {};

routes.post = function (req, res) {
    // @todo Create project id / push to API
    // @todo Push to S3
    // @todo Respond
    res.json();
    res.end();
};

routes.put = function (req, res) {
    // @todo Check if exists
    // @todo Push to S3
    // @todo Respond
    res.json();
    res.end();
};

routes.get = function (req, res) {
    storage.get(req.params.id, function (err, obj) {
        if (err) res.send(new errors.NotFoundError);
        res.json(obj);
        res.end();
    });
};
