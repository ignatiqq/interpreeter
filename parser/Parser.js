"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parser = void 0;
var error_1 = require("../error/error");
var Expressions_1 = require("../expressions/Expressions");
var Interpreter_1 = require("../Interpreter");
var statements_1 = require("../statements/statements");
var tokensType_1 = require("../tokens/constants/tokensType");
/**
 * Парсер преобразует набор токенов в правила языка
 * Каждое правило грамматики языка становиться методом этого класса
 * (Преобразуем токены созданные сканером (лексическим анализатором) в узлы синтаскического дерева)
 * метод синтакского анализа - "рекурсивный спуск"
 * Спуск описывается как «рекурсивный», потому что когда грамматическое правило
 * ссылается на себя — прямо или косвенно — это преобразуется в рекурсивный вызов функции.
 *  ---------------------------------------------------------
 *  Grammar notation	              Code representation
 *
 *  Terminal (определение правила)	  Code to match and consume a token
 *  Nonterminal (ссылка на правило)	  Call to that rule’s function
 *  |                                 if or switch statement
 *  * or +	                          while or for loop
 *  ?	                              if statement
 */
var Parser = /** @class */ (function () {
    function Parser(tokens) {
        this.tokens = tokens;
        this.coursor = 0;
    }
    Parser.prototype.parse = function () {
        try {
            var statements = [];
            while (!this.isAtEnd()) {
                statements.push(this.declaration());
            }
            console.log({ statements: statements });
            return statements;
        }
        catch (error) {
            console.error(error);
            return;
        }
    };
    // @ts-ignore в любом случае вернет Stmt
    // или стригерит ошибку которая развернет стек и пуш в стейтментс не выполнится
    Parser.prototype.declaration = function () {
        try {
            console.log('token: ', this.tokens[this.coursor], 'check: ' + this.check(tokensType_1.TOKEN_TYPES.VAR));
            if (this.match(tokensType_1.TOKEN_TYPES.VAR))
                return this.varDeclaration();
            return this.statement();
        }
        catch (error) {
            this.synchronize();
            console.error(error);
        }
    };
    Parser.prototype.varDeclaration = function () {
        console.log('var declar: ', this.tokens[this.coursor]);
        var token = this.consume(tokensType_1.TOKEN_TYPES.IDENTIFIER, 'Expected variable name');
        var intializer = null;
        if (this.match(tokensType_1.TOKEN_TYPES.EQUAL)) {
            // recursively deep for "Identifier" at "primary" literals
            intializer = this.expression();
        }
        this.consume(tokensType_1.TOKEN_TYPES.SEMICOLON, 'Semicolon after expression are required');
        return new statements_1.VarStmt(token, intializer);
    };
    Parser.prototype.statement = function () {
        if (this.match(tokensType_1.TOKEN_TYPES.PRINT)) {
            return this.printStatement();
        }
        return this.expressionStatement();
    };
    /**
     * мы берем expression значения токенов, потомучто
     * в принт можно передать как бинарные так унарные, так
     * и сложные выражения со скобками умножением и тд
     */
    Parser.prototype.printStatement = function () {
        // только expressions могут быть переданы в print
        // print if(true) {}; <- низя
        var expr = this.expression();
        // SEMICOLON after expression is required
        // in our language
        this.consume(tokensType_1.TOKEN_TYPES.SEMICOLON, 'Semicolon after expression are required');
        return new statements_1.PrintStmt(expr);
    };
    Parser.prototype.expressionStatement = function () {
        var expr = this.expression();
        // SEMICOLON after expression is required
        // in our language
        this.consume(tokensType_1.TOKEN_TYPES.SEMICOLON, 'Semicolon after expression are required');
        return new statements_1.ExpressionStmt(expr);
    };
    Parser.prototype.expression = function () {
        return this.equality();
    };
    Parser.prototype.equality = function () {
        // любой expression,
        // будь то primary (number) или binary expression
        // изза рекурсии и внизсходящиего алгоритма парсера
        // сначала берем самое приоритетное выражение парсера (число -> отрицание -> умножение) и т.д.
        var expr = this.comparison();
        while (this.matchMany(tokensType_1.TOKEN_TYPES.EQUAL, tokensType_1.TOKEN_TYPES.NOT_EQUAL)) {
            // мы уже увеличели каутнер mathMany методом, поэтому берем предыдущий токен
            var operator = this.previous();
            var right = this.comparison();
            expr = new Expressions_1.BinaryExpr(expr, operator, right);
        }
        return expr;
    };
    Parser.prototype.comparison = function () {
        var expr = this.term();
        while (this.matchMany(tokensType_1.TOKEN_TYPES.LESS, tokensType_1.TOKEN_TYPES.GREATER, tokensType_1.TOKEN_TYPES.GREATER_EQUAL, tokensType_1.TOKEN_TYPES.LESS_EQUAL)) {
            var operator = this.previous();
            var right = this.term();
            return new Expressions_1.BinaryExpr(expr, operator, right);
        }
        return expr;
    };
    Parser.prototype.term = function () {
        var expr = this.factor();
        while (this.matchMany(tokensType_1.TOKEN_TYPES.MINUS, tokensType_1.TOKEN_TYPES.PLUS)) {
            var operator = this.previous();
            var right = this.factor();
            expr = new Expressions_1.BinaryExpr(expr, operator, right);
        }
        return expr;
    };
    Parser.prototype.factor = function () {
        var expr = this.unary();
        // error in this.match (because this.previous is undefined)
        // Error here get type of undefined
        if (this.matchMany(tokensType_1.TOKEN_TYPES.SLASH, tokensType_1.TOKEN_TYPES.STAR)) {
            var operator = this.previous();
            var right = this.unary();
            expr = new Expressions_1.BinaryExpr(expr, operator, right);
        }
        return expr;
    };
    /**
     * unary expression creator also can return PrimaryExprReturnType type
     * because it's recursive and it have access to get primary expression token
     * @returns {UnaryExprReturnType}
     */
    Parser.prototype.unary = function () {
        if (this.matchMany(tokensType_1.TOKEN_TYPES.NOT, tokensType_1.TOKEN_TYPES.MINUS)) {
            var operator = this.previous();
            // 2 !
            // 3 hello
            var unary = this.unary();
            // 2 UnaryExpr: {operator: "!", expression: "hello"}
            // 1 UnaryExpr: {operator: "!", expression: UnaryExpr: {operator: "!", expression: "hello"}}
            return new Expressions_1.UnaryExpr(operator, unary);
        }
        return this.primary();
    };
    /**
     * primary method which return Literal and Grouping expression
     * primitive data types
     * @returns {PrimaryExprReturnType}
     */
    Parser.prototype.primary = function () {
        if (this.match(tokensType_1.TOKEN_TYPES.FALSE))
            return new Expressions_1.LiteralExpr(false);
        if (this.match(tokensType_1.TOKEN_TYPES.TRUE))
            return new Expressions_1.LiteralExpr(true);
        if (this.match(tokensType_1.TOKEN_TYPES.NULL))
            return new Expressions_1.LiteralExpr(null);
        if (this.match(tokensType_1.TOKEN_TYPES.IDENTIFIER)) {
            return new Expressions_1.VariableExpr(this.previous());
        }
        if (this.match(tokensType_1.TOKEN_TYPES.NUMBER) || this.match(tokensType_1.TOKEN_TYPES.STRING)) {
            return new Expressions_1.LiteralExpr(this.previous().lexeme);
        }
        if (this.match(tokensType_1.TOKEN_TYPES.LEFT_PAREN)) {
            var expr = this.expression();
            this.consume(tokensType_1.TOKEN_TYPES.RIGHT_PAREN, 'Expected ")" after grouping expression');
            return new Expressions_1.GroupingExpr(expr);
        }
        throw this.error(this.peek(), 'Expect expression.');
    };
    Parser.prototype.advance = function () {
        this.coursor++;
    };
    Parser.prototype.previous = function () {
        return this.peek({ offset: -1 });
    };
    Parser.prototype.peek = function (options) {
        var offset = (options === null || options === void 0 ? void 0 : options.offset) || 0;
        return this.tokens[this.coursor + offset];
    };
    Parser.prototype.isAtEnd = function () {
        return this.peek().type === tokensType_1.TOKEN_TYPES.EOF;
    };
    Parser.prototype.check = function (type) {
        if (this.isAtEnd())
            return false;
        return this.peek().type === type;
    };
    /**
     * match метод проверяет соответствует ли токен(ы) ожидаемому типу
     * возвращает true при первом соответствии type
     * @param types
     * @returns
     */
    Parser.prototype.match = function (token) {
        if (this.isAtEnd())
            return false;
        if (this.check(token)) {
            this.advance();
            return true;
        }
        return false;
    };
    /**
     * matchMany method который позволяет матчить сразу несколько токенов метода match
     */
    Parser.prototype.matchMany = function () {
        var tokenTypes = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            tokenTypes[_i] = arguments[_i];
        }
        if (this.isAtEnd())
            return false;
        for (var _a = 0, tokenTypes_1 = tokenTypes; _a < tokenTypes_1.length; _a++) {
            var token = tokenTypes_1[_a];
            var result = this.match(token);
            if (result)
                return true;
        }
        return false;
    };
    /**
     * Panick mode method which throw an error if this.tokens[this.coursor] type
     * and argument type are not same
     */
    Parser.prototype.consume = function (type, message) {
        if (this.check(type)) {
            this.advance();
            return this.previous();
        }
        throw this.error(this.peek(), message);
    };
    Parser.prototype.error = function (token, message) {
        Interpreter_1.default.error(token, message);
        return new error_1.ParseError();
    };
    Parser.prototype.synchronize = function () {
        this.advance();
        while (!this.isAtEnd()) {
            if (this.previous().type == tokensType_1.TOKEN_TYPES.SEMICOLON)
                return;
            switch (this.peek().type) {
                case tokensType_1.TOKEN_TYPES.CLASS:
                case tokensType_1.TOKEN_TYPES.FUNCTION:
                case tokensType_1.TOKEN_TYPES.VAR:
                case tokensType_1.TOKEN_TYPES.FOR:
                case tokensType_1.TOKEN_TYPES.IF:
                case tokensType_1.TOKEN_TYPES.WHILE:
                case tokensType_1.TOKEN_TYPES.PRINT:
                case tokensType_1.TOKEN_TYPES.RETURN:
                    return;
            }
            this.advance();
        }
    };
    return Parser;
}());
exports.Parser = Parser;
