## closure:

Эта структура данных называется замыканием, поскольку она «закрывается» и удерживает окружающие переменные, в которых объявлена ​​функция. Замыкания существовали с первых дней существования Лиспа, и языковые хакеры придумали всевозможные способы их реализации. Для jlox мы сделаем самую простую вещь, которая работает. В LoxFunction мы добавляем поле для хранения окружения.

Мы инициализируем ее в конструкторе.


LoxCallable.ts: 
``
constructor(declaration: FunctionStmt, closure: Enviroment) {
``

Когда мы создаем LoxFunction, мы фиксируем текущую среду.

AST/intepreeter/index.ts:
``
    visitFunctionStmt(stmt: FunctionStmt): null {
        // this.enviroment.define(stmt.identifier.lexeme, stmt.)
        const fn = new LoxFunction(stmt, this.enviroment);
        // define function indentifier in enviroment
        this.enviroment.define(stmt.identifier.lexeme, fn);
        return null;
    }
``

Это среда, которая активна, когда функция объявлена, а не когда она вызывается , а это то, что нам нужно. Он представляет лексическую область видимости, окружающую объявление функции. Наконец, когда мы вызываем функцию, мы используем эту среду в качестве родителя вызова.


Это создает цепочку окружения, которая идет от тела функции через среды, в которых объявлена ​​функция, вплоть до глобальной области видимости. Цепочка среды выполнения соответствует текстовой вложенности исходного кода так, как мы хотим. Конечный результат, когда мы вызываем эту функцию, выглядит следующим образом:


![структура работы замыканий в Lox](https://craftinginterpreters.com/image/functions/closure.png "Title")

https://craftinginterpreters.com/functions.html#:~:text=params.size()%3B%20i%2B%2B)%20%7B-,This%20creates%20an,-environment%20chain%20that