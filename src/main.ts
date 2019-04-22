/*!
 * Copyright(c) 2018 Nhu Bao Vu
 *
 * @kites/express handles http requests for kites.
 */

import { KitesExtention, KitesInstance } from '@kites/engine';
import * as _ from 'lodash';
import config from '../kites.config';
import { IKitesExpressOptions, KitesExpress } from './express';

export function createExpress(kites: KitesInstance, definition: KitesExtention) {
    kites.options.appPath = kites.options.appPath || '/';

    if (kites.options.appPath.substr(-1) !== '/') {
        kites.options.appPath += '/';
    }

    kites.options.express = definition.options || {};
    kites.options.httpPort = kites.options.express.httpPort || kites.options.httpPort;
    kites.express = definition;

    var kitesExpress = new KitesExpress(kites, definition);
    kites.initializeListeners.add(definition.name, kitesExpress.init.bind(kitesExpress));
}

export default function express(options?: IKitesExpressOptions) {
    // extend user options
    _.merge(config.options, options);
    config.directory = __dirname;
    config.main = createExpress;
    return config;
}
