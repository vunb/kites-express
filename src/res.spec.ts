import engine, { IKitesOptions } from '@kites/engine';
import {assert, expect} from 'chai';
import createMyExpress from 'express';
import { join } from 'path';
import request from 'supertest';
import express from './main';

const config: IKitesOptions = {
  logger: {console: {level: 'debug', transport: 'console'}}
};

describe('kites:express:res', () => {

  it('should use default view engine', async () => {
    let customApp = createMyExpress();

    let kites = engine(config).use(express({
        app: customApp,
        views: {
          path: join(__dirname, '../test/views')
      }
    }))
    .ready(() => {
        customApp.get('/about', (req, res) => {
          return res.view('about', {
            tagline: 'Template-based Web Application Framework!'
          }, (err: any, renderedViewStr: string) => {
            assert.notExists(err, 'Express render without error');
            if (err) {
              res.serverError(err);
            } else {
              res.send(renderedViewStr);
            }
          });
      });
    });

    await kites.init();

    let vResult = await request(kites.express.app).get('/about').expect(200);
    expect(vResult.text, 'use default view engine').eq('<h2>about.ejs</h2>\n<p>Template-based Web Application Framework!</p>');
  });

  it('should use view engine: handlebars', async () => {
    let customApp = createMyExpress();

    let kites = engine(config).use(express({
      app: customApp,
      views: {
        engine: 'hbs',
        ext: 'hbs',
        locals: false,
        path: join(__dirname, '../test/views'),
        renderer: '__express',
    }
    }))
    .ready(() => {
        customApp.get('/about', (req, res) => {
          return res.view('about', {
            tagline: 'Template-based Web Application Framework!'
          });
      });
    });

    await kites.init();

    let vResult = await request(kites.express.app).get('/about').expect(200);
    expect(vResult.text, 'use view engine: handlebars').eq('<h2>about.hbs</h2>\n<p>Template-based Web Application Framework!</p>');
  });

  it('should use view engine: pug', async () => {
    let customApp = createMyExpress();

    let kites = engine(config).use(express({
      app: customApp,
      views: {
        engine: 'consolidate',
        ext: 'pug',
      }
    }))
    .ready(() => {
      customApp.get('/user', (req, res) => {
        var locals = {
          user: {
            name: 'Vunb'
          }
        };
        return res.view('user', locals);
      });
    });

    await kites.init();

    let vResult = await request(kites.express.app).get('/user').expect(200);
    expect(vResult.text, 'use view engine: pug').eq('<p>Vunb</p>');
  });
});
