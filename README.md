# kites-express

Handling HTTP request for Kites

[![Join the chat at https://gitter.im/nodevn/kites](https://badges.gitter.im/nodevn/kites.svg)](https://gitter.im/nodevn/kites)
[![npm version](https://img.shields.io/npm/v/@kites/express.svg?style=flat)](https://www.npmjs.com/package/@kites/express)
[![npm downloads](https://img.shields.io/npm/dm/@kites/express.svg)](https://www.npmjs.com/package/@kites/express)


Extension Options
=================

* **static**: Public dir contains static files to serve client, default: `false`
* **httpPort**: Port which express listens to, default: `8000`
* **views.engine**: View engine template, default: `ejs`
* **views.path**: Path contains view template, default: `<root-project-location>/views`

Extension Usage
===============

You can apply this extention manually tho [kites-engine](https://github.com/vunb/kites-engine)

```js
var kites = require('@kites/engine')()
kites.use(require('@kites/express')())
```

License
=======

MIT License

Copyright (c) 2018 Nhữ Bảo Vũ

<a rel="license" href="./LICENSE" target="_blank"><img alt="The MIT License" style="border-width:0;" width="120px" src="https://raw.githubusercontent.com/hsdt/styleguide/master/images/ossninja.svg?sanitize=true" /></a>