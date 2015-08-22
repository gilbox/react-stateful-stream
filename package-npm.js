var p = require('./package');

p.main='./';
p.scripts=p.devDependencies=undefined;

module.exports = p;