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
exports.VarStmt = exports.PrintStmt = exports.ExpressionStmt = exports.Stmt = void 0;
var Stmt = /** @class */ (function () {
    function Stmt() {
    }
    return Stmt;
}());
exports.Stmt = Stmt;
var ExpressionStmt = /** @class */ (function (_super) {
    __extends(ExpressionStmt, _super);
    function ExpressionStmt(expression) {
        var _this = _super.call(this) || this;
        _this.expression = expression;
        return _this;
    }
    ExpressionStmt.prototype.accept = function (visitor) {
        return visitor.visitExpressionStmt(this);
    };
    return ExpressionStmt;
}(Stmt));
exports.ExpressionStmt = ExpressionStmt;
var PrintStmt = /** @class */ (function (_super) {
    __extends(PrintStmt, _super);
    function PrintStmt(expression) {
        var _this = _super.call(this) || this;
        _this.expression = expression;
        return _this;
    }
    PrintStmt.prototype.accept = function (visitor) {
        return visitor.visitPrintStmt(this);
    };
    return PrintStmt;
}(Stmt));
exports.PrintStmt = PrintStmt;
// IDENTIFIER STMT
var VarStmt = /** @class */ (function (_super) {
    __extends(VarStmt, _super);
    function VarStmt(token, initializer) {
        var _this = _super.call(this) || this;
        _this.token = token;
        _this.initializer = initializer;
        return _this;
    }
    VarStmt.prototype.accept = function (visitor) {
        return visitor.visitVarStmt(this);
    };
    return VarStmt;
}(Stmt));
exports.VarStmt = VarStmt;
