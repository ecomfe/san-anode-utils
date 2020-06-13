const fs = require('fs');
const path = require('path');
const utils = require('../index');


const packDir = path.resolve(__dirname, '../node_modules/san-anode-cases/pack');
const files = fs.readdirSync(packDir);

files.forEach(file => {
    file = path.parse(file);
    if (file.ext === '.tpl') {
        test(`unpack ${file.name}`, () => {
            const tpl = fs.readFileSync(`${packDir}/${file.base}`, 'UTF-8');
            const result = packResult(fs.readFileSync(`${packDir}/${file.name}.apack`, 'UTF-8'));
            
            expectEqual(utils.parseTemplate(tpl).children[0], utils.unpack(result));
        });
    }
});

function packResult(source) {
    return (new Function(`return ${source}`))();
}

function expectEqual(a, b) {
    var type = typeof a;
    expect(type).toBe(typeof b);

    if (a === null) {
        expect(b === null).toBeTruthy();
    }
    else {
        switch (type) {
            case 'boolean':
            case 'string':
            case 'number':
                expect(b === a).toBeTruthy();
                break;

            case 'undefined':
                expect(b == null).toBeTruthy();
                break;

            case 'object':
                for (var i in a) {
                    if (a.hasOwnProperty(i) && a[i] != null) {
                        expect(b.hasOwnProperty(i)).toBeTruthy();
                    }
                }
            
                for (var i in b) {
                    if (b.hasOwnProperty(i) && b[i] != null) {
                        expect(a.hasOwnProperty(i)).toBeTruthy();
                    }
                }
            
                for (var i in a) {
                    expectEqual(a[i], b[i]);
                }
                break;

            default:
                if (a instanceof Array) {
                    expect(b instanceof Array).toBeTruthy();
                    expect(a.length).toBe(b.length);

                    if (b instanceof Array && a.length === b.length) {
                        for (var i = 0; i < a.length; i++) {
                            expectEqual(a[i], b[i]);
                        }
                    }
                }
        }
    }
}
