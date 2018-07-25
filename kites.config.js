var path = require('path');

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
module.exports = {
    name: 'express',
    main: 'lib/main.js',
    options: {
        static: false,
        httpPort: 8000,
        poweredBy: 'Kites',
        views: {
            ext: 'ejs',
            engine: 'ejs',
            renderer: 'renderFile',
            locals: false,
            path: path.join(process.cwd(), 'views')
        }
    }
}