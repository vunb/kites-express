var path = require('path');

[
    'express',
    'mixin/req',
    'mixin/res',
    // Always end
    'endTest',
].forEach(script => {
    require(path.join(__dirname, script));
});