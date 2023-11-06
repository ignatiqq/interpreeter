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
exports.ReturnStmt = exports.WhileStmt = exports.IfStmt = exports.BlockStmt = exports.FunctionStmt = exports.VarStmt = exports.PrintStmt = exports.ExpressionStmt = exports.Stmt = void 0;
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
var FunctionStmt = /** @class */ (function (_super) {
    __extends(FunctionStmt, _super);
    function FunctionStmt(identifier, params, body) {
        var _this = _super.call(this) || this;
        _this.identifier = identifier;
        _this.params = params;
        _this.body = body;
        return _this;
    }
    FunctionStmt.prototype.accept = function (visitor) {
        return visitor.visitFunctionStmt(this);
    };
    return FunctionStmt;
}(Stmt));
exports.FunctionStmt = FunctionStmt;
var BlockStmt = /** @class */ (function (_super) {
    __extends(BlockStmt, _super);
    function BlockStmt(stmts) {
        var _this = _super.call(this) || this;
        _this.stmts = stmts;
        return _this;
    }
    BlockStmt.prototype.accept = function (visitor) {
        return visitor.visitBlockStmt(this);
    };
    return BlockStmt;
}(Stmt));
exports.BlockStmt = BlockStmt;
var IfStmt = /** @class */ (function (_super) {
    __extends(IfStmt, _super);
    function IfStmt(condition, thenBranch, elseBranch) {
        if (elseBranch === void 0) { elseBranch = null; }
        var _this = _super.call(this) || this;
        _this.condition = condition;
        _this.thenBranch = thenBranch;
        _this.elseBranch = elseBranch;
        return _this;
    }
    IfStmt.prototype.accept = function (visitor) {
        return visitor.visitIfStmt(this);
    };
    return IfStmt;
}(Stmt));
exports.IfStmt = IfStmt;
var WhileStmt = /** @class */ (function (_super) {
    __extends(WhileStmt, _super);
    function WhileStmt(condition, body) {
        var _this = _super.call(this) || this;
        _this.condition = condition;
        _this.body = body;
        return _this;
    }
    WhileStmt.prototype.accept = function (visitor) {
        return visitor.visitWhileStmt(this);
    };
    return WhileStmt;
}(Stmt));
exports.WhileStmt = WhileStmt;
var ReturnStmt = /** @class */ (function (_super) {
    __extends(ReturnStmt, _super);
    function ReturnStmt(keyword, expr) {
        var _this = _super.call(this) || this;
        _this.expr = expr;
        _this.keyword = keyword;
        return _this;
    }
    ReturnStmt.prototype.accept = function (visitor) {
        return visitor.visitReturnStmt(this);
    };
    return ReturnStmt;
}(Stmt));
exports.ReturnStmt = ReturnStmt;
