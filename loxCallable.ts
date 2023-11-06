import { Interpreeter } from "./AST/interpreeter";
import { Enviroment } from "./Enviroment";
import { FunctionStmt } from "./statements/statements";
import { Return } from "./error/error";

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
    closure: Enviroment;

    // "closure" - ссылка на родительский енвайромент, 
    // а значит на весь енвайромент до, так как в енвайроменте
    // можно обращаться к областям переменных которые находятся 
    // на уровень блока вложенности выше
    constructor(declaration: FunctionStmt, closure: Enviroment) {
        this.declaration = declaration;
        this.closure = closure;
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
        // для каждого нового вызова функции мы будем смотреть в его окружение
        // для функции на самом высоком уровне это будет - global enviroment
        // для всех остальных по цепочке вложенности
        const env = new Enviroment(this.closure);

        for(let i = 0; i < this.declaration.params.length; i++) {
            // заключаем имя параметров функции в отдельный enviroment
            // лексическую область видимости
            // тоесть например func(a,b)
            // в енвайромент
            // {
            //  a: params[i],
            //  b: params[i],   
            // }
            // для последующего executeBlock
            // чтобы значения параметров === значения аргументов
            env.define(this.declaration.params[i].lexeme, args[i]);
        }

        try {
            // trycatch здесь служит для того, чтобы получить возвращаемое значение
            // из функции
            // так как интерпритация return'а представляет из себя псевдо-ошибку
            // выбрасывающуюся из интерпритатора вместе со значением, которое мы соответственно
            // возвращаем
            interpreter.executeBlock(this.declaration.body, env);
            // @ts-ignore
        } catch(val: Return) {
            return val.value;
        }

        // если в фунции нет return'а

        return null;
    }

    arity(): number {
       return this.declaration.params.length;
    }

    toString() {
        return '<fn ' + this.declaration.identifier.lexeme + '>'
    }
}