import Interpreter from "../../Interpreter";
import fs from 'fs';
import path from "path";

const sourceCode = fs.readFileSync(path.resolve(__dirname, './code.something'), 'utf-8');

const interpreter = new Interpreter();

const tokens = interpreter.interprete(sourceCode);