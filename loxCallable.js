"use strict";
exports.__esModule = true;
exports.LoxFunction = exports.LoxCallable = void 0;
var Enviroment_1 = require("./Enviroment");
var LoxCallable = /** @class */ (function () {
    function LoxCallable() {
    }
    LoxCallable.prototype.toString = function () {
        return '<native> fn';
    };
    return LoxCallable;
}());
exports.LoxCallable = LoxCallable;
var LoxFunction = /** @class */ (function () {
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
    function LoxFunction(declaration, closure) {
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
    LoxFunction.prototype.call = function (interpreter, args) {
        // для каждого нового вызова функции мы будем смотреть в его окружение
        // для функции на самом высоком уровне это будет - global enviroment
        // для всех остальных по цепочке вложенности
        var env = new Enviroment_1.Enviroment(this.closure);
        for (var i = 0; i < this.declaration.params.length; i++) {
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
        }
        catch (val) {
            return val.value;
        }
        // если в фунции нет return'а
        return null;
    };
    LoxFunction.prototype.arity = function () {
        return this.declaration.params.length;
    };
    LoxFunction.prototype.toString = function () {
        return '<fn ' + this.declaration.identifier.lexeme + '>';
    };
    return LoxFunction;
}());
exports.LoxFunction = LoxFunction;
