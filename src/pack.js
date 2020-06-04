/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file ANode 压缩
 */

var ExprType = require('san').ExprType;

function packTemplateNode(aNode) {
    if (aNode.textExpr) {
        return [void(0)].concat(packExpr(aNode.textExpr));
    }

    var result = [1, aNode.tagName, aNode.children.length || void(0)];
    
    // pack children
    for (var i = 0; i < aNode.children.length; i++) {
        result = result.concat(packTemplateNode(aNode.children[i]));
    }

    // pack prop
    for (var i = 0; i < aNode.props.length; i++) {
        var prop = aNode.props[i];
        result = result.concat(
            prop.x ? 34 : (prop.noValue ? 33 : 2),
            prop.name,
            packExpr(prop.expr)
        );
    }

    // pack events
    for (var i = 0; i < aNode.events.length; i++) {
        var event = aNode.events[i];
        result = result.concat(35, packExpr(event.expr));
        
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

    // pack directives
    for (var key in aNode.directives) {
        var directive = aNode.directives[key];
        switch (key) {
            case 'if':
                result = result.concat(38, packExpr(directive.value));
                if (directive.elses instanceof Array) {
                    for (var i = 0; i < directive.elses.length; i++) {
                        result = result.concat(packTemplateNode(directive.elses[i]));
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
                result = result.concat(39, packExpr(directive.value));
                break;
                
            case 'for':
                result = result.concat(
                    37, 
                    packExpr(directive.value),
                    directive.item,
                    directive.index || void(0),
                    directive.trackByRaw || void(0)
                );
                break;
                
            case 'html':
                result = result.concat(43, packExpr(directive.value));
                break;
                
            case 'bind':
                result = result.concat(42, packExpr(directive.value));
                break;
                
            case 'ref':
                result = result.concat(41, packExpr(directive.value));
                break;
                
            case 'transition':
                result = result.concat(44, packExpr(directive.value));
                break;
        }
    }

    // pack vars
    if (aNode.vars) {
        for (var i = 0; i < aNode.vars.length; i++) {
            var varItem = aNode.vars[i];
            result = result.concat(36, varItem.name, packExpr(varItem.expr));
        }
    }

    return result;
}

function packExpr(expr) {
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
                result = result.concat(packExpr(expr.paths[i]));
            }
            break;

        case ExprType.INTERP:
            result = [7].concat(
                packExpr(expr.expr),
                expr.original ? 1 : void(0),
                expr.filters.length || void(0)
            );
            for (var i = 0; i < expr.filters.length; i++) {
                result = result.concat(packExpr(expr.filters[i]));
            }
            break;

        case ExprType.CALL:
            result = [8].concat(packExpr(expr.name));
            result.push(expr.args.length || void(0));
            for (var i = 0; i < expr.args.length; i++) {
                result = result.concat(packExpr(expr.args[i]));
            }
            break;

        case ExprType.TEXT:
            result = [9, expr.original ? 1 : void(0), expr.segs.length || void(0)];
            for (var i = 0; i < expr.segs.length; i++) {
                result = result.concat(packExpr(expr.segs[i]));
            }
            break;
        
        case ExprType.BINARY:
            result = [10, expr.operator, expr.segs.length || void(0)];
            for (var i = 0; i < expr.segs.length; i++) {
                result = result.concat(packExpr(expr.segs[i]));
            }
            break;
        
        case ExprType.UNARY:
            result = [11, expr.operator].concat(packExpr(expr.expr));
            break;

        case ExprType.TERTIARY:
            result = [12];
            for (var i = 0; i < expr.segs.length; i++) {
                result = result.concat(packExpr(expr.segs[i]));
            }
            break;

        case ExprType.OBJECT:
            result = [13, expr.items.length || void(0)];
            for (var i = 0; i < expr.items.length; i++) {
                var item = expr.items[i];
                result = result.concat(
                    item.spread ? 15 : 14,
                    packExpr(item.name),
                    packExpr(item.expr)
                );
            }
            break;

        case ExprType.ARRAY:
            result = [16, expr.items.length || void(0)];
            for (var i = 0; i < expr.items.length; i++) {
                var item = expr.items[i];
                result = result.concat(
                    item.spread ? 18 : 17,
                    packExpr(item.expr)
                );
            }
            break;
    }

    return result || [];
}

module.exports = exports = function (aNode) {
    return packTemplateNode(aNode);
};

exports.stringify = function (packed) {
    return '['
        + packed.map(function (item) {
            if (item == null) {
                return item;
            }

            return JSON.stringify(item);
        }).join(',')
        + ']';
};