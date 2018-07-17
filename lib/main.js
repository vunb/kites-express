/*!
 * Copyright(c) 2018 Nhu Bao Vu
 *
 * @kites/express handles http requests for kites.
 */
'use strict';

const fs = require('fs');
const path = require('path');
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
            if (kites.options.httpPort) {
                kites.logger.info('kites server successfully started on http port: ' + kites.options.httpPort)
            }

            if (!kites.options.httpPort && kites.express.server) {
                kites.logger.info('kites server successfully started on http port: ' + kites.express.server.address().port)
            }
        }

        if (this.config.app) {
            kites.logger.info('Configuring routes for existing express app.')
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

            this.configureExpressApp(app, kites, definition);
            this.startExpressApp(app, kites, definition.options).then(logStart);
        }
    }

    configureExpressApp(app, kites, definition) {
        kites.express.app = app;

        app.options('*', cors({
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'MERGE'],
            origin: true
        }));

        // config static file
        if (typeof definition.options.static === 'string') {
            kites.logger.debug('Express serve static files at', definition.options.static)
            app.use(require('express').static(definition.options.static))
        }

        // config express
        app.set('view engine', definition.options.views.engine);
        app.set('views', definition.options.views.path)

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

        kites.logger.debug('Express configuration has done!');
    }

    startExpressApp(app, kites, options) {
       // create http server.
        kites.express.server = http.createServer(app);
        kites.logger.debug('Express is going to listen on ' + options.httpPort);
        return this.startHttpServerAsync(kites, kites.express.server, options.httpPort);
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