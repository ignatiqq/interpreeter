"use strict";
exports.__esModule = true;
exports.Resolver = void 0;
var Interpreter_1 = require("../../Interpreter");
var Interpreter_2 = require("../../Interpreter");
var FunctionType;
(function (FunctionType) {
    FunctionType[FunctionType["NONE"] = 0] = "NONE";
    FunctionType[FunctionType["FUNCTION"] = 1] = "FUNCTION";
    FunctionType[FunctionType["METHOD"] = 2] = "METHOD";
})(FunctionType || (FunctionType = {}));
var ClassType;
(function (ClassType) {
    ClassType[ClassType["NONE"] = 0] = "NONE";
    ClassType[ClassType["CLASS"] = 1] = "CLASS";
})(ClassType || (ClassType = {}));
/**
 * Проверяем семантическую правильность кода пользователя
 *
 * Мы могли бы пойти дальше и сообщать о предупреждениях для кода, который не обязательно ошибочен,
 *  но, вероятно, бесполезен. Например, многие IDE предупреждают, если после return оператора имеется
 * недостижимый код или локальная переменная, значение которой никогда не читается.
 * Все это было бы довольно легко добавить в наш статический пропуск на посещение или в виде отдельных пропусков.
 */
var Resolver = /** @class */ (function () {
    function Resolver(interpreeter) {
        /**
         * stack
         * в хешмпапах будут храниться все переменные для определенный обалсти видимости
         *
         * false = означает что переменная была объявлена, но еще не инициализирована (значением)
        */
        this.scopes = new Array();
        /**
         * Мы так же хотим предотвратить return stmt
         * return 'anything';
         * не в функциях
         * поэтому будем отслеживать находимся ли мы сейчас в функции или нет
         * и в returnStmt визиторе смотреть если мы не в функции выдавать ошибку
         * @param interpreeter
         */
        this.currentFunction = FunctionType.NONE;
        /**
         * хендл всех this вне методов (без класса)
         * @param interpreeter
         */
        this.currentClass = ClassType.NONE;
        this.interpreeter = interpreeter;
    }
    Resolver.prototype.visitBlockStmt = function (stmt) {
        this.beginScope();
        this.resolveStmt(stmt);
        this.endScope();
        return null;
    };
    /**
     * объявление переменных
     *
     * происходит в 2 этапе
     * объявление -> инициализация
     * если после объявления, но до инициализации мы будем обращаться к перменной
     * мы выддаим ошибку компиляции
     */
    Resolver.prototype.visitVarStmt = function (stmt) {
        this.declare(stmt.token);
        if (stmt.initializer !== null) {
            this.resolveExpr(stmt.initializer);
        }
        this.define(stmt.token);
    };
    /**
     * Здесь мы проверим обращается ли ктото в данной области видимости
     * к переменной которая была объявлена, но еще не была инициализирована
     * var a;
     * var b = a;  <- an error
     * a = 'hello';
    */
    Resolver.prototype.visitVariableExpr = function (expr) {
        if (this.scopes.length > 0 && this.scopes[this.scopes.length - 1].get(expr.token.lexeme) === false) {
            Interpreter_2["default"].error(expr.token, "Can't read local variable in its own initializer.");
        }
        this.resolveLocal(expr, expr.token);
        return null;
    };
    Resolver.prototype.visitAssignmentExpr = function (expr) {
        // ресолвим ехпрессион
        // это может быть VariableExpr, соответственно в теории можем обратиться к не инициализированной переменной
        // соответственно может быть ошибка, которую мы уже обработалм в visitVariableExpr
        this.resolveExpr(expr.expr);
        // перезаписываем переменную
        // a = b;
        this.resolveLocal(expr, expr.token);
        return null;
    };
    Resolver.prototype.visitClassStmt = function (stmt) {
        var enclosingClass = this.currentClass;
        this.currentClass = ClassType.CLASS;
        this.declare(stmt.token);
        this.define(stmt.token);
        this.beginScope();
        this.scopes[this.scopes.length - 1].set('this', true);
        for (var _i = 0, _a = stmt.methods; _i < _a.length; _i++) {
            var method = _a[_i];
            var declaration = FunctionType.METHOD;
            this.resolveFunction(method, declaration);
        }
        this.endScope();
        this.currentClass = enclosingClass;
        return null;
    };
    Resolver.prototype.visitFunctionStmt = function (stmt) {
        this.declare(stmt.identifier);
        this.define(stmt.identifier);
        this.resolveFunction(stmt, FunctionType.FUNCTION);
    };
    // методы визитора которые не объявляют или записывают перменные |
    //                                                               v
    // мы ничего в них не вычисляем и возвращаем, нам нужно
    // пройти через них (или нет) чтобы дойти до мест с изменением скоупа
    Resolver.prototype.visitExpressionStmt = function (stmt) {
        this.resolveExpr(stmt.expression);
        return null;
    };
    Resolver.prototype.visitBinaryExpr = function (expr) {
        this.resolveExpr(expr.left);
        this.resolveExpr(expr.right);
        return null;
    };
    ;
    /**
     *  Если динамическое выполнение затрагивает только ту ветку, которая выполняется,
     *  статический анализ консервативен — он анализирует любую ветку, которая может быть запущена.
     *  Поскольку любой из них может быть достигнут во время выполнения, мы разрешаем оба.
     */
    Resolver.prototype.visitIfStmt = function (stmt) {
        this.resolveStmt(stmt.thenBranch);
        this.resolveExpr(stmt.condition);
        if (stmt.elseBranch !== null)
            this.resolveStmt(stmt.elseBranch);
        return null;
    };
    Resolver.prototype.visitGroupingExpr = function (expr) {
        this.resolveExpr(expr.expression);
        return null;
    };
    Resolver.prototype.visitReturnStmt = function (stmt) {
        if (this.currentFunction === FunctionType.NONE) {
            Interpreter_1["default"].error(stmt.keyword, 'Cant return from top-level code.');
        }
        if (stmt.expr !== null)
            this.resolveExpr(stmt.expr);
        return null;
    };
    Resolver.prototype.visitWhileStmt = function (stmt) {
        this.resolveExpr(stmt.condition);
        this.resolveStmt(stmt.body);
        return null;
    };
    Resolver.prototype.visitCallExpr = function (expr) {
        this.resolveExpr(expr.callee);
        for (var _i = 0, _a = expr.args; _i < _a.length; _i++) {
            var val = _a[_i];
            this.resolveExpr(val);
        }
        return null;
    };
    Resolver.prototype.visitLiteralExpr = function (expr) {
        return null;
    };
    Resolver.prototype.visitLogicalExpr = function (expr) {
        this.resolveExpr(expr.left);
        this.resolveExpr(expr.right);
        return null;
    };
    Resolver.prototype.visitPrintStmt = function (stmt) {
        this.resolveExpr(stmt.expression);
        return null;
    };
    Resolver.prototype.visitUnaryExpr = function (expr) {
        this.resolveExpr(expr.expression);
        return null;
    };
    ;
    Resolver.prototype.visitGetExpr = function (expr) {
        this.resolveExpr(expr.object);
        return null;
    };
    Resolver.prototype.visitSetExpr = function (expr) {
        this.resolveExpr(expr.object);
        this.resolveExpr(expr.value);
        return null;
    };
    Resolver.prototype.visitThisExpr = function (expr) {
        if (this.currentClass === ClassType.NONE) {
            Interpreter_1["default"].error(expr.token, "Can't use 'this' outside of a class");
        }
        this.resolveLocal(expr, expr.token);
        return null;
    };
    // вспомогательные методы для разрешениий областей видимости
    /**
     * объявление
     */
    Resolver.prototype.declare = function (token) {
        if (this.scopes.length === 0)
            return;
        var currScope = this.scopes[this.scopes.length - 1];
        /**
         * we cant define two variables with the same name in one block stmt
         *
         * fun bad() {
         *    var a = "first";
         *    var a = "second";
         * }
         */
        if (currScope.has(token.lexeme)) {
            Interpreter_1["default"].error(token, 'Already a variable with this name in this scope.');
        }
        currScope.set(token.lexeme, false);
    };
    /**
     * инициализация
     */
    Resolver.prototype.define = function (token) {
        if (this.scopes.length === 0)
            return;
        this.scopes[this.scopes.length - 1].set(token.lexeme, true);
    };
    Resolver.prototype.resolveFunction = function (stmt, type) {
        // сохраняем состояние "в функции"
        var tempType = this.currentFunction;
        // не пишем FunctionType.FUNCTION чтобы метод работал и с классами
        this.currentFunction = type;
        this.beginScope();
        for (var _i = 0, _a = stmt.params; _i < _a.length; _i++) {
            var param = _a[_i];
            this.declare(param);
            this.define(param);
        }
        this.resolveManyStmt(stmt.body);
        this.endScope();
        // раскручиваем currentFunction значение
        this.currentFunction = tempType;
    };
    /**
     * ресолвим (делаем тру в хешмапе (делаем инициализированной))
     * и передаем на каком уровне (глубине) скоупов находится переменная
     */
    Resolver.prototype.resolveLocal = function (expr, token) {
        for (var idx = this.scopes.length - 1; idx >= 0; idx--) {
            if (this.scopes[idx].has(token.lexeme)) {
                this.interpreeter.resolve(expr, (this.scopes.length - 1) - idx);
            }
        }
    };
    Resolver.prototype.resolveManyStmt = function (stmts) {
        for (var _i = 0, stmts_1 = stmts; _i < stmts_1.length; _i++) {
            var stmt = stmts_1[_i];
            this.resolveStmt(stmt);
        }
    };
    Resolver.prototype.resolveStmt = function (stmt) {
        // execute all stmts
        return stmt.accept(this);
    };
    Resolver.prototype.resolveExpr = function (expr) {
        // execute all expr
        return expr.accept(this);
    };
    /**
     * здесь создаются новые области видимости
     *
     * в хешмпапах будут храниться все переменные для определенный обалсти видимости
     */
    Resolver.prototype.beginScope = function () {
        this.scopes.push(new Map());
    };
    /**
     * Выходим из скоупа, когда выходим из блока
     */
    Resolver.prototype.endScope = function () {
        this.scopes.pop();
    };
    return Resolver;
}());
exports.Resolver = Resolver;
