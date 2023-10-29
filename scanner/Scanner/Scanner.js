"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tokensType_1 = require("../../tokens/constants/tokensType");
var Token_1 = require("../../tokens/Token/Token");
var Interpreter_1 = require("../../Interpreter");
var keywords_1 = require("../constants/keywords");
var isNullishString = function (value) {
    return Number(value) === 0 && value !== '0';
};
/**
 * Tokenizer of languagee
 */
var Scanner = /** @class */ (function () {
    function Scanner(sourceCode) {
        this.sourceCode = sourceCode;
        // first lexem symbol like "var";
        this.start = 0;
        // current scanning symbol like "v" (coursor at all); 
        this.coursor = 0;
        // coursor line
        this.line = 1;
        this.sourceCodeLength = sourceCode.length;
        this.tokens = [];
    }
    Scanner.prototype.isAtEnd = function () {
        return this.coursor === this.sourceCode.length;
    };
    Scanner.prototype.match = function (symbol) {
        return this.sourceCode.slice(this.coursor, this.coursor + symbol.length) === symbol;
    };
    Scanner.prototype.eat = function (symbol) {
        if (this.match(symbol)) {
            this.coursor = this.coursor + symbol.length;
            return true;
        }
        else {
            Interpreter_1.default.signalError(this.line, 'Unexpected token: ' + symbol);
        }
    };
    Scanner.prototype.peek = function (options) {
        var offset = (options === null || options === void 0 ? void 0 : options.offset) || 0;
        if (this.coursor + offset >= this.sourceCode.length)
            return '\0';
        return this.sourceCode[this.coursor + offset];
    };
    Scanner.prototype.isDigit = function (digit) {
        if (this.isAlpha(digit))
            return false;
        if (isNullishString(digit))
            return false;
        return digit.length >= 1 && Number(digit) >= 0 && Number(digit) <= 9;
    };
    Scanner.prototype.isAlpha = function (symbol) {
        return (symbol >= 'a' && symbol <= 'z') ||
            (symbol >= 'A' && symbol <= 'Z') ||
            symbol == '_';
    };
    Scanner.prototype.isAlphaNumeric = function (symbol) {
        return this.isAlpha(symbol) || this.isDigit(symbol);
    };
    /**
     * Method which return the content between start of our token parse
     * and the current coursor position:
     */
    Scanner.prototype.getContetBetweenCoursor = function () {
        return this.sourceCode.slice(this.start, this.coursor);
    };
    /**
     * method which return flag of current symbol match arg symbol
     * @param {string} symbol to current symbol match
     * @returns {boolean}
     */
    Scanner.prototype.peekMatch = function (symbol, options) {
        var offset = (options === null || options === void 0 ? void 0 : options.offset) || 0;
        return this.peek({ offset: offset }) === symbol;
    };
    Scanner.prototype.scanTokens = function () {
        while (!this.isAtEnd()) {
            // define start line after analyze any of lexem (character) to work only with it
            // used only to getContetBetweenCoursor (parseDigit) maybe we can remove it 
            this.start = this.coursor;
            this.recognizeToken();
        }
        // ADD token which means end of our code 
        this.addToken(tokensType_1.TOKEN_TYPES.EOF);
        return this.tokens;
    };
    Scanner.prototype.recognizeToken = function () {
        // get symbol (lexem) from source code
        var rangeSymbol = this.sourceCode[this.coursor];
        switch (rangeSymbol) {
            case '(':
                this.eat('(');
                this.addToken(tokensType_1.TOKEN_TYPES.LEFT_PAREN);
                break;
            case ')':
                this.eat(')');
                this.addToken(tokensType_1.TOKEN_TYPES.RIGHT_PAREN);
                break;
            case '{':
                this.eat('{');
                this.addToken(tokensType_1.TOKEN_TYPES.LEFT_BRACE);
                break;
            case '}':
                this.eat('}');
                this.addToken(tokensType_1.TOKEN_TYPES.RIGHT_BRACE);
                break;
            case ',':
                this.eat(',');
                this.addToken(tokensType_1.TOKEN_TYPES.COMMA);
                break;
            case '.':
                this.eat('.');
                this.addToken(tokensType_1.TOKEN_TYPES.DOT);
                break;
            case '-':
                this.eat('-');
                this.addToken(tokensType_1.TOKEN_TYPES.MINUS);
                break;
            case '+':
                this.eat('+');
                this.addToken(tokensType_1.TOKEN_TYPES.PLUS);
                break;
            case ';':
                this.eat(';');
                this.addToken(tokensType_1.TOKEN_TYPES.SEMICOLON);
                break;
            case '*':
                this.eat('*');
                this.addToken(tokensType_1.TOKEN_TYPES.STAR);
                break;
            // // Lexems which can be in two different means
            // // we must to match next of current "rangeSymbol" to check if it matches
            // // and if it matches well skip coursor
            case '!':
                // we'll match next symbol and skip it if it matches
                if (this.peekMatch('=', { offset: 1 })) {
                    this.eat('=');
                    this.addToken(tokensType_1.TOKEN_TYPES.NOT_EQUAL);
                }
                else {
                    this.eat('!');
                    this.addToken(tokensType_1.TOKEN_TYPES.NOT);
                }
                break;
            case '=':
                if (this.peekMatch('=', { offset: 1 })) {
                    this.eat('==');
                    this.addToken(tokensType_1.TOKEN_TYPES.EQUAL_EQUAL);
                }
                else {
                    this.eat('=');
                    this.addToken(tokensType_1.TOKEN_TYPES.EQUAL);
                }
                break;
            case '<':
                if (this.peekMatch('=', { offset: 1 })) {
                    this.eat('<=');
                    this.addToken(tokensType_1.TOKEN_TYPES.LESS_EQUAL);
                }
                else {
                    this.eat('<');
                    this.addToken(tokensType_1.TOKEN_TYPES.LESS);
                }
                break;
            case '>':
                if (this.peekMatch('=', { offset: 1 })) {
                    this.eat('>=');
                    this.addToken(tokensType_1.TOKEN_TYPES.GREATER_EQUAL);
                }
                else {
                    this.eat('>');
                    this.addToken(tokensType_1.TOKEN_TYPES.GREATER);
                }
                break;
            // comment and division lexical analyze:
            case '/':
                console.log('peekmatch: ', this.peek(), this.peekMatch('/'));
                if (this.peekMatch('/') && (this.peekMatch('/', { offset: 1 }) || this.peekMatch('*', { offset: 1 }))) {
                    this.skipComments();
                }
                else {
                    this.addToken(tokensType_1.TOKEN_TYPES.SLASH);
                    this.eat('/');
                }
                break;
            // meaningless:
            case ' ':
            case '\r':
            case '\t':
                this.coursor++;
                break;
            // new line
            case '\n':
                // increase line cause we need to have right line to define line errors
                this.coursor++;
                this.line++;
                break;
            case "\"":
                this.parseString("\"");
                break;
            case "'":
                this.parseString("'");
                break;
            default: {
                // tokenize all numbers
                if (this.isDigit(rangeSymbol)) {
                    this.parseNumber();
                }
                else 
                // tokenize all identifiers
                // check is it aplhabet
                if (this.isAlpha(rangeSymbol)) {
                    this.parseIdentifier();
                }
                else {
                    this.eat(rangeSymbol);
                    // we must to stop our shile loop if it's error
                    Interpreter_1.default.signalError(this.line, 'Unexpected token: ' + rangeSymbol);
                    break;
                }
                break;
            }
        }
    };
    Scanner.prototype.skipComments = function () {
        if (this.peekMatch('*', { offset: 1 })) {
            this.skipCStyleComments();
        }
        else {
            this.skipInlineComment();
        }
    };
    Scanner.prototype.skipCStyleComments = function () {
        var _this = this;
        // eat comment start
        this.eat('/');
        this.eat('*');
        var isNotEndOfComment = function () { return !(_this.peekMatch('*') && _this.peekMatch('/', { offset: 1 })); };
        this.readWhileMatching(isNotEndOfComment);
        // eat comment end
        this.eat('*');
        this.eat('/');
    };
    Scanner.prototype.skipInlineComment = function () {
        this.eat('/');
        // A comment goes until the end of the line.
        while (!this.peekMatch('\n') && !this.isAtEnd())
            this.coursor++;
    };
    /**
     * Method which parse our identifiers (variables)
     */
    Scanner.prototype.parseIdentifier = function () {
        var _this = this;
        // variable name
        var variableName = this.readWhileMatching(function () { return _this.isAlphaNumeric(_this.peek()); });
        if (Boolean(keywords_1.RESERVED_TOKEN_KEYWORDS[variableName])) {
            this.addToken(keywords_1.RESERVED_TOKEN_KEYWORDS[variableName], variableName);
        }
        else {
            this.addToken(tokensType_1.TOKEN_TYPES.IDENTIFIER, variableName);
        }
    };
    Scanner.prototype.parseNumber = function () {
        var _this = this;
        var isPeekDigit = function () { return _this.isDigit(_this.peek()); };
        this.readWhileMatching(isPeekDigit);
        // check that's can be double number and after '.' we must
        // have number, thats why we prop 1 offset 
        // we must to know that's it digit after '.'
        if (this.peekMatch('.') && this.isDigit(this.peek({ offset: 1 }))) {
            this.readWhileMatching(isPeekDigit);
        }
        this.addToken(tokensType_1.TOKEN_TYPES.NUMBER, Number(this.getContetBetweenCoursor()));
    };
    /**
     * Parse strign eat doublequoutes and tokenize content string
     */
    Scanner.prototype.parseString = function (val) {
        var _this = this;
        this.eat(val);
        var content = this.readWhileMatching(function () { return !_this.peekMatch(val) && !_this.isAtEnd(); });
        if (this.isAtEnd()) {
            Interpreter_1.default.signalError(this.line, "Unterminated string.");
        }
        this.eat(val);
        this.addToken(tokensType_1.TOKEN_TYPES.STRING, content);
    };
    Scanner.prototype.readWhileMatching = function (pattern) {
        var start = this.coursor;
        while (pattern()) {
            this.coursor++;
            // add line if it matches new line
            // hardCode to skip lines when string can be 
            // on any lines of code
            if (this.peekMatch('\n'))
                this.line++;
        }
        return this.sourceCode.slice(start, this.coursor);
    };
    Scanner.prototype.addToken = function (type, literal) {
        if (literal === void 0) { literal = null; }
        var lexeme = type === tokensType_1.TOKEN_TYPES.EOF ? '' : this.sourceCode.slice(this.start, this.coursor);
        var token = new Token_1.default({ type: type, lexeme: lexeme, literal: literal, line: this.line });
        this.tokens.push(token);
    };
    return Scanner;
}());
exports.default = Scanner;
