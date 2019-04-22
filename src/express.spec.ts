import engine from '@kites/engine';
import { expect } from 'chai';
import * as os from 'os';
import request from 'supertest';
import express from './main';

const config = {
    discover: false,
    logger: {
        console: {
            level: 'debug',
            transport: 'console'
        }
    },
    rootDirectory: __dirname,
    tempDirectory: os.tmpdir(),
    // extensionsLocationCache: false
};

describe('EventCollectionEmitter', () => {
    it('should return a valid awaitable promise', async () => {

        let kites = engine(config);

        kites.use(express());

        let app = await kites.init();

        let vResult = await request(app.express.app).get('/api/ping').expect(200);

        expect(vResult.body.msg, vResult.text).eq('pong');
    });

});
