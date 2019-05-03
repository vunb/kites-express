import { KitesExtension } from '@kites/engine';
import { join } from 'path';

/**
 * Kites express configuration
 *
 * eg: config views engine template (full options)
 *
 * "views": {
 *      "name": "adaro",
 *      "module": "adaro",
 *      "ext": "adaro",
 *      "renderer": {
 *          "method": "dust",
 *          "arguments": [{
 *              "cache": false,
 *              "helpers": ["dust-helpers-whatevermodule"]
 *          }]
 *      }
 *  },
 */

const config: KitesExtension = {
  main: 'src/main.js',
  name: 'express',
  options: {
    httpPort: 3000,
    poweredBy: 'Kites',
    static: false,
    views: {
      engine: 'ejs',
      ext: 'ejs',
      locals: false,
      path: 'views',
      renderer: 'renderFile',
    }
  }
};

export = config;
