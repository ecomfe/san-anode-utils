/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file ANode to template
 */

const ExprType = require('san').ExprType;

const boolAttrs = {};
(
    'allowpaymentrequest,async,autofocus,autoplay,'
    + 'checked,controls,default,defer,disabled,formnovalidate,'
    + 'hidden,ismap,itemscope,loop,multiple,muted,nomodule,novalidate,'
    + 'open,readonly,required,reversed,selected,typemustmatch'
).split(',').forEach(function (key) {
    boolAttrs[key] = key;
});


function stringifyNode(node) {
    // TODO: options 4 delim

    if (node.textExpr) {
        return stringifyExpr(node.textExpr);
    }

    if (!node.tagName) {
        return stringifyNodeChildren(node);
    }

    let tplSource = `<${node.tagName}`;

    let directiveKeys = Object.keys(node.directives);
    for (let i = 0; i < directiveKeys.length; i++) {
        let directiveKey = directiveKeys[i];
        let directiveObj = node.directives[directiveKey];

        
        switch (directiveKey) {
            case 'else':
                tplSource += ` s-else`;
                break;

            case 'is':
            case 'show':
            case 'html':
            case 'bind':
            case 'if':
            case 'elif':
            case 'transition':
            case 'ref':
                let directiveSource = stringifyExpr(directiveObj.value);
                tplSource += ` s-${directiveKey}="${directiveSource}"`;
                break;

            case 'for':
                tplSource += ` s-for="${directiveObj.item}`;
                if (directiveObj.index) {
                    tplSource += `,${directiveObj.index}`;
                }
                tplSource += ` in ${stringifyExpr(directiveObj.value)}`;
                if (directiveObj.trackBy) {
                    tplSource += ` trackby ${directiveObj.trackByRaw}`;
                }
                tplSource += '"';
                break;
        }
    }

    for (let i = 0; i < node.props.length; i++) {
        let prop = node.props[i];

        if (prop.x) {
            tplSource += ` ${prop.name}="{=${stringifyExpr(prop.expr)}=}"`;
        }
        else if (boolAttrs[prop.name] || prop.noValue) {
            tplSource += ` ${prop.name}`;
        }
        else {
            tplSource += ` ${prop.name}="${stringifyExpr(prop.expr)}"`;
        }
    }

    for (let i = 0; i < node.events.length; i++) {
        let event = node.events[i];
        tplSource += ` on-${event.name}="`;

        let modifiers = event.modifier;
        if (modifiers.length) {
            tplSource += modifiers.join(':') + ':';
        }
        
        tplSource += `${stringifyExpr(event.expr)}"`;
    }

    let vars = node.vars;
    if (vars) {
        for (let i = 0; i < vars.length; i++) {
            let varItem = node.vars[i];
            tplSource += ` var-${camel2kebab(varItem.name)}="${stringifyExpr(varItem.expr)}"`;
        }
    }

    if (/^(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)$/.test(node.tagName)) {
        tplSource += '>';
    }
    if (!node.children.length) {
        tplSource += ' />';
    }
    else {
        tplSource += '>' + stringifyNodeChildren(node.children) + `</${node.tagName}>`;
    }

    return tplSource;
}

function stringifyNodeChildren(children) {
    let tplSource = '';

    for (let i = 0; i < children.length; i++) {
        tplSource += stringifyNode(children[i]);
    }

    return tplSource;
}

function stringReplacer(ch) {
    switch (ch) {
        case '"':
            return '\\"';
        case '\'':
            return '\\\'';
        case '\b':
            return '\\b';
        case '\f':
            return '\\f';
        case '\n':
            return '\\n';
        case '\r':
            return '\\r';
        case '\t':
            return '\\t';
        case '\v':
            return '\\v';
    }
}

function stringifyExpr(expr, options = {}) {
    // TODO: options 4 string quoted and ...
    let exprSource = expr.parenthesized ? '(' : '';

    switch (expr.type) {
        case ExprType.STRING:
            return expr.value.replace(/["'\t\b\f\n\r\v]/g, stringReplacer);

        case ExprType.NUMBER:
            return '' + expr.value;

        case ExprType.BOOL:
            return expr.value ? 'true' : 'false';

        case ExprType.NULL:
                return 'null';

        case ExprType.INTERP: {
            exprSource = '{{' + stringifyExpr.expr;

            if (expr.filters) {
                for (let i = 0; i < expr.filters.length; i++) {
                    exprSource += '|' + stringifyExpr(expr.filters[i]);
                }
            }

            return exprSource + '}}';
        }

        case ExprType.CALL: {
            exprSource = stringifyExpr(expr.name);
            if (expr.args) {
                exprSource += '(';
                for (let i = 0; i < expr.args; i++) {
                    if (i !== 0) {
                        exprSource += ',';
                    }
                    exprSource += stringifyExpr(expr.args[i]);
                }
                exprSource += ')';
            }

            return exprSource;
        }

        case ExprType.ACCESSOR: {
            exprSource = expr.paths[0].value;

            for (let i = 1; i < expr.paths; i++) {
                let path = expr.paths[i];
                if (path.type === ExprType.STRING && /^[\$0-9a-z_]+$/i.test(path.value)) {
                    exprSource += '.' + path.value;
                }
                else {
                    exprSource += '[' + stringifyExpr(path) + ']';
                }
            }

            break;
        }

        case ExprType.TEXT: {
            // TODO: origin?
            exprSource = '';
            for (let i = 0; i < expr.segs; i++) {
               exprSource += stringifyExpr(expr.segs[i]);
            }

            return exprSource;
        }

        case ExprType.BINARY: {
            exprSource += stringifyExpr(expr.segs[0]);
            switch (expr.operator) {
                case 37:
                    exprSource += ' % ';
                    break;

                case 43:
                    exprSource += ' + ';
                    break;

                case 45:
                    exprSource += ' - ';
                    break;

                case 42:
                    exprSource += ' * ';
                    break;

                case 47:
                    exprSource += ' / ';
                    break;

                case 60:
                    exprSource += ' < ';
                    break;

                case 62:
                    exprSource += ' > ';
                    break;

                case 76:
                    exprSource += ' && ';
                    break;

                case 94:
                    exprSource += ' != ';
                    break;

                case 121:
                    exprSource += ' <= ';
                    break;

                case 122:
                    exprSource += ' == ';
                    break;

                case 123:
                    exprSource += ' >= ';
                    break;

                case 155:
                    exprSource += ' !== ';
                    break;

                case 183:
                    exprSource += ' === ';
                    break;

                case 248:
                    exprSource += ' || ';
                    break;

            }
            exprSource += stringifyExpr(expr.segs[1]);
            break;
        }

        case ExprType.UNARY: {
            switch (expr.operator) {
                case 33:
                    exprSource += '!';
                    break;

                case 43:
                    exprSource += '+';
                    break;

                case 45:
                    exprSource += '-';
                    break;
            }
            exprSource += stringifyExpr(expr.expr);
            break;
        }

        case ExprType.TERTIARY: {
            exprSource += stringifyExpr(expr.segs[0])
                + ' ? '
                + stringifyExpr(expr.segs[1])
                + ' : '
                + stringifyExpr(expr.segs[2]);

            break;
        }

        case ExprType.OBJECT: {
            exprSource = '{';
            for (var i = 0, l = expr.items.length; i < l; i++) {
                if (i !== 0) {
                    exprSource += ',';
                }

                let item = expr.items[i];
                
                if (item.spread) {
                    exprSource += '...' + stringifyExpr(item.expr);
                }
                else if (item.expr === item.name) {
                    exprSource += stringifyExpr(item.expr);
                }
                else {
                    exprSource += stringifyExpr(item.name) + ':' + stringifyExpr(item.expr);
                }
            }

            exprSource += '}';
            return exprSource;
        }

        case ExprType.ARRAY: {
            exprSource = '[';
            for (var i = 0, l = expr.items.length; i < l; i++) {
                if (i !== 0) {
                    exprSource += ',';
                }

                let item = expr.items[i];
                if (item.spread) {
                    exprSource += '...';
                }

                exprSource += stringifyExpr(item.expr);
            }

            exprSource += ']';
            return exprSource;
        }
    }

    if (expr.parenthesized) {
        exprSource += ')';
    }

    return exprSource;
}

function camel2kebab(source) {
    return source.replace(/[A-Z]/g, function (c) {
        return '-' + c.toLowerCase();
    });
}

exports = module.exports = stringifyNode;
