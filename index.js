/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file 主模块
 */

const pack = require('./src/pack');
const san = require('san');

exports.pack = pack;
exports.unpack = san.unpackANode;
exports.parseTemplate = san.parseTemplate;
exports.parseComponentTemplate = san.parseComponentTemplate;
exports.parseExpr = san.parseExpr;
exports.ExprType = san.ExprType;
