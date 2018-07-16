var path = require('path');

module.exports = {
    name: 'express',
    main: 'lib/main.js',
    options: {
        static: false,
        httpPort: 8000,
        views: {
            engine: 'ejs',
            path: path.join(process.cwd(), 'views')
        }
    }
}