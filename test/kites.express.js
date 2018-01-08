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

    t.plan(2);

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
    })
})