"use strict";
exports.__esModule = true;
var interpreeter_1 = require("./AST/interpreeter");
var resolver_1 = require("./AST/resolver/resolver");
var Enviroment_1 = require("./Enviroment");
var Parser_1 = require("./parser/Parser");
var Scanner_1 = require("./scanner/Scanner/Scanner");
var tokensType_1 = require("./tokens/constants/tokensType");
var Language = /** @class */ (function () {
    function Language() {
    }
    Language.error = function (token, message) {
        if (token.type === tokensType_1.TOKEN_TYPES.EOF) {
            this.signalError(token.line, 'at end' + message);
        }
        else {
            this.signalError(token.line, 'at' + " \"".concat(token.lexeme, "\". ") + message);
        }
    };
    Language.runtimeError = function (token, message) {
        console.error("\u001B[33m [Line ".concat(token.line, "] Error: ").concat(message, " \u001B[0m"));
        this.hadRuntimeError = true;
    };
    Language.signalError = function (line, message) {
        // we can add lexeme here instead empty "where"
        this.reportError({ line: line, where: "", message: message });
    };
    Language.reportError = function (options) {
        var line = options.line, where = options.where, message = options.message;
        Language.hadError = true;
        console.error("\u001B[33m [Line ".concat(line, "] Error: ").concat(message, " \u001B[0m"));
    };
    Language.prototype.interprete = function (source) {
        return this.runFile(source);
    };
    Language.prototype.runFile = function (source) {
        return this.run(source);
    };
    Language.prototype.run = function (source) {
        var scanner = new Scanner_1["default"](source);
        var tokens = scanner.scanTokens();
        if (Language.hadError || Language.hadRuntimeError) {
            return;
        }
        return this.parse(tokens);
    };
    Language.prototype.parse = function (tokens) {
        var parser = new Parser_1.Parser(tokens);
        // statements tree
        var syntaxTree = parser.parse();
        if (Language.hadError || !syntaxTree) {
            return;
        }
        // собираем и валидируем локальные области видимости
        // для интерпритатора
        Language.resolver.resolveManyStmt(syntaxTree);
        // если произошла ошибка во время семантического анализа
        if (Language.hadError) {
            return;
        }
        return Language.interpreter.interprete(syntaxTree);
        // return Interpreter.interpreterMath.evaluate(syntaxTree);
    };
    Language.hadError = false;
    Language.hadRuntimeError = false;
    Language.interpreter = new interpreeter_1.Interpreeter(new Enviroment_1.Enviroment());
    Language.resolver = new resolver_1.Resolver(Language.interpreter);
    return Language;
}());
exports["default"] = Language;
