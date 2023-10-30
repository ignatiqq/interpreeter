"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssignmentExpr = exports.VariableExpr = exports.UnaryExpr = exports.LiteralExpr = exports.GroupingExpr = exports.BinaryExpr = exports.Expr = void 0;
/**
 * Expression abstract class for our syntax tree
 * Classes which will be inherited must define
 * left, right (because it's tree) and operator
 * which can be (unary, binary, plus, minus, not, null. etc.) expressions
 */
var Expr = /** @class */ (function () {
    function Expr() {
    }
    return Expr;
}());
exports.Expr = Expr;
/**
 * Binary operation expression in our Syntax tree
 */
var BinaryExpr = /** @class */ (function (_super) {
    __extends(BinaryExpr, _super);
    function BinaryExpr(left, operator, right) {
        var _this = _super.call(this) || this;
        _this.left = left;
        _this.right = right;
        _this.operator = operator;
        return _this;
    }
    BinaryExpr.prototype.accept = function (visitor) {
        return visitor.visitBinaryExpr(this);
    };
    return BinaryExpr;
}(Expr));
exports.BinaryExpr = BinaryExpr;
var GroupingExpr = /** @class */ (function (_super) {
    __extends(GroupingExpr, _super);
    function GroupingExpr(expression) {
        var _this = _super.call(this) || this;
        _this.expression = expression;
        return _this;
    }
    GroupingExpr.prototype.accept = function (visitor) {
        return visitor.visitGroupingExpr(this);
    };
    return GroupingExpr;
}(Expr));
exports.GroupingExpr = GroupingExpr;
var LiteralExpr = /** @class */ (function (_super) {
    __extends(LiteralExpr, _super);
    function LiteralExpr(literal) {
        var _this = _super.call(this) || this;
        _this.literal = literal;
        return _this;
    }
    LiteralExpr.prototype.accept = function (visitor) {
        return visitor.visitLiteralExpr(this);
    };
    return LiteralExpr;
}(Expr));
exports.LiteralExpr = LiteralExpr;
var UnaryExpr = /** @class */ (function (_super) {
    __extends(UnaryExpr, _super);
    function UnaryExpr(operator, expression) {
        var _this = _super.call(this) || this;
        _this.operator = operator;
        _this.expression = expression;
        return _this;
    }
    UnaryExpr.prototype.accept = function (visitor) {
        return visitor.visitUnaryExpr(this);
    };
    return UnaryExpr;
}(Expr));
exports.UnaryExpr = UnaryExpr;
// Variable (IDENTIFIER is expression here 
// because variable defines by it's "name"
// "name" represents value
// "name" === value
// for example some_val = 5;
// some_val === 5;
// 5
var VariableExpr = /** @class */ (function (_super) {
    __extends(VariableExpr, _super);
    function VariableExpr(token) {
        var _this = _super.call(this) || this;
        _this.token = token;
        return _this;
    }
    VariableExpr.prototype.accept = function (visitor) {
        return visitor.visitVariableExpr(this);
    };
    return VariableExpr;
}(Expr));
exports.VariableExpr = VariableExpr;
var AssignmentExpr = /** @class */ (function (_super) {
    __extends(AssignmentExpr, _super);
    function AssignmentExpr(token, expr) {
        var _this = _super.call(this) || this;
        _this.token = token;
        _this.expr = expr;
        return _this;
    }
    AssignmentExpr.prototype.accept = function (visitor) {
        return visitor.visitAssignmentExpr(this);
    };
    return AssignmentExpr;
}(Expr));
exports.AssignmentExpr = AssignmentExpr;
