"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Interpreeter = void 0;
var error_1 = require("../../error/error");
var Interpreter_1 = require("../../Interpreter");
var tokensType_1 = require("../../tokens/constants/tokensType");
/**
 * Interptreete -класс интерпритатора реализовывающий все методы посетителя
 * (Рекурсивный обход и выполнение AST дерева)
 * имеющихся Expression и Statemen'тов
 * наш интерпретатор выполняет пост-заказный обход — каждый узел оценивает своих дочерних узлов,
 * прежде чем выполнять свою собственную работу.
 *
 */
var Interpreeter = /** @class */ (function () {
    function Interpreeter(enviroment) {
        this.enviroment = enviroment;
    }
    Interpreeter.prototype.interprete = function (stmts) {
        try {
            for (var _i = 0, stmts_1 = stmts; _i < stmts_1.length; _i++) {
                var stmt = stmts_1[_i];
                this.execute(stmt);
            }
        }
        catch (error) {
            Interpreter_1.default.runtimeError(error.token, error.message);
        }
    };
    Interpreeter.prototype.execute = function (stmt) {
        return stmt.accept(this);
    };
    Interpreeter.prototype.evaluate = function (expr) {
        try {
            return expr.accept(this);
        }
        catch (error) {
            Interpreter_1.default.runtimeError(error.token, error.message);
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
                else if (typeof left === 'number' && typeof right === 'number') {
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
    };
    ;
    // имя переменной это expression
    // потомучто нужно вычислить чем является имя, 
    // а значит имя = значение (имя преобразуется в значение, а значение = Expression)
    Interpreeter.prototype.visitVariableExpr = function (expr) {
        // берем переменную из enviroment по имени
        return this.enviroment.get(expr.name);
    };
    // stmt visitors
    Interpreeter.prototype.visitExpressionStmt = function (stmt) {
        this.evaluate(stmt.expression);
    };
    ;
    Interpreeter.prototype.visitPrintStmt = function (stmt) {
        // выполняем и получаем значение потомучто в print мы передаем
        // только expression мы не можем передать statement (консрукцию языка)
        // потомучто оно не ресолвиться в значение (value)
        var expr = this.evaluate(stmt.expression);
        console.log("".concat(expr));
    };
    ;
    return Interpreeter;
}());
exports.Interpreeter = Interpreeter;
