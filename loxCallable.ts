import { Interpreeter } from "./AST/interpreeter";
import { Enviroment } from "./Enviroment";
import { FunctionStmt } from "./statements/statements";

export interface ILoxCallable {
    call(interpreter: Interpreeter, args: any[]): any;
    arity(): number;
    toString(): string;
}

export abstract class LoxCallable implements ILoxCallable {
   abstract call(interpreter: Interpreeter, args: any[]): any;
   abstract arity(): number;

   toString() {
    return '<native> fn';
   }
}

export class LoxFunction implements ILoxCallable {
    declaration: FunctionStmt;

    constructor(declaration: FunctionStmt) {
        this.declaration = declaration;
    }

    /**
        * среда должна создаваться динамически. 
        * Каждый вызов функции получает свое собственное окружение. 
         * В противном случае рекурсия сломается. 
         * Если одновременно выполняется несколько вызовов одной и той же функции, 
         * каждому из них потребуется своя собственная среда, 
         * даже если все они являются вызовами одной и той же функции.
         * 
         * fun count(n) {
         *  if (n > 1) count(n - 1);
         *   print n;
         *  }
         *
         *  count(3);
         * 
         * Представьте, что мы приостанавливаем интерпретатор прямо в тот момент,
         * когда он собирается напечатать 1 в самом внутреннем вложенном вызове.
         * Внешние вызовы print 2 и 3 еще не напечатали свои значения, 
         * поэтому где-то в памяти должны быть среды, которые все еще хранят факт,
         * "n" привязанный к 3 в одном контексте, 2 в другом и 1 в самом внутреннем,
         * 
         * Вот почему мы создаем новое окружение при каждом вызове , а не при объявлении функции
    */
    call(interpreter: Interpreeter, args: any[]) {
        // CHANGED BY MYSELF
        const env = new Enviroment(interpreter.enviroment);

        for(let i = 0; i < this.declaration.args.length; i++) {
            // заключаем имя параметров функции в отдельный enviroment
            // лексическую область видимости
            // тоесть например func(a,b)
            // в енвайромент
            // {
            //  a: args[i],
            //  b: args[i],   
            // }
            // для последующего executeBlock
            // чтобы значения параметров === значения аргументов
            env.define(this.declaration.args[i].lexeme, args[i]);
        }

        interpreter.executeBlock(this.declaration.body, env);
        return null;
    }

    arity(): number {
       return this.declaration.args.length;
    }

    toString() {
        return '<fn ' + this.declaration.identifier.lexeme + '>'
    }
}