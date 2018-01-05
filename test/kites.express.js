'use strict';
var os = require('os');
var test = require('tape');
var request = require('supertest');
var engine = require('@kites/engine');
var kitesExpress = require('../index');

test('kites express', function (t) {
    let config = {
        logger: {
            console: {
                transport: 'console',
                level: 'debug'
            }
        },
        rootDirectory: __dirname,
        tempDirectory: os.tmpdir(),
        // extensionsLocationCache: false
    }

    t.plan(1);

    var kites = engine(config).use(kitesExpress());
    kites.init().then(() => {
        console.log('app: ', kites.express.app);
        request.agent(kites.express.app)
            .get('/api/kites')
            // .set('Accept', 'application/json')
            // .buffer(true)
            .expect(200)
            .then((res) => {
                t.equal(res.body, '0.1.0')
            })
    })
})