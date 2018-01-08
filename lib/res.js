'use strict';
const _ = require('lodash');

module.exports = function (kites) {
    return function _mixinReq(req, res, next) {

        res.ok = function sendOk(data) {
            // set status code
            res.status(200);
            if (req.wantsJSON || data && _.isFunction(data.toJSON)) {
                return res.json(data)
            } else {
                return res.send(data)
            }

        }

        res.error = function sendError(err) {
            if (_.isString(err)) {
                err = {
                    message: err
                }
            }

            err = err || {};
            err.message = err.message || 'Unrecognized error';

            if (err.unauthorized) {
                res.setHeader('WWW-Authenticate', `${req.authSchema || 'Basic'} realm='realm'`);
                res.status(401).end();
                return;
            } else if (/^ENOTFOUND/i.test(err.message)) {
                res.status(404);
            } else if (/^EBADPARAM/i.test(err.message)) {
                res.status(400);
            } else if (_.isError(err) && err.status > 0) {
                res.status(err.status);
            } else {
                // log error info
                var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
                var logFn = err.weak ? kites.logger.warn : kites.logger.error;
    
                logFn('Error during processing request: ' + fullUrl + ' details: ' + err.message + ' ' + err.stack);
                res.status(500);
            }

            if (req.wantsJSON) {
                return res.json({
                    message: err.message,
                    stack: err.stack
                });
            } else {
                return res.send(`
                    Error occured - ${err.message}
                    Stack - ${err.stack}
                `);
            }
        }

        res.notFound = function sendErrorNotFound(err) {
            // set the status code
            res.status(404);
            // check send data as JSON
            if (req.wantsJSON) {
                // check detail error
                if (!err) {
                    return res.sendStatus(res.statusCode);
                }
                if (_.isError(err)) {
                    if (!_.isFunction(err.toJSON)) {
                        err = err.stack;
                        return res.send(err);
                    }
                }
                // send json error
                return res.json(err);
            } else {
                return res.send(err);
            }
        }

        res.badRequest = function sendErrorBadRequest(err) {
            // set the status code
            res.status(400);
            // check send data as JSON
            if (req.wantsJSON) {
                // check detail error
                if (!err) {
                    return res.sendStatus(res.statusCode);
                }
                if (_.isError(err)) {
                    if (!_.isFunction(err.toJSON)) {
                        err = err.stack;
                        return res.send(err);
                    }
                }
                // send json error
                return res.json(err);
            } else {
                return res.send(err);
            }
        }

        next();
    }
}