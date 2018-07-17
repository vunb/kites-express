var path = require('path');

[
    'express',
    'mixin/res',
    // Always end
    'endTest',
].forEach(script => {
    require(path.join(__dirname, script));
});