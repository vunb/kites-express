import { KitesExtention, KitesInstance } from '@kites/engine';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Express } from 'express';
import http from 'http';
import * as _ from 'lodash';
import { mixinReq } from './req';
import { mixinRes } from './res';
import { mixinResView } from './res.view';
import { routes } from './routes';

export interface IKitesExpressOptions {
    [key: string]: any;
    app?: Express;
    engine?: any;
    views?: string;
    httpPort: string | number;
    server?: any;
}

/**
 * Kites Express Extension
 */
export class KitesExpress implements KitesExtention {

    name: string;
    config: IKitesExpressOptions;

    constructor(
        private kites: KitesInstance,
        private definition: KitesExtention
    ) {
        const opts = definition.options || {};
        this.config = Object.assign({
            httpPort: 3000
        }, opts);
    }

    logStart() {
        if (this.kites.express.server) {
            const port = this.kites.express.server.address().port;
            this.kites.logger.info('kites server successfully started on http port: ' + port);
        } else {
            this.kites.logger.warn('kites server successfully started, but can not found server, express port config: ' + this.config.httpPort);
        }
    }

    init() {
        const kites = this.kites;
        const definition = this.definition;
        let app = this.config.app;

        if (app) {
            kites.logger.info('Configuring routes for existing express app.');
            this.configureViewEngine(app, this.config.views);
            this.configureExpressApp(app, kites, definition);

            if (this.config.server) {
                kites.logger.info('Using existing server instance.');
                kites.express.server = this.config.server;
                // deleting server option otherwise requests to list available extensions
                if (this.definition.options != null) {
                    delete this.definition.options.server;
                }
            }

        } else {
            app = express();
            kites.logger.info('Creating default express app.');

            // initializing views
            this.configureViewEngine(app, this.config.views);
            this.configureExpressApp(app, kites, definition);
            this.startExpressApp(app, kites, this.config).then(() => {
                this.logStart();
            });
        }
    }

    configureViewEngine(app: Express, opts: any) {
        var configView = this.kites.emit('express:config:view', app, opts);
        if (configView) {
            this.kites.logger.debug('Configure express view engine from kites extension!');
            return;
        }

        // checking if engine is not specified
        if (!opts || !opts.engine) {
            this.kites.logger.debug('No view engine configuration is sepecified: -> Disabled.');
            return;
        }

        var module;
        var args;
        var engine;

        var module = require(opts.engine);
        if (_.isObject(opts.renderer) && _.isFunction(module[opts.renderer.method])) {
            args = _.isArray(opts.renderer.arguments) ? opts.renderer.arguments.slice() : [];
            engine = module[opts.renderer.method].apply(null, args);

        } else if (_.isString(opts.renderer) && _.isFunction(module[opts.renderer])) {
            engine = module[opts.renderer];

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
            app.set('views', viewPath);
        } catch (err) {
            this.kites.logger.error('Configure view engine error: ', err);
        }
    }

    configureExpressApp(app: Express, kites: KitesInstance, definition: KitesExtention) {
        kites.express.app = app;

        app.options('*', cors({
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'MERGE'],
            origin: true
        }));

        // show powered by
        if (!this.config.poweredBy) {
            app.disable('x-powered-by');
        } else {
            app.use((req, res, next) => {
                res.setHeader('X-Powered-By', this.config.poweredBy);
                next();
            });
        }

        app.use(bodyParser.urlencoded({
            extended: false,
            limit: this.config.inputRequestLimit || '10mb'
        }));
        app.use(bodyParser.json({
            limit: this.config.inputRequestLimit || '10mb'
        }));
        app.use(cookieParser());
        app.use(cors());

        app.use(mixinReq(kites));
        app.use(mixinRes(kites));
        app.use(mixinResView(kites));

        kites.emit('before:express:config', app);
        routes(app, kites);

        kites.logger.debug('Express starting configure ...');
        kites.emit('expressConfigure', app);

        // config static file
        if (typeof this.config.static === 'string') {
            kites.logger.debug('Express serve static files at', this.config.static);
            app.use(require('express').static(this.config.static));
        }

        kites.logger.debug('Express configuration has done!');
    }

    startExpressApp(app: Express, kites: KitesInstance, options: IKitesExpressOptions) {
        var httpPort = process.env.PORT || options.httpPort;
        // create http server.
        kites.express.server = http.createServer(app);
        kites.logger.debug('Express is going to listen on ' + httpPort);
        return this.startHttpServerAsync(kites, kites.express.server, httpPort);
    }

    startHttpServerAsync(kites: KitesInstance, server: http.Server, port: number|string) {
        return new Promise((resolve, reject) => {
            server.on('error', (err) => {
                kites.logger.error(`Error when starting http server on port ${port} ${err.stack}`);
                reject(err);
            }).on('listen', () => {
                resolve();
            });

            server.listen(port, kites.options.hostname, resolve);
        });
    }
}
