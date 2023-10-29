"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ASTPrinter = void 0;
// @ts-ignore
var ASTPrinter = /** @class */ (function () {
    function ASTPrinter() {
    }
    ASTPrinter.prototype.print = function (expr) {
        return this.visit(expr);
    };
    ASTPrinter.prototype.visit = function (expr) {
        // @ts-ignore
        return expr.accept(this);
    };
    ASTPrinter.prototype.parenthesize = function (name) {
        var exprs = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            exprs[_i - 1] = arguments[_i];
        }
        var result = '';
        result += "(".concat(name);
        for (var _a = 0, exprs_1 = exprs; _a < exprs_1.length; _a++) {
            var expr = exprs_1[_a];
            // recursively parse all tree nodes to flat values to string
            // @ts-ignore
            result += " ".concat(expr.accept(this));
        }
        result += ')';
        return result;
    };
    ASTPrinter.prototype.visitBinaryExpr = function (expr) {
        return this.parenthesize(expr.operator.lexeme, expr.left, expr.right);
    };
    ASTPrinter.prototype.visitGroupingExpr = function (expr) {
        return this.parenthesize('group', expr.expression);
    };
    ASTPrinter.prototype.visitLiteralExpr = function (expr) {
        if (expr.literal === null)
            return 'nil';
        if (typeof expr.literal === "string")
            return "\"".concat(expr.literal, "\"");
        return this.parenthesize("".concat(expr.literal));
    };
    ASTPrinter.prototype.visitUnaryExpr = function (expr) {
        return this.parenthesize(expr.operator.lexeme, expr.expression);
    };
    return ASTPrinter;
}());
exports.ASTPrinter = ASTPrinter;
