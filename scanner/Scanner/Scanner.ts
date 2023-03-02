import { TOKEN_TYPES } from '../../tokens/constants/tokensType';
import Token from '../../tokens/Token/Token';
import Interpreter from '../../Interpreter';

import { RESERVED_TOKEN_KEYWORDS } from '../constants/keywords';

interface IScanner {
    scanTokens: () => Array<Token>;
}

const isNullishString = (value: string) => {
    return Number(value) === 0 && value !== '0';
}

/**
 * Tokenizer of languagee
 */
class Scanner implements IScanner {
    private sourceCode: string;
    private start: number;
    private coursor: number;
    private line: number;
    private sourceCodeLength: number;
    private tokens: Array<Token>;

    constructor(sourceCode: string) {
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

    private isAtEnd() {
        return this.coursor === this.sourceCode.length;
    }

    private match(symbol: string) {
        return this.sourceCode.slice(this.coursor, this.coursor + symbol.length) === symbol;
    }

    private eat(symbol: string) {
        if (this.match(symbol)) {
            this.coursor = this.coursor + symbol.length;
            return true;
        } else {
            Interpreter.signalError(this.line, 'Unexpected token: ' + symbol);
        }
    }

    private peek(options?: { offset?: number }) {
        const offset = options?.offset || 0;
        if (this.coursor + offset >= this.sourceCode.length) return '\0';
        return this.sourceCode[this.coursor + offset];
    }

    private isDigit(digit: string): boolean {
        if(this.isAlpha(digit)) return false;
        if(isNullishString(digit)) return false;
        return digit.length >= 1 && Number(digit) >= 0 && Number(digit) <= 9;
    }

    private isAlpha(symbol: string): boolean {
        return (symbol >= 'a' && symbol <= 'z') ||
            (symbol >= 'A' && symbol <= 'Z') ||
            symbol == '_';
    }

    private isAlphaNumeric(symbol: string): boolean {
        return this.isAlpha(symbol) || this.isDigit(symbol);
    }

    /**
     * Method which return the content between start of our token parse
     * and the current coursor position:
     */
    private getContetBetweenCoursor(): string {
        return this.sourceCode.slice(this.start, this.coursor);
    }

    /**
     * method which return flag of current symbol match arg symbol
     * @param {string} symbol to current symbol match
     * @returns {boolean} 
     */
    private peekMatch(symbol: string, options?: { offset?: number }): boolean {
        const offset = options?.offset || 0;
        return this.peek({ offset }) === symbol;
    }

    public scanTokens() {
        while (!this.isAtEnd()) {
            // define start line after analyze any of lexem (character) to work only with it

            // used only to getContetBetweenCoursor (parseDigit) maybe we can remove it 
            this.start = this.coursor;
            this.recognizeToken();
        }
        // ADD token which means end of our code 
        this.addToken(TOKEN_TYPES.EOF);
        return this.tokens;
    }

    private recognizeToken() {
        // get symbol (lexem) from source code
        const rangeSymbol = this.sourceCode[this.coursor];
        switch (rangeSymbol) {
            case '(': this.eat('('); this.addToken(TOKEN_TYPES.LEFT_PAREN); break;
            case ')': this.eat(')'); this.addToken(TOKEN_TYPES.RIGHT_PAREN); break;
            case '{': this.eat('{'); this.addToken(TOKEN_TYPES.LEFT_BRACE); break;
            case '}': this.eat('}'); this.addToken(TOKEN_TYPES.RIGHT_BRACE);  break;
            case ',': this.eat(','); this.addToken(TOKEN_TYPES.COMMA); break;
            case '.': this.eat('.'); this.addToken(TOKEN_TYPES.DOT); break;
            case '-': this.eat('-'); this.addToken(TOKEN_TYPES.MINUS); break;
            case '+': this.eat('+'); this.addToken(TOKEN_TYPES.PLUS); break;
            case ';': this.eat(';'); this.addToken(TOKEN_TYPES.SEMICOLON); break;
            case '*': this.eat('*'); this.addToken(TOKEN_TYPES.STAR); break;
            // // Lexems which can be in two different means
            // // we must to match next of current "rangeSymbol" to check if it matches
            // // and if it matches well skip coursor
            case '!':
                // we'll match next symbol and skip it if it matches
                this.addToken(this.eat('=') ? TOKEN_TYPES.NOT_EQUAL : TOKEN_TYPES.NOT);
                break;
            case '=':
                this.addToken(this.eat('=') ? TOKEN_TYPES.EQUAL_EQUAL : TOKEN_TYPES.EQUAL);
                break;
            case '<':
                this.addToken(this.eat('=') ? TOKEN_TYPES.LESS_EQUAL : TOKEN_TYPES.LESS);
                break;
            case '>':
                this.addToken(this.eat('=') ? TOKEN_TYPES.GREATER_EQUAL : TOKEN_TYPES.GREATER);
                break;
            // comment and division lexical analyze:
            case '/':
                console.log('peekmatch: ', this.peek(), this.peekMatch('/'))
                if (this.peekMatch('/') && (this.peekMatch('/', {offset: 1}) || this.peekMatch('*', {offset: 1}))) {
                    this.skipComments();
                } else {
                    this.addToken(TOKEN_TYPES.SLASH);
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

            case '"':
                this.parseString(); break;

            default: {
                // tokenize all numbers
                if (this.isDigit(rangeSymbol)) {
                    this.parseNumber();
                } else
                    // tokenize all identifiers
                    // check is it aplhabet
                    if (this.isAlpha(rangeSymbol)) {
                        this.parseIdentifier();
                    } else {
                        // we must to stop our shile loop if it's error
                        Interpreter.signalError(this.line, '(in default case) Unexpected token: ' + rangeSymbol); break;
                    }
                break;
            }
        }
    }

    private skipComments() {
        if (this.peekMatch('*', { offset: 1 })) {
            this.skipCStyleComments();
        } else {
            this.skipInlineComment();
        }
    }

    private skipCStyleComments() {
        // eat comment start
        this.eat('/');
        this.eat('*');

        const isNotEndOfComment = () => !(this.peekMatch('*') && this.peekMatch('/', { offset: 1 }));
        this.readWhileMatching(isNotEndOfComment);

        // eat comment end
        this.eat('*');
        this.eat('/');
    }

    private skipInlineComment() {
        this.eat('/');
        // A comment goes until the end of the line.
        while (!this.peekMatch('\n') && !this.isAtEnd()) this.coursor++;
    }

    /**
     * Method which parse our identifiers (variables)
     */
    private parseIdentifier() {
        // variable name
        const variableName = this.readWhileMatching(() => this.isAlphaNumeric(this.peek()));

        if (Boolean(RESERVED_TOKEN_KEYWORDS[variableName as keyof typeof RESERVED_TOKEN_KEYWORDS])) {
            this.addToken(RESERVED_TOKEN_KEYWORDS[variableName as keyof typeof RESERVED_TOKEN_KEYWORDS], variableName);
        } else {
            this.addToken(TOKEN_TYPES.VAR, variableName);
        }
    }

    private parseNumber() {
        const isPeekDigit = () => this.isDigit(this.peek());

        this.readWhileMatching(isPeekDigit);
        // check that's can be double number and after '.' we must
        // have number, thats why we prop 1 offset 
        // we must to know that's it digit after '.'
        if (this.peekMatch('.') && this.isDigit(this.peek({ offset: 1 }))) {
            this.readWhileMatching(isPeekDigit);
        }

        this.addToken(TOKEN_TYPES.NUMBER, Number(this.getContetBetweenCoursor()))
    }

    /**
     * Parse strign eat doublequoutes and tokenize content string
     */
    private parseString() {
        this.eat('"');

        const content = this.readWhileMatching(() => !this.peekMatch('"') && !this.isAtEnd());

        if (this.isAtEnd()) {
            Interpreter.signalError(this.line, "Unterminated string.");
        }

        this.eat('"');
        this.addToken(TOKEN_TYPES.STRING, content);
    }

    private readWhileMatching(pattern: () => boolean) {
        const start = this.coursor;
        while (pattern()) {
            this.coursor++;
            // add line if it matches new line

            // hardCode to skip lines when string can be 
            // on any lines of code
            if (this.peekMatch('\n')) this.line++;
        }
        return this.sourceCode.slice(start, this.coursor);
    }

    private addToken(type: string, literal: number | string | null = null) {
        const lexeme = type === TOKEN_TYPES.EOF ? '' : this.sourceCode.slice(this.start, this.coursor);
        const token = new Token({ type, lexeme, literal, line: this.line });
        console.log('in tokenizer: ', token);
        this.tokens.push(token);
    }

}

export default Scanner;