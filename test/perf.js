const fs = require('fs');
const path = require('path');
const utils = require('../index');


const packDir = path.resolve(__dirname, '../node_modules/san-anode-cases/pack');

let template = fs.readFileSync(`${packDir}/composite.tpl`, 'UTF-8');
let an = utils.parseTemplate(template).children[0];

let packed = utils.pack(an);
const times = 1000;

console.time();
for (var i = 0; i < times; i++) {
    utils.parseTemplate(template).children[0];
}
console.timeEnd();


console.time();
for (var i = 0; i < times; i++) {
    utils.unpack(packed);
}
console.timeEnd();
