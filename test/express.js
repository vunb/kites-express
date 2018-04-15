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

    t.plan(3);

    var kites = engine(config).use(kitesExpress());
    kites.init().then(() => {
        request(kites.express.app)
            .get('/api/kites')
            .expect(200)
            .expect(/^kites@\d+.\d+.\d+$/)
            .then((res) => {
                t.true(/^kites@\d+.\d+.\d+$/.test(res.text), 'kites info')
            })
            .catch(t.fail)

        request(kites.express.app)
            .get('/api/ping')
            .expect('Content-Type', /json/)
            .expect(200)
            .then((res) => {
                t.equal(res.body.msg, 'pong', 'kites ping')
            })
            .catch(t.fail)

        request(kites.express.app)
            .get('/api/ping?msg=hello')
            .expect('Content-Type', /json/)
            .expect(200)
            .then((res) => {
                t.equal(res.body.msg, 'hello', 'kites hello')
            })
            .catch(t.fail)
    })
})

test('kites use custom express', (t) => {
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

    t.plan(2);

    let customApp = require('express')()
    customApp.get('/custom-express', (req, res) => res.send('new text'))

    let kites = engine(config).use(kitesExpress({
        app: customApp,
        static: __dirname
    }));

    kites.init().then(() => {
        // request custom api
        request(kites.express.app)
            .get('/custom-express')
            .expect(200)
            .expect('new text')
            .then((res) => {
                t.pass('kites use custom express app')
            })
            .catch(t.fail)

        // request static files
        request(kites.express.app)
            .get('/_static_file.css')
            .expect('Content-Type', /css/)
            .expect(200)
            .expect('body { background: green}')
            .then((res) => {
                t.pass('kites download static files')
            })
            .catch(t.fail)
    })
})