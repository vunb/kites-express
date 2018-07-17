'use strict';
var os = require('os');
var path = require('path');
var test = require('tape');
var request = require('supertest');
var engine = require('@kites/engine');
var kitesExpress = require('../../index');

test('kites views engine', (t) => {
    t.plan(2);

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
    }

    var kites = engine(config);
    // config the kites-express extension
    kites
        .use(kitesExpress({
            views: {
                engine: 'ejs',
                locals: false,
                path: path.join(__dirname, '../views')
            }
        }))
        .init()
        .then(() => {
            // config express
            var app = kites.express.app;
            app.get('/knock', (req, res) => res.ok({
                greeting: 'Hello World!'
            }));

            app.get('/about', (req, res) => res.view('about', {
                tagline: 'Template-based Web Application Framework!'
            }));

            request(app)
                .get('/knock')
                .expect(200)
                .expect('Content-Type', /json/)
                .then((res) => {
                    t.deepEqual(res.body, {
                        greeting: 'Hello World!'
                    }, 'res.ok([data])');
                })
                .catch(t.fail)

            request(app)
                .get('/about')
                .expect('Content-Type', /html/)
                .expect(200)
                .then((res) => {
                    t.equal(res.body, 'pong', 'about kites (page views)')
                })
                .catch(t.fail)           
        })
})