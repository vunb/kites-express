# kites-express

Handling HTTP request for Kites

[![Join the chat at https://gitter.im/nodevn/kites](https://badges.gitter.im/nodevn/kites.svg)](https://gitter.im/nodevn/kites)
[![npm version](https://img.shields.io/npm/v/@kites/express.svg?style=flat)](https://www.npmjs.com/package/@kites/express)
[![npm downloads](https://img.shields.io/npm/dm/@kites/express.svg)](https://www.npmjs.com/package/@kites/express)

Features
========

* Add express req/res method utilities: `req.param('paramName', 'defaultValue')`, `res.ok([data])`, `res.badRequest(err)`, `res.error(err)`, `res.serverError(err)`, `res.forbidden(err)`
* Rendering template using with express response helpers: `res.view(['template', {data}])
* Optional to enable `static` dir serve with extension options configuration

Options
=======

* **static**: Public directory contains static files to serve client, default: `false`
* **httpPort**: Port which express listens to, default: `8000`
* **poweredBy**: Header `X-Powered-By` will response to client, default: `Kites`
* **views.name**: View engine template, default: `ejs`
* **views.module**: View engine package which can be required, default: `ejs`
* **views.renderer**: Options describe how kites knows to initialize, default: `renderFile`
* **views.path**: Path contains view template, default: `<root-project-location>/views`
* **views.locals**: Default data send to view, default: `false`

Usage
=====

You can apply this extention manually to [kites-engine](https://github.com/vunb/kites-engine)

```js
var kites = require('@kites/engine')()
kites.use(require('@kites/express')())
```

Auto discover mode, just install the extension as a dependency:

```bash
npm install @kites/express
```

Example to configure `Handlebars` as view engine.

```js
{
    views: {
        name: 'hbs',
        module: 'hbs',
        ext: 'hbs',
        renderer: '__express',
        locals: false,
        path: path.join(__dirname, '../views')
    }
}
```

Notice
======

* Be sure either enable mode auto discover or `use` extensions programatically and respectively. If not, you may get message: **Error: listen EADDRINUSE :::8000**

License
=======

MIT License

Copyright (c) 2018 Nhữ Bảo Vũ

<a rel="license" href="./LICENSE" target="_blank"><img alt="The MIT License" style="border-width:0;" width="120px" src="https://raw.githubusercontent.com/hsdt/styleguide/master/images/ossninja.svg?sanitize=true" /></a>