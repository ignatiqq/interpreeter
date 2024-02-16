import { Interpreeter } from "./AST/interpreeter";
import { Enviroment } from "./Enviroment";
import { FunctionStmt } from "./statements/statements";
import { Return, RuntimeError } from "./error/error";
import Token from "./tokens/Token/Token";

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
    //
    // ТОЕСТЬ мы не присваиваем объявлении функции global енвайроменту
    // а передаем предыдущий, например
    // fun 1() {
    //   var hello = 'world';
    //     
    //   fun2() {
    //      print hello;
    //      (this.enviroment.get('hello')) <- следующая ссылка будет вести на евайромент fun 1 функции и потом на глобал
    //                                         соответственно при вызове fun 2 из любого места мы забиндили ему енвайромент 
    //   }
    //   return fun2;
    // }
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


        console.log('call function?', this.declaration.body)
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

    bind(instance: LoxInstance) {
        const env = new Enviroment(this.closure);
        env.define('this', instance);
        return new LoxFunction(this.declaration, env);
    }

    arity(): number {
       return this.declaration.params.length;
    }

    toString() {
        return '<fn ' + this.declaration.identifier.lexeme + '>'
    }
}

/**
 * Class constructor
 * 
 * because of no "new" syntax
 * we build new instance with call of ClassName -> LoxClass();
 * 
 * экземпляр (инстанс) хранит состояние
 * А класс поведение (методы)
 */
export class LoxClass implements ILoxCallable {
    name: string;
    methods: Map<string, LoxFunction>;

    constructor(name: string, methods: Map<string, LoxFunction>) {
        this.name = name;
        this.methods = methods;
    }

    call(interpreter: Interpreeter, args: any[]) {
        const instance = new LoxInstance(this);

        // если у класса есть "init" метод (constructore)
        // то мы вызовем его
        const initializer = this.findMethod('init');

        if(!!initializer) {
            initializer.bind(instance).call(interpreter, args);
        }
        
        return instance;
    }

    findMethod(name: string) {
        if(this.methods.has(name)) return this.methods.get(name);
        return null;
    }

    toString() {
        return this.name;
    }

    arity(): number {
        const initializer = this.findMethod('init');
        if (initializer == null) return 0;
        return initializer.arity();
    }
}

/**
 * Инстанс класса для рантайма
 * 
 * экземпляр (инстанс) хранит состояние
 * А класс поведение (методы)
 * Несмотря на то, что методы принадлежат классу, доступ к ним по-прежнему осуществляется через экземпляры этого класса.
 */
export class LoxInstance implements ILoxCallable  {
    klass: LoxClass;
    /**
     * любой инстанс класса будет иметь локальное состояние
     */
    fields = new Map<string, any>();

    constructor(klass: LoxClass) {
        this.klass = klass;
    }

    call(interpreter: Interpreeter, args: any[]) {
    }

    arity(): number {
        return 0;
    }

    get(token: Token) {
        if(this.fields.has(token.lexeme)) {
            return this.fields.get(token.lexeme);
        }

        // check for method
        const method = this.klass.findMethod(token.lexeme);
        if(method && method !== null) return method.bind(this);

        throw new RuntimeError(token, "Undefined property " + token.lexeme);
    }

    set<T>(token: Token, value: T) {
        this.fields.set(token.lexeme, value);
    }

    toString() {
        return this.klass.name + ' instance';
    }
}