require('angular-mocks');

var testsContext = require.context('./test/unit/specs', true, /\.spec\.js$/);
testsContext.keys().forEach(testsContext);
