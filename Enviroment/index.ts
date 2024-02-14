import { RuntimeError } from "../error/error";
import { LoxCallable } from "../loxCallable";
import Token from "../tokens/Token/Token";

export type VariableValueType = string | number | boolean | LoxCallable | object | null;

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
        this.enclosing = enclosing;
    }

    define(name: string, val: VariableValueType) {
        this.map.set(name, val);
    }

    assign(token: Token, val: VariableValueType) {
        if(this.map.has(token.lexeme)) {
            return this.map.set(token.lexeme, val);
        }

        // @ts-ignore @TODO
        if(!this.isGlobalEnviroment()) return this.enclosing.assign(token, val);

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
        if(!this.isGlobalEnviroment()) return this.enclosing.get(token);

        throw new RuntimeError(token, 'Undefined variable ' + token.lexeme);
    }

    isGlobalEnviroment() {
        return this.enclosing === null;
    }

    // getAt method который берет расстояние до локальной переменной определнной по шагам
    // из Resolver класса
    getAt(distance: number, name: string) {
        return this.ancestor(distance).map.get(name);
    }

    /**
     * мы будем уходить вверх ровно на distance кол-во шагов
     * которые получили из Resolver класса
     * Так же мы точно знаем что переменная существует, так как она попала в мапу и до нее есть расстояние
     */
    ancestor(distance: number) {
        let env: Enviroment = this;

        for(let i = 0; i < distance; i++) {
            // It will be Enviroment in any cases
            // because we checking locals now which already locals not globals
            // because of resolver
            // @ts-expect-error
            env = env.enclosing;
        }

        return env;
    }

    /**
     * присваивание переменной значения
     * знаем на каком уровне оно находится
     */
    assignAt<T extends VariableValueType>(distance: number, name: string, val: T) {
        this.ancestor(distance).map.set(name, val);
    }

}