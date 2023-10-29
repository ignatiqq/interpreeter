"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Interpreter_1 = require("../../Interpreter");
// @ts-ignore
var fs_1 = require("fs");
// @ts-ignore
var path_1 = require("path");
var sourceCode = fs_1.readFileSync(path_1.resolve(__dirname, './code.something'), 'utf-8');
var interpreter = new Interpreter_1.default();
interpreter.interprete(sourceCode);
