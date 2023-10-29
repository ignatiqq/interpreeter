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
exports.RuntimeError = exports.ParseError = exports.SyntaxError = void 0;
var SyntaxError = /** @class */ (function (_super) {
    __extends(SyntaxError, _super);
    function SyntaxError(message, line, where) {
        var _this = _super.call(this) || this;
        _this.name = "SyntaxError";
        _this.message = message;
        _this.line = line;
        _this.where = where;
        return _this;
    }
    return SyntaxError;
}(Error));
exports.SyntaxError = SyntaxError;
var ParseError = /** @class */ (function (_super) {
    __extends(ParseError, _super);
    function ParseError() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return ParseError;
}(Error));
exports.ParseError = ParseError;
var RuntimeError = /** @class */ (function (_super) {
    __extends(RuntimeError, _super);
    function RuntimeError(token, message) {
        var _this = _super.call(this) || this;
        _this.token = token;
        _this.message = message;
        return _this;
    }
    return RuntimeError;
}(Error));
exports.RuntimeError = RuntimeError;
