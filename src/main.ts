/*!
 * Copyright(c) 2018 Nhu Bao Vu
 *
 * @kites/express handles http requests for kites.
 */

import {ExtensionOptions, KitesExtension, KitesInstance} from '@kites/engine';

/// <reference types="express"/>
import * as e from 'express';
import * as _ from 'lodash';
import config from '../kites.config';
import {KitesExpress} from './express';

// Add RequestValidation Interface on to Express's Request Interface.
declare global {
  namespace Express {
    interface Request extends KitesExpressExtension.ApiRequest {}
    interface Response extends KitesExpressExtension.ApiResponse {}
  }
}

// Internal Module.
declare namespace KitesExpressExtension {

  type ApiOkResponse = (data?: any) => e.Response;
  type ApiErrorResponse = (err: Error | string | any) => e.Response;

  export interface ApiRequest {
    kites: KitesInstance;
    wantsJSON: boolean;
    isSocket: boolean;
    explicitlyAcceptsHTML: boolean;
    options?: any;
    authSchema?: string;
    _errorInResView?: any;

    param(name: string, defaultValue?: string): string;
  }

  export interface ApiResponse {
    ok: ApiOkResponse;
    view: ApiOkResponse;
    error: ApiErrorResponse;
    serverError: ApiErrorResponse;
    notFound: ApiErrorResponse;
    badRequest: ApiErrorResponse;
    forbidden: ApiErrorResponse;
  }
}

export function createExpress(kites: KitesInstance, definition: KitesExtension) {
  kites.options.appPath = kites.options.appPath || '/';

  if (kites.options.appPath.substr(-1) !== '/') {
    kites.options.appPath += '/';
  }

  kites.options.express = definition.options || {};
  kites.options.httpPort =
      kites.options.express.httpPort || kites.options.httpPort;
  kites.express = definition;

  var kitesExpress = new KitesExpress(kites, kites.options.express);
  kites.initializeListeners.add(definition.name, kitesExpress.init.bind(kitesExpress));
}

export default function express(options?: ExtensionOptions) {
  // extend user options
  _.merge(config.options, options);
  config.directory = __dirname;
  config.main = createExpress;
  return config;
}
