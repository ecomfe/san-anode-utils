const fs = require('fs');
const path = require('path');
const utils = require('../index');

const packDir = path.resolve(__dirname, '../node_modules/san-anode-cases/pack');
const files = fs.readdirSync(packDir);

files.forEach(file => {
    file = path.parse(file);
    if (file.ext === '.tpl') {
        test(`pack ${file.name}`, () => {
            const tpl = fs.readFileSync(`${packDir}/${file.base}`, 'UTF-8');
            const result = fs.readFileSync(`${packDir}/${file.name}.apack`, 'UTF-8'); 

            let aNode = utils.parseTemplate(tpl).children[0];
            expect(utils.pack.stringify(aNode)).toBe(result);
        });
    }
});
