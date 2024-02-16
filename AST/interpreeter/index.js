"use strict";
exports.__esModule = true;
exports.Interpreeter = void 0;
var Enviroment_1 = require("../../Enviroment");
var error_1 = require("../../error/error");
var Interpreter_1 = require("../../Interpreter");
var loxCallable_1 = require("../../loxCallable");
var nativeFunctions_1 = require("../../nativeFunctions");
var tokensType_1 = require("../../tokens/constants/tokensType");
/**
 * Interptreete - класс интерпритатора реализовывающий все методы посетителя
 * (Рекурсивный обход и выполнение AST дерева)
 * имеющихся Expression и Statemen'тов
 * наш интерпретатор выполняет пост-заказный обход — каждый узел оценивает своих дочерних узлов,
 * прежде чем выполнять свою собственную работу.
 *
 */
var Interpreeter = /** @class */ (function () {
    function Interpreeter(enviroment) {
        /**
         * resolving variables
         *
         * храним здесь только initialized (определенные)
         * перменные к которым мы можем получить доступ
         */
        this.locals = new Map();
        this.globals = enviroment;
        this.enviroment = this.globals;
        this.globals.define('clock', new nativeFunctions_1.Clock());
    }
    // ресолв всех переменных которые мы заранее (одним проходом) собрали и прикрепили
    // к разным областям видимости
    Interpreeter.prototype.resolve = function (expr, depth) {
        this.locals.set(expr, depth);
    };
    Interpreeter.prototype.interprete = function (stmts) {
        try {
            for (var _i = 0, stmts_1 = stmts; _i < stmts_1.length; _i++) {
                var stmt = stmts_1[_i];
                this.execute(stmt);
            }
        }
        catch (error) {
            Interpreter_1["default"].runtimeError(error.token, error.message);
        }
    };
    Interpreeter.prototype.execute = function (stmt) {
        return stmt.accept(this);
    };
    // @ts-ignore it will anyway reset code interpreeting
    Interpreeter.prototype.evaluate = function (expr) {
        try {
            return expr.accept(this);
        }
        catch (error) {
            Interpreter_1["default"].runtimeError(error.token, error.message);
        }
    };
    Interpreeter.prototype.checkNumberOperand = function (token, operand) {
        if (typeof operand === 'number')
            return true;
        throw new error_1.RuntimeError(token, 'Operand must be a number.');
    };
    Interpreeter.prototype.checkNumberOperands = function (token, left, right) {
        if (this.checkNumberOperand(token, left) && this.checkNumberOperand(token, right))
            return true;
    };
    Interpreeter.prototype.visitBinaryExpr = function (expr) {
        var left = this.evaluate(expr.left);
        var right = this.evaluate(expr.right);
        switch (expr.operator.type) {
            case tokensType_1.TOKEN_TYPES.STAR:
                this.checkNumberOperands(expr.operator, left, right);
                return Number(left) * Number(right);
            case tokensType_1.TOKEN_TYPES.MINUS:
                this.checkNumberOperands(expr.operator, left, right);
                return Number(left) - Number(right);
            case tokensType_1.TOKEN_TYPES.SLASH:
                if (right === 0)
                    throw new error_1.RuntimeError(expr.operator, "Division operand cannot be 0");
                this.checkNumberOperands(expr.operator, left, right);
                if (left === 0 || right === 0) {
                    return 0;
                }
                return Number(left) / Number(right);
            case tokensType_1.TOKEN_TYPES.EQUAL_EQUAL:
                return this.isEqual(left, right);
            case tokensType_1.TOKEN_TYPES.NOT_EQUAL:
                return !this.isEqual(left, right);
            case tokensType_1.TOKEN_TYPES.LESS_EQUAL:
                this.checkNumberOperands(expr.operator, left, right);
                return Number(left) <= Number(right);
            case tokensType_1.TOKEN_TYPES.GREATER_EQUAL:
                this.checkNumberOperands(expr.operator, left, right);
                return Number(left) >= Number(right);
            case tokensType_1.TOKEN_TYPES.LESS:
                this.checkNumberOperands(expr.operator, left, right);
                return Number(left) < Number(right);
            case tokensType_1.TOKEN_TYPES.GREATER:
                this.checkNumberOperands(expr.operator, left, right);
                return Number(left) > Number(right);
            case tokensType_1.TOKEN_TYPES.PLUS:
                if (typeof left === 'string' && typeof right === 'number' ||
                    typeof left === 'number' && typeof right === 'string') {
                    return String(left) + String(right);
                }
                if (typeof left === 'string' && typeof right === 'string') {
                    return left + right;
                }
                if (typeof left === 'number' && typeof right === 'number') {
                    return left + right;
                }
                throw new error_1.RuntimeError(expr.operator, "Operands of '+' operator must be numbers or strings.");
            default: return null;
        }
    };
    Interpreeter.prototype.visitLiteralExpr = function (expr) {
        return expr.literal;
    };
    ;
    Interpreeter.prototype.visitGroupingExpr = function (expr) {
        return this.evaluate(expr.expression);
    };
    ;
    Interpreeter.prototype.visitUnaryExpr = function (expr) {
        switch (expr.operator.type) {
            case tokensType_1.TOKEN_TYPES.NOT: {
                return !this.isTruthy(this.evaluate(expr.expression));
            }
            case tokensType_1.TOKEN_TYPES.MINUS: {
                return -(Number(this.evaluate(expr.expression)));
            }
            default: return null;
        }
    };
    ;
    Interpreeter.prototype.visitAssignmentExpr = function (expr) {
        var val = expr.expr !== null ? this.evaluate(expr.expr) : null;
        var distance = this.locals.get(expr);
        if (!Number.isInteger(distance)) {
            this.globals.assign(expr.token, val);
        }
        else {
            // @ts-ignore
            this.enviroment.assignAt(distance, expr.token.lexeme, val);
        }
        // @ts-ignore
        // this.enviroment.assign(expr.token, val);
        return val;
    };
    Interpreeter.prototype.isEqual = function (val, val2) {
        if (val === null && val2 === null)
            return true;
        return val === val2;
    };
    Interpreeter.prototype.isTruthy = function (val) {
        if (val === null)
            return false;
        return Boolean(val);
    };
    Interpreeter.prototype.visitVarStmt = function (stmt) {
        var value = null;
        // var initalizer not null
        if (stmt.initializer !== null) {
            var res = this.evaluate(stmt.initializer);
            if (res !== undefined && res !== null) {
                value = res;
            }
        }
        // define variable (actually global) at the variables hashmap
        // сетим переменную в enviroment
        this.enviroment.define(stmt.token.lexeme, value);
        return this.enviroment.get(stmt.token);
    };
    ;
    // имя переменной это expression
    // потомучто нужно вычислить чем является имя, 
    // а значит имя = значение (имя преобразуется в значение, а значение = Expression)
    Interpreeter.prototype.visitVariableExpr = function (expr) {
        // берем переменную из enviroment по имени
        // return this.enviroment.get(expr.token);
        return this.lookupForVariable(expr.token, expr);
    };
    Interpreeter.prototype.lookupForVariable = function (token, expr) {
        var distance = this.locals.get(expr);
        if (!Number.isInteger(distance)) {
            return this.globals.get(token);
        }
        else {
            // @ts-ignore
            return this.enviroment.getAt(distance, token.lexeme);
        }
    };
    // stmt visitors
    Interpreeter.prototype.visitExpressionStmt = function (stmt) {
        return this.evaluate(stmt.expression);
    };
    ;
    Interpreeter.prototype.visitPrintStmt = function (stmt) {
        // выполняем и получаем значение потомучто в print мы передаем
        // только expression мы не можем передать statement (консрукцию языка)
        // потомучто оно не ресолвиться в значение (value)
        var expr = this.evaluate(stmt.expression);
        console.log(expr);
    };
    ;
    Interpreeter.prototype.executeBlock = function (stmts, enviroment) {
        var prev = this.enviroment;
        // finally 
        // здесь только для того чтобы гарантировать рампутывание енвайромента
        // в блоке может и не быть ошибки
        try {
            // рекурсивно проваливаемся в новый енвайромент
            this.enviroment = enviroment;
            for (var _i = 0, stmts_2 = stmts; _i < stmts_2.length; _i++) {
                var stmt = stmts_2[_i];
                this.execute(stmt);
            }
        }
        finally {
            // распутываем рекурсию
            this.enviroment = prev;
        }
    };
    Interpreeter.prototype.visitBlockStmt = function (stmt) {
        this.executeBlock(stmt.stmts, new Enviroment_1.Enviroment(this.enviroment));
        return null;
    };
    Interpreeter.prototype.visitIfStmt = function (stmt) {
        // check on truethly
        // because we want to let it run "if(123)" or "if('hello')"
        var isConditionTruthly = this.isTruthy(this.evaluate(stmt.condition));
        if (isConditionTruthly) {
            this.execute(stmt.thenBranch);
        }
        else if (stmt.elseBranch !== null) {
            this.execute(stmt.elseBranch);
        }
        return null;
    };
    Interpreeter.prototype.visitLogicalExpr = function (expr) {
        if (expr.operator.type === tokensType_1.TOKEN_TYPES.OR) {
            return this.evaluate(expr.left) || this.evaluate(expr.right);
        }
        if (expr.operator.type === tokensType_1.TOKEN_TYPES.AND) {
            return this.evaluate(expr.left) && this.evaluate(expr.right);
        }
    };
    Interpreeter.prototype.visitWhileStmt = function (stmt) {
        while (this.isTruthy(this.evaluate(stmt.condition))) {
            this.execute(stmt.body);
        }
        return null;
    };
    Interpreeter.prototype.visitClassStmt = function (stmt) {
        this.enviroment.define(stmt.token.lexeme, null);
        // resolve this for class methods
        var methods = new Map();
        for (var _i = 0, _a = stmt.methods; _i < _a.length; _i++) {
            var method = _a[_i];
            var fn = new loxCallable_1.LoxFunction(method, this.enviroment);
            methods.set(method.identifier.lexeme, fn);
        }
        var klass = new loxCallable_1.LoxClass(stmt.token.lexeme, methods);
        this.enviroment.assign(stmt.token, klass);
        return null;
    };
    Interpreeter.prototype.visitFunctionStmt = function (stmt) {
        // this.enviroment.define(stmt.identifier.lexeme, stmt.)
        var fn = new loxCallable_1.LoxFunction(stmt, this.enviroment);
        // define function indentifier in enviroment
        this.enviroment.define(stmt.identifier.lexeme, fn);
        return null;
    };
    Interpreeter.prototype.visitCallExpr = function (expr) {
        // actually identifier
        var callee = this.evaluate(expr.callee);
        var evaluatedArgs = [];
        for (var _i = 0, _a = expr.args; _i < _a.length; _i++) {
            var arg = _a[_i];
            evaluatedArgs.push(this.evaluate(arg));
        }
        if (!(callee instanceof loxCallable_1.LoxFunction) && !(callee instanceof loxCallable_1.LoxClass)) {
            throw new error_1.RuntimeError(expr.paren, 'Can only call functions and classes.');
        }
        if (evaluatedArgs.length !== callee.arity()) {
            throw new error_1.RuntimeError(expr.paren, 'Expected ' + callee.arity() + ' arguments but got ' + arguments.length);
        }
        return callee.call(this, evaluatedArgs);
    };
    Interpreeter.prototype.visitThisExpr = function (expr) {
        return this.lookupForVariable(expr.token, expr);
    };
    /**
     * Так как только в джсе можно литерально создать объект
     *
     * а в других языках объекты генерят только классы мы будем првоерять на инстанс и
     * выхывать гет метод у LoxInstance рантайм класса
     * @param expr
     */
    Interpreeter.prototype.visitGetExpr = function (expr) {
        var object = this.evaluate(expr.object);
        if (object instanceof loxCallable_1.LoxInstance) {
            // реализовать у рантайм класса инстанса метод get
            return object.get(expr.token);
        }
        throw new error_1.RuntimeError(expr.token, 'Only instances have properties.');
    };
    Interpreeter.prototype.visitSetExpr = function (expr) {
        var object = this.evaluate(expr.object);
        if (object instanceof loxCallable_1.LoxInstance) {
            var value = this.evaluate(expr.value);
            object.set(expr.token, value);
            return value;
        }
        throw new error_1.RuntimeError(expr.token, 'Only instances can set properties.');
    };
    // мы используем исключение для раскручивания стека
    // чтобы выйти из всех циклов и функций
    Interpreeter.prototype.visitReturnStmt = function (stmt) {
        var value = null;
        if (stmt.expr !== null)
            value = this.evaluate(stmt.expr);
        // раскручиваем стек со значением которое вернем
        throw new error_1.Return(value);
    };
    return Interpreeter;
}());
exports.Interpreeter = Interpreeter;
