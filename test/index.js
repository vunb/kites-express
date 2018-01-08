var path = require('path');

[
    'express',
    // Always end
    'endTest',
].forEach(script => {
    require(path.join(__dirname, script));
});