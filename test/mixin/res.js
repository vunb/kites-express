'use strict';
var os = require('os');
var path = require('path');
var test = require('tape');
var express = require('express');
var request = require('supertest');
var engine = require('@kites/engine');
var kitesExpress = require('../../index');

test('kites views engine', (troot) => {

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

    troot.test('default view engine', (t) => {
        t.plan(3);


        engine(config)
            .use(kitesExpress({
                app: express(),
                views: {
                    path: path.join(__dirname, '../views')
                }
            }))
            .init()
            .then((kites) => {
                // config express
                var app = kites.express.app;
                app.get('/knock', (req, res) => res.ok({
                    greeting: 'Hello World!'
                }));

                app.get('/about', (req, res) => {
                    return res.view('about', {
                        tagline: 'Template-based Web Application Framework!'
                    }, function (err, renderedViewStr) {
                        if (err) {
                            res.serverError(err);
                            t.fail(err);
                        } else {
                            res.send(renderedViewStr);
                            t.false(err, 'Callback works!');
                        }
                    });
                });

                request(app)
                    .get('/knock')
                    .expect(200)
                    // .expect('Content-Type', /json/)
                    .then((res) => {
                        t.deepEqual(res.body, {
                            greeting: 'Hello World!'
                        }, 'res.ok([data])');
                    })
                    .catch(t.fail)

                request(app)
                    .get('/about')
                    // .expect('Content-Type', /html/)
                    .expect(200)
                    .then((res) => {
                        t.equal(res.text, '<h2>About Kites</h2>\n<p>Template-based Web Application Framework!</p>\n<hr/>\n<p>Engine: <code>ejs</code></p>', 'about kites (default view engine)')
                    })
                    .catch(t.fail)
            })
    })

    troot.test('custom view engine', (t) => {
        t.plan(2);
        var kites = engine(config);

        kites
            .use(kitesExpress({
                app: express(),
                views: {
                    ext: 'hbs',
                    engine: 'hbs',
                    renderer: '__express',
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
                    tagline: 'Use Handlebars View Engine!'
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
                        t.equal(res.text, '<h2>About Kites</h2>\n<p>Use Handlebars View Engine!</p>\n<hr/>\n<p>Engine: <code>hbs</code></p>', 'about kites (handlebars view engine)')
                    })
                    .catch(t.fail)
            })
    })

    troot.end();
})