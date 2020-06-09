const fs = require('fs');
const path = require('path');
const utils = require('../index');

const files = fs.readdirSync(`${__dirname}/pack`);

files.forEach(file => {
    file = path.parse(file);
    if (file.ext === '.tpl') {
        test(`pack ${file.name}`, () => {
            const tpl = fs.readFileSync(`${__dirname}/pack/${file.base}`, 'UTF-8');
            const result = fs.readFileSync(`${__dirname}/pack/${file.name}.tpack`, 'UTF-8'); 

            let aNode = utils.parseTemplate(tpl).children[0];
            expect(utils.pack.stringify(utils.pack(aNode))).toBe(result);
        });
    }
});
