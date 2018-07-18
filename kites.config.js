var path = require('path');

module.exports = {
    name: 'express',
    main: 'lib/main.js',
    options: {
        static: false,
        httpPort: 8000,
        poweredBy: 'Kites',
        views: {
            engine: 'ejs',
            locals: false,
            path: path.join(process.cwd(), 'views')
        }
    }
}