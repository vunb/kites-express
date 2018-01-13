'use strict';

module.exports = function (app, kites) {
    app.get('/api/kites', function (req, res) {
        res.send(`${kites.name}@${kites.version}`)
    })

    app.get('/api/ping', function (req, res) {
        if (!kites._initialized) {
            return res.status(403).send('Not yet initialized.')
        }
        res.ok({
            msg: req.param('msg', 'pong'),
            kites: kites.version
        })
    })
}