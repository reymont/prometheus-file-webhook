const util = require('util');

console.log(util.format('%s:%s', 'foo', 'bar', 'baz')); // 'foo:bar baz'
console.log(util.format('%s:%s', 'foo'));
console.log(util.format(1, 2, 3)); // '1 2 3'
console.log(util.format('%% %s')); // '%% %s'

