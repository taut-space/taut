const uuidv4 = require('uuid/v4');

/**
 * [description]
 * @param  {object}   req  HTTP Request
 * @param  {object}   res  HTTP Response
 * @param  {Function} next Middleware next function
 */
function uuid (req, res, next) {
    req.uuid = uuidv4();
    res.uuid = req.uuid;
    next();
}

module.exports.middleware = uuid;
