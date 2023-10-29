"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Token = /** @class */ (function () {
    function Token(options) {
        var type = options.type, lexeme = options.lexeme, literal = options.literal, line = options.line;
        this.type = type;
        this.lexeme = lexeme;
        this.literal = literal;
        this.line = line;
    }
    Token.prototype.toString = function () {
        return "".concat(this.type, " ").concat(this.lexeme, " ").concat(this.literal);
    };
    return Token;
}());
exports.default = Token;
