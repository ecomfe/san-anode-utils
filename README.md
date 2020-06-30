# San ANode Utils

Util Functions for San [ANode](https://github.com/baidu/san/blob/master/doc/anode.md). 和 [San](https://github.com/baidu/san) [ANode](https://github.com/baidu/san/blob/master/doc/anode.md) 相关的功能函数集。

[![NPM version](http://img.shields.io/npm/v/san-anode-utils.svg?style=flat-square)](https://npmjs.org/package/san-anode-utils)
[![License](https://img.shields.io/github/license/ecomfe/san-anode-utils.svg?style=flat-square)](https://npmjs.org/package/san-anode-utils)
[![CircleCI](https://circleci.com/gh/ecomfe/san-anode-utils.svg?style=svg)](https://circleci.com/gh/ecomfe/san-anode-utils)


## 版本说明

由于 [San](https://github.com/baidu/san) 在不同的 minor 版本号之间，[ANode](https://github.com/baidu/san/blob/master/doc/anode.md) 会有细微差别。所以，san-anode-utils 的版本号与 [San](https://github.com/baidu/san) 版本号二位兼容。也就是说，san-anode-utils `3.9.x` 版本支持 [San](https://github.com/baidu/san) `3.9.x`。

## 安装

```
$ npm i --save san-anode-utils
```

## Properties

### ExprType

表达式类型枚举常量。包含表达式见下方示例。

`Object`

```js
ExprType = {
    STRING,
    NUMBER,
    BOOL,
    ACCESSOR,
    INTERP,
    CALL,
    TEXT,
    BINARY,
    UNARY,
    TERTIARY,
    OBJECT,
    ARRAY,
    NULL
};
```

## Functions

### parseTemplate

`parseTemplate({string}template): {ANode}`

将模板字符串解析成 [ANode](https://github.com/baidu/san/blob/master/doc/anode.md) 对象。

```js
const aNodeUtils = require('san-anode-utils');

let aNode = aNodeUtils.parseTemplate('<p>Hello {{name}}</p>');
/* aNode
{
    "directives": {},
    "props": [],
    "events": [],
    "children": [
        {
            "directives": {},
            "props": [],
            "events": [],
            "children": [
                {
                    "textExpr": {
                        "type": 7,
                        "segs": [
                            {
                                "type": 1,
                                "value": "Hello "
                            },
                            {
                                "type": 5,
                                "expr": {
                                    "type": 4,
                                    "paths": [
                                        {
                                            "type": 1,
                                            "value": "name"
                                        }
                                    ]
                                },
                                "filters": []
                            }
                        ]
                    }
                }
            ],
            "tagName": "p"
        }
    ]
}
*/
```

### parseComponentTemplate

将组件的模板解析成 [ANode](https://github.com/baidu/san/blob/master/doc/anode.md) 对象。与直接调用 `parseTemplate` 不同，`parseComponentTemplate` 会自动抽取第一个子元素作为组件根元素，为其附加 `id/style/class` 的逻辑，其行为与运行时组件编译完全相同。

`parseComponentTemplate({Function}ComponentClass): {ANode}`

```js
const aNodeUtils = require('san-anode-utils');
const san = require('san');

const MyComponent = san.defineComponent({
    template: '<p>Hello {{name}}</p>'
});
let aNode = aNodeUtils.parseComponentTemplate(MyComponent);
/* aNode
{
    "directives": {},
    "props": [
        {
            "name": "class",
            "expr": {
                "type": 5,
                "expr": {
                    "type": 4,
                    "paths": [
                        {
                            "type": 1,
                            "value": "class"
                        }
                    ]
                },
                "filters": [
                    {
                        "type": 6,
                        "args": [],
                        "name": {
                            "type": 4,
                            "paths": [
                                {
                                    "type": 1,
                                    "value": "_class"
                                }
                            ]
                        }
                    }
                ]
            }
        },
        {
            "name": "style",
            "expr": {
                "type": 5,
                "expr": {
                    "type": 4,
                    "paths": [
                        {
                            "type": 1,
                            "value": "style"
                        }
                    ]
                },
                "filters": [
                    {
                        "type": 6,
                        "args": [],
                        "name": {
                            "type": 4,
                            "paths": [
                                {
                                    "type": 1,
                                    "value": "_style"
                                }
                            ]
                        }
                    }
                ]
            }
        },
        {
            "name": "id",
            "expr": {
                "type": 4,
                "paths": [
                    {
                        "type": 1,
                        "value": "id"
                    }
                ]
            }
        }
    ],
    "events": [],
    "children": [
        {
            "textExpr": {
                "type": 7,
                "segs": [
                    {
                        "type": 1,
                        "value": "Hello "
                    },
                    {
                        "type": 5,
                        "expr": {
                            "type": 4,
                            "paths": [
                                {
                                    "type": 1,
                                    "value": "name"
                                }
                            ]
                        },
                        "filters": []
                    }
                ]
            }
        }
    ],
    "tagName": "p"
}
*/
```

### parseExpr

将表达式源码解析成 [ANode](https://github.com/baidu/san/blob/master/doc/anode.md) 对象。

`parseExpr({string}source): {ANode}`

```js
const aNodeUtils = require('san-anode-utils');

let aNode = aNodeUtils.parseExpr('num + 1');
/* aNode
{
    "type": 8,
    "operator": 43,
    "segs": [
        {
            "type": 4,
            "paths": [
                {
                    "type": 1,
                    "value": "num"
                }
            ]
        },
        {
            "type": 2,
            "value": 1
        }
    ]
}
*/
```

### pack

将 [ANode](https://github.com/baidu/san/blob/master/doc/anode.md) 压缩成 [APack](https://github.com/baidu/san/blob/master/doc/anode-pack.md)。

`pack({ANode}source): {Array}`

```js
const aNodeUtils = require('san-anode-utils');

let aNode = aNodeUtils.parseTemplate('<p>Hello {{name}}</p>');
let aPack = aNodeUtils.pack(aNode.children[0]);
/* aPack
[
    1,
    "p",
    1,
    undefined,
    9,
    undefined,
    2,
    3,
    "Hello ",
    7,
    undefined,
    6,
    1,
    3,
    "name",
    undefined
]
*/
```

### pack.stringify

将 [APack](https://github.com/baidu/san/blob/master/doc/anode.md) 转换成字符串。

`pack.stringify({ANode}source): {Array}`

```js
const aNodeUtils = require('san-anode-utils');

let aNode = aNodeUtils.parseTemplate('<p>Hello {{name}}</p>');
let aPack = aNodeUtils.pack(aNode.children[0]);
let aPackString = aNodeUtils.pack.stringify(aPack);
/* aPackString
[1,"p",1,,9,,2,3,"Hello ",7,,6,1,3,"name",]
*/
```

### unpack

将 [APack](https://github.com/baidu/san/blob/master/doc/anode-pack.md) 解压缩成 [ANode](https://github.com/baidu/san/blob/master/doc/anode.md)。

`unpack({Array}aPack): {ANode}`

```js
const aNodeUtils = require('san-anode-utils');

let aNode = aNodeUtils.unpack([1,"p",1,,9,,2,3,"Hello ",7,,6,1,3,"name",]);
/* aNode
{
    "directives": {},
    "props": [],
    "events": [],
    "children": [
        {
            "textExpr": {
                "type": 7,
                "segs": [
                    {
                        "type": 1,
                        "value": "Hello "
                    },
                    {
                        "type": 5,
                        "expr": {
                            "type": 4,
                            "paths": [
                                {
                                    "type": 1,
                                    "value": "name"
                                }
                            ]
                        },
                        "filters": []
                    }
                ]
            }
        }
    ],
    "tagName": "p"
}
*/
```

## License

san-anode-utils is [MIT licensed](./LICENSE).
