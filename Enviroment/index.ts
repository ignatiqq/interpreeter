import { RuntimeError } from "../error/error";
import Token from "../tokens/Token/Token";

export type VariableValueType = string | number | boolean | null;

export interface IEnviroment {
    define(name: string, value: VariableValueType): void;
    delete(name: string): void;
    get(token: Token): VariableValueType | undefined;
}

export class Enviroment implements IEnviroment {
    map: Map<string, VariableValueType>

    
    constructor() {
        this.map = new Map<string, VariableValueType>();
    }

    define(name: string, val: VariableValueType) {
        this.map.set(name, val);
    }

    assign(token: Token, val: VariableValueType) {
        if(this.map.has(token.lexeme)) {
            return this.map.get(token.lexeme);
        }

        throw new RuntimeError(token, 'Undefined variable ' + token.lexeme);
    }

    delete(name: string) {
        this.map.delete(name);
    }

    get(token: Token) {
        if(this.map.has(token.lexeme)) {
            return this.map.get(token.lexeme);
        }

        throw new RuntimeError(token, 'Undefined variable ' + token.lexeme);
    }
}