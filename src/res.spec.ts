import engine, { IKitesOptions } from '@kites/engine';
import {expect} from 'chai';
import createMyExpress from 'express';
import request from 'supertest';
import express from './main';

const config: IKitesOptions = {
  logger: {console: {level: 'debug', transport: 'console'}}
};

describe('kites:express:req', () => {

  it('should access kites from request', async () => {
    let customApp = createMyExpress();

    let kites = engine(config).use(express({
        app: customApp,
        static: __dirname + '/..'
    }))
    .ready(() => {
        customApp.get('/custom', (req, res) => res.send(req.kites.name));
    });

    await kites.init();

    let vResult = await request(kites.express.app).get('/custom').expect(200);
    expect(vResult.text, vResult.text).eq('kites');
  });
});
