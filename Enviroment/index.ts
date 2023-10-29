import { RuntimeError } from "../error/error";
import Token from "../tokens/Token/Token";

type VariableValueType = string | number | null

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
        console.log('define name: ', name);
        this.map.set(name, val);
    }

    delete(name: string) {
        this.map.delete(name);
    }

    get(token: Token) {
        console.log("env.get map: ", this.map, 'token: ',token);
        if(this.map.has(token.lexeme)) {
            return this.map.get(token.lexeme);
        }

        throw new RuntimeError(token, 'Undefined variable ' + token.lexeme);
    }
}