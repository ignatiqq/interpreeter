import Interpreter from "../../Interpreter";
// @ts-ignore
import fs from 'fs';
// @ts-ignore
import path from "path";

const sourceCode = fs.readFileSync(path.resolve(__dirname, './code.something'), 'utf-8');

const interpreter = new Interpreter();
interpreter.interprete(sourceCode);