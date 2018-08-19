/*!
 * Copyright(c) 2018 Nhu Bao Vu
 *
 * @kites/express handles http requests for kites.
 */
'use strict';

const _ = require('lodash');
const http = require('http');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const routes = require('./routes');
const mixinReq = require('./req');
const mixinRes = require('./res');
const mixinResView = require('./res.view');

class KitesExpress {
    constructor(kites, definition) {
        this.kites = kites;
        this.definition = definition;
        this.config = definition.options;
    }

    init() {
        var kites = this.kites;
        var definition = this.definition;
        var app = this.config.app;

        function logStart() {
            if (kites.express.server) {
                kites.logger.info('kites server successfully started on http port: ' + kites.express.server.address().port)
            } else {
                kites.logger.warn('kites server successfully started, but can not found server, express port config: ' + this.options.httpPort);
            }
        }

        if (this.config.app) {
            kites.logger.info('Configuring routes for existing express app.')
            this.configureViewEngine(app, definition.options.views);
            this.configureExpressApp(app, kites, definition)

            if (this.config.server) {
                kites.logger.info('Using existing server instance.')
                kites.express.server = definition.options.server
                // deleting server option otherwise requests to list available extensions
                delete definition.options.server
            }

        } else {
            var app = require('express')();
            kites.logger.info('Creating default express app.');

            // initializing views
            this.configureViewEngine(app, definition.options.views);
            this.configureExpressApp(app, kites, definition);
            this.startExpressApp(app, kites, definition.options).then(logStart);
        }
    }

    configureViewEngine(app, opts) {
        var configView = this.kites.emit('expressConfigure:view', app, opts);
        if (configView) {
            this.kites.logger.debug('Configure express view engine from kites extension!');
            return;
        }

        // checking if engine is not specified
        if (!opts || !opts.engine) {
            this.kites.logger.debug('No view engine configuration is sepecified: -> Disabled.');
            return;
        }

        var module, args, engine;
        var module = require(opts.engine);
        if (_.isObject(opts.renderer) && _.isFunction(module[opts.renderer.method])) {
            args = _.isArray(opts.renderer.arguments) ? opts.renderer.arguments.slice() : [];
            engine = module[opts.renderer.method].apply(null, args);

        } else if (_.isString(opts.renderer) && _.isFunction(module[opts.renderer])) {
            engine = module[opts.renderer];

            // } else if (_.isFunction(module[opts.name])) {
            //     engine = module[opts.name];

        } else if (_.isFunction(module[opts.ext])) {
            engine = module[opts.ext];

        } else if (!_.isUndefined(opts.arguments)) {
            args = _.isArray(opts.arguments) ? opts.arguments.slice() : [];
            engine = module.apply(null, args);

        } else {
            engine = module;
        }

        try {
            // if `ext` is not sepecified.
            var ext = opts.ext || opts.engine;
            var viewPath = opts.path || this.kites.defaultPath('views');
            // apply engine
            this.kites.logger.debug(`Configure view engine:
            + ext: ${opts.ext}
            + engine: ${opts.engine}
            + renderer: ${opts.renderer}
            + path: ${viewPath}
            `);

            // make sure engine is a function
            if (typeof engine === 'function') {
                app.engine(ext, engine);
            }

            // config views engine and path.
            app.set('view engine', ext);
            app.set('views', viewPath)
        } catch (err) {
            this.kites.logger.error('Configure view engine error: ', err);
        }
    }

    configureExpressApp(app, kites, definition) {
        kites.express.app = app;

        app.options('*', cors({
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'MERGE'],
            origin: true
        }));

        // show powered by
        if (!definition.options.poweredBy) {
            app.disable('x-powered-by');
        } else {
            app.use(function poweredBy(req, res, next) {
                res.setHeader('X-Powered-By', definition.options.poweredBy)
                next()
            });
        }

        app.use(bodyParser.urlencoded({
            extended: false,
            limit: definition.options.inputRequestLimit || '10mb'
        }));
        app.use(bodyParser.json({
            limit: definition.options.inputRequestLimit || '10mb'
        }));
        app.use(cookieParser());
        app.use(cors());

        app.use(mixinReq(kites));
        app.use(mixinRes(kites));
        app.use(mixinResView(kites));

        kites.emit('beforeExpressConfigure', app);
        routes(app, kites);

        kites.logger.debug('Express starting configure ...');
        kites.emit('expressConfigure', app);

        // config static file
        if (typeof definition.options.static === 'string') {
            kites.logger.debug('Express serve static files at', definition.options.static);
            app.use(require('express').static(definition.options.static));
        }

        kites.logger.debug('Express configuration has done!');
    }

    startExpressApp(app, kites, options) {
        var httpPort = process.env.PORT || options.httpPort;
        // create http server.
        kites.express.server = http.createServer(app);
        kites.logger.debug('Express is going to listen on ' + httpPort);
        return this.startHttpServerAsync(kites, kites.express.server, httpPort);
    }

    startHttpServerAsync(kites, server, port) {
        return new Promise((resolve, reject) => {
            server.on('error', (err) => {
                kites.logger.error(`Error when starting http server on port ${port} ${err.stack}`)
                reject(err)
            }).on('listen', () => {
                resolve()
            });

            server.listen(port, kites.options.hostname, resolve);
        })
    }
}

module.exports = function (kites, definition) {
    kites.options.appPath = kites.options.appPath || '/';

    if (kites.options.appPath.substr(-1) !== '/') {
        kites.options.appPath += '/';
    }

    kites.options.express = definition.options;
    kites.options.httpPort = definition.options.httpPort || kites.options.httpPort;
    kites.express = definition;

    var kitesExpress = new KitesExpress(kites, definition);
    kites.initializeListeners.add(definition.name, kitesExpress.init.bind(kitesExpress));
}