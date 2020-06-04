/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file ANode 压缩
 */

var ExprType = require('san').ExprType;

function compressTemplate(aNode) {
    if (aNode.textExpr) {
        return [void(0)].concat(compressExpr(aNode.textExpr));
    }

    var result = [1, aNode.tagName, aNode.children.length || void(0)];
    
    // compress children
    for (var i = 0; i < aNode.children.length; i++) {
        result = result.concat(compressTemplate(aNode.children[i]));
    }

    // compress prop
    for (var i = 0; i < aNode.props.length; i++) {
        var prop = aNode.props[i];
        result = result.concat(
            prop.x ? 34 : (prop.noValue ? 33 : 2),
            prop.name,
            compressExpr(prop.expr)
        );
    }

    // compress events
    for (var i = 0; i < aNode.events.length; i++) {
        var event = aNode.events[i];
        result = result.concat(35, compressExpr(event.expr));
        
        var modifierLen = 0;
        var modifierResult = [0];
        for (var key in event.modifier) {
            modifierLen++;
            modifierResult.push(key);
        }
        modifierResult[0] = modifierLen;

        if (modifierLen) {
            result = result.concat(modifierResult);
        }
        else {
            result.push(void(0));
        }
    }

    // compress directives
    for (var key in aNode.directives) {
        var directive = aNode.directives[key];
        switch (key) {
            case 'if':
                result = result.concat(38, compressExpr(directive.value));
                if (directive.elses instanceof Array) {
                    for (var i = 0; i < directive.elses.length; i++) {
                        result = result.concat(compressTemplate(directive.elses[i]));
                    }
                }
                else {
                    result.push(void(0));
                }
                break;
                
            case 'else':
                result.push(40);
                break;
                
            case 'elif':
                result = result.concat(39, compressExpr(directive.value));
                break;
                
            case 'for':
                result = result.concat(
                    37, 
                    compressExpr(directive.value),
                    directive.item,
                    directive.index || void(0),
                    directive.trackByRaw || void(0)
                );
                break;
                
            case 'html':
                result = result.concat(43, compressExpr(directive.value));
                break;
                
            case 'bind':
                result = result.concat(42, compressExpr(directive.value));
                break;
                
            case 'ref':
                result = result.concat(41, compressExpr(directive.value));
                break;
                
            case 'transition':
                result = result.concat(44, compressExpr(directive.value));
                break;
        }
    }

    // compress vars
    if (aNode.vars) {
        for (var i = 0; i < aNode.vars.length; i++) {
            var varItem = aNode.vars[i];
            result = result.concat(36, varItem.name, compressExpr(varItem.expr));
        }
    }

    return result;
}

function compressExpr(expr) {
    var result;

    switch (expr.type) {
        case ExprType.STRING:
            return [3, expr.value];

        case ExprType.NUMBER:
            return [4, expr.value];

        case ExprType.BOOL:
            return [5, expr.value ? 1 : void(0)];

        case ExprType.NULL:
            return [19];

        case ExprType.ACCESSOR:
            result = [6, expr.paths.length];
            for (var i = 0; i < expr.paths.length; i++) {
                result = result.concat(compressExpr(expr.paths[i]));
            }
            break;

        case ExprType.INTERP:
            result = [7].concat(
                compressExpr(expr.expr),
                expr.original ? 1 : void(0),
                expr.filters.length || void(0)
            );
            for (var i = 0; i < expr.filters.length; i++) {
                result = result.concat(compressExpr(expr.filters[i]));
            }
            break;

        case ExprType.CALL:
            result = [8].concat(compressExpr(expr.name));
            result.push(expr.args.length || void(0));
            for (var i = 0; i < expr.args.length; i++) {
                result = result.concat(compressExpr(expr.args[i]));
            }
            break;

        case ExprType.TEXT:
            result = [9, expr.original ? 1 : void(0), expr.segs.length || void(0)];
            for (var i = 0; i < expr.segs.length; i++) {
                result = result.concat(compressExpr(expr.segs[i]));
            }
            break;
        
        case ExprType.BINARY:
            result = [10, expr.operator, expr.segs.length || void(0)];
            for (var i = 0; i < expr.segs.length; i++) {
                result = result.concat(compressExpr(expr.segs[i]));
            }
            break;
        
        case ExprType.UNARY:
            result = [11, expr.operator].concat(compressExpr(expr.expr));
            break;

        case ExprType.TERTIARY:
            result = [12];
            for (var i = 0; i < expr.segs.length; i++) {
                result = result.concat(compressExpr(expr.segs[i]));
            }
            break;

        case ExprType.OBJECT:
            result = [13, expr.items.length || void(0)];
            for (var i = 0; i < expr.items.length; i++) {
                var item = expr.items[i];
                result = result.concat(
                    item.spread ? 15 : 14,
                    compressExpr(item.name),
                    compressExpr(item.expr)
                );
            }
            break;

        case ExprType.ARRAY:
            result = [16, expr.items.length || void(0)];
            for (var i = 0; i < expr.items.length; i++) {
                var item = expr.items[i];
                result = result.concat(
                    item.spread ? 18 : 17,
                    compressExpr(item.expr)
                );
            }
            break;
    }

    return result || [];
}

module.exports = exports = function (aNode) {
    return compressTemplate(aNode);
};

exports.stringify = function (compressed) {
    return '['
        + compressed.map(function (item) {
            if (item == null) {
                return item;
            }

            return JSON.stringify(item);
        }).join(',')
        + ']';
};