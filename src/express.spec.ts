import engine, { IKitesOptions } from '@kites/engine';
import { expect } from 'chai';
import CreateMyExpress from 'express';
import request from 'supertest';
import express from './main';

const config: IKitesOptions = {
    logger: {
        console: {
            level: 'debug',
            transport: 'console'
        }
    }
};

describe('kites:express', () => {
    it('should return a valid awaitable promise', async () => {

        let kites = engine(config);

        kites.use(express());

        let app = await kites.init();
        let vResult = await request(app.express.app).get('/_kites/ping').expect(200);

        expect(vResult.body.msg, vResult.text).eq('pong');
    });

    it('should use custom express', async () => {

        let customApp = CreateMyExpress();

        let kites = engine(config).use(express({
            app: customApp,
        })).ready(() => {
            customApp.get('/custom', (req, res) => res.send(req.kites.name));
        });

        await kites.init();

        let vResult = await request(kites.express.app).get('/custom').expect(200);
        expect(vResult.text, vResult.text).eq('kites');
    });

    it('should serve static files', async () => {

        let kites = engine(config).use(express({
            static: __dirname + '/..'
        }));

        await kites.init();

        let vResult = await request(kites.express.app).get('/test/_static_file.css').expect(200);

        expect(vResult.get('Content-Type')).match(/text\/css/);
        expect(vResult.text).eq('body { background: green}');
    });
});
