'use strict';
var os = require('os');
var path = require('path');
var test = require('tape');
var request = require('supertest');
var engine = require('@kites/engine');
var kitesExpress = require('../../index');

test('kites views engine', (t) => {

    // kites express config.
    let config = {
        logger: {
            console: {
                transport: 'console',
                level: 'debug'
            }
        },
        rootDirectory: __dirname,
        tempDirectory: os.tmpdir(),
        extensionsLocationCache: false,
        discover: false
    }

    t.test('access kites from request', (t) => {
        t.plan(1);
        var kites = engine(config);

        kites
            .use(kitesExpress({
                views: {
                    path: path.join(__dirname, '../views')
                }
            }))
            .init()
            .then(() => {
                // config express
                var app = kites.express.app;
    
                app.get('/knock', (req, res) => {
                    req.kites.logger.info('Access kites from Request!');

                    return res.ok({
                        greeting: 'Hello World!'
                    });
                });
    
                request(app)
                    .get('/knock')
                    .expect('Content-Type', /json/)
                    .expect(200)
                    .then((res) => {
                        t.deepEqual(res.body, {
                            greeting: 'Hello World!'
                        }, 'Access kites from request')
                    })
                    .catch(t.fail)           
            })
    })

    t.end();
})