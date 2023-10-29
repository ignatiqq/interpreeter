import Interpreter from "../../Interpreter";
// @ts-ignore
import fs from 'fs';
// @ts-ignore
import path from "path";
import { Parser } from "../../parser/Parser";
import { ASTPrinter } from "../../AST/printer/ASTprinter";
import { Enviroment } from "../../Enviroment";

const sourceCode = fs.readFileSync(path.resolve(__dirname, './code.something'), 'utf-8');

const interpreter = new Interpreter();
interpreter.interprete(sourceCode);