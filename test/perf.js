const fs = require('fs');
const san = require('san');
const utils = require('../index');

let template = fs.readFileSync(`${__dirname}/pack/composite.tpl`, 'UTF-8');
let an = san.parseTemplate(template).children[0];

let packed = utils.pack(an);
const times = 1000;

console.time();
for (var i = 0; i < times; i++) {
    san.parseTemplate(template).children[0];
}
console.timeEnd();


console.time();
for (var i = 0; i < times; i++) {
    utils.unpack(packed);
}
console.timeEnd();
