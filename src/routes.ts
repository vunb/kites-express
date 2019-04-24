import { KitesInstance } from '@kites/engine';
import { Express } from 'express';

export function routes(app: Express, kites: KitesInstance) {
    app.get('/api/kites', (req, res) => {
        res.send(`${kites.name}@${kites.version}`);
    });

    app.get('/api/ping', (req, res) => {
        if (!kites.isInitialized) {
            return res.status(403).send('Not yet initialized.');
        }
        res.ok({
            kites: kites.version,
            msg: req.param('msg', 'pong'),
        });
    });
}
