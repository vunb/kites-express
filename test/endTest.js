var test = require('tape');

// close server by exit application
test('Close server after testing done', function (assert) {
    // just exit application
    assert.end();
    process.exit();
});