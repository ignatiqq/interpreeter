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
    /**
     * realization of scope
     * каждому инстансу "Enviroment" мы должны дать ссылку на внешний
     */
    enclosing: Enviroment | null;

    
    constructor(enclosing: Enviroment | null = null) {
        this.map = new Map<string, VariableValueType>();
        this.enclosing = enclosing ;
    }

    define(name: string, val: VariableValueType) {
        this.map.set(name, val);
    }

    assign(token: Token, val: VariableValueType) {
        if(this.map.has(token.lexeme)) {
            return this.map.set(token.lexeme, val);
        }

        // @ts-ignore @TODO
        if(!this.isGlobalEnviroment) return this.enclosing.assign(token, val);

        throw new RuntimeError(token, 'Undefined variable ' + token.lexeme);
    }

    delete(name: string) {
        this.map.delete(name);
    }

    get(token: Token) {
        if(this.map.has(token.lexeme)) {
            return this.map.get(token.lexeme);
        }

        // @ts-ignore @TODO
        // рекурсивный поиск перменных в областях видимости (евайроментах) выше
        if(!this.isGlobalEnviroment) return this.enclosing.get(token);

        throw new RuntimeError(token, 'Undefined variable ' + token.lexeme);
    }

    get isGlobalEnviroment() {
        return this.enclosing === null;
    }
}