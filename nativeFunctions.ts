import { Interpreeter } from "./AST/interpreeter";
import { LoxCallable } from "./loxCallable";

export class Clock extends LoxCallable {
    arity(): number {
        return 0;
    }

    call(interpreter: Interpreeter, args: any[]) {
        return Date.now();
    }
}