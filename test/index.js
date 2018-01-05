var path = require('path');

[
    'kites.express',
    // Always end
    'endTest',
].forEach(script => {
    require(path.join(__dirname, script));
});