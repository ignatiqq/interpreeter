import { ParseError } from "../error/error";
import {  Expr, BinaryExpr, GroupingExpr, LiteralExpr, UnaryExpr } from "../expressions/Expressions";
import Interpreter from "../Interpreter";
import { TOKEN_TYPE, TOKEN_TYPES } from "../tokens/constants/tokensType";
import Token from "../tokens/Token/Token";

type PrimaryExprReturnType = LiteralExpr | GroupingExpr;
type UnaryExprReturnType = UnaryExpr | PrimaryExprReturnType;
type BinaryExprType = BinaryExpr | UnaryExprReturnType;

/**
 * Парсер преобразует набор токенов в правила языка (в исходный код)
 * Каждое правило грамматики языка становиться методом этого класса 
 * (Преобразуем токены созданны сканером (лексическим анализатором) в узлы синтаскического дерева)
 */
export class Parser {
    private coursor: number;
    tokens: Token[];

    constructor(tokens: Token[]) {
        this.tokens = tokens;
        this.coursor = 0;
    }

    parse() {
        try {
            return this.expression();
        } catch (error) {
            console.error(error);
            return;
        }
    }

    expression(): Expr {
        return this.equality();
    }

    equality(): BinaryExprType {
        // ФИНАЛЬНЫЙ EXPRESSION CLASS (TYPE) НЕОБЯЗАТЕЛЬНО ДОЛЖЕН БЫТЬ
        // ЭКСПРЕШНОМ ПРАВИЛА УСЛОВНОГО (equality) ОН МОЖЕТ БЫТЬ
        // ОБЫЧНЫМ ЧИСЛОМ, ПОЭТОМУ В ВАЙЛ ЦИКЛ МЫ МОЖЕМ НЕ ЗАЙТИ 
        // И ПОЭТОМУ ВОЗВРАЩАЕМОЙ ЗНАЧЕНИЕ МОЖЕТ БЫТЬ ЛЮБЫМ ТИПОМ 
        // НЕОБЯХАТЕЛЬНО {EqualityExprReturnType} поэтому название переменной expr (Expression)
        let expr: BinaryExprType = this.comparison();

        while(this.match(TOKEN_TYPES.NOT_EQUAL, TOKEN_TYPES.EQUAL_EQUAL)) {
            const operator = this.previous();
            const right = this.comparison();
            expr = new BinaryExpr(expr, operator, right);
        }

        return expr;
    }

    comparison(): BinaryExprType {
        let expr: BinaryExprType = this.term();

        while(this.match(TOKEN_TYPES.LESS, TOKEN_TYPES.LESS_EQUAL, TOKEN_TYPES.GREATER, TOKEN_TYPES.GREATER_EQUAL)) {
            const operator = this.previous();
            const right = this.term();
            expr = new BinaryExpr(expr, operator, right);
        }

        return expr;
    }

    term(): BinaryExprType {
        let expr: BinaryExprType = this.factor();

        while(this.match(TOKEN_TYPES.MINUS, TOKEN_TYPES.PLUS)) {
            const operator = this.previous();
            const right = this.factor();
            expr = new BinaryExpr(expr, operator, right);
        }

        return expr;
    }

    factor(): BinaryExprType {
        let expr: BinaryExprType = this.unary();
        // error in this.match (because this.previous is undefined)
        // Error here get type of undefined

        if(this.match(TOKEN_TYPES.SLASH, TOKEN_TYPES.STAR)) {
            const operator = this.previous();
            const right = this.unary();
            expr = new BinaryExpr(expr, operator, right);
        }

        return expr;
    }

    /**
     * unary expression creator also can return PrimaryExprReturnType type
     * because it's recursive and it have access to get primary expression token
     * @returns {UnaryExprReturnType}
     */
    unary(): UnaryExprReturnType {
        if(this.match(TOKEN_TYPES.NOT, TOKEN_TYPES.MINUS)) {
            const operator = this.previous();
            // 1 !
            // 2 !
            // 3 hello
            const unary = this.unary();
            // 2 UnaryExpr: {operator: "!", expression: "hello"}
            // 1 UnaryExpr: {operator: "!", expression: UnaryExpr: {operator: "!", expression: "hello"}}
            return new UnaryExpr(operator, unary)
        }

        return this.primary();
    }

    /**
     * primary method which return Literal and Grouping expression
     * primitive data types
     * @returns {PrimaryExprReturnType}
     */
    primary(): PrimaryExprReturnType {
        if(this.match(TOKEN_TYPES.FALSE)) return new LiteralExpr(false);
        if(this.match(TOKEN_TYPES.TRUE)) return new LiteralExpr(true);
        if(this.match(TOKEN_TYPES.NULL)) return new LiteralExpr(null);
        if(this.match(TOKEN_TYPES.NUMBER) || this.match(TOKEN_TYPES.STRING)) {
            return new LiteralExpr(this.previous().literal);
        }
        if(this.match(TOKEN_TYPES.LEFT_PAREN)) {
            const expr = this.expression();
            this.consume(TOKEN_TYPES.RIGHT_PAREN, 'Expected ")" after grouping expression');
            return new GroupingExpr(expr);
        }

        throw this.error(this.peek(), 'Expect expression.')
    }

    advance() {
        this.coursor++;
    }

    previous() {
        return this.peek({offset: -1})
    }

    peek(options?: {offset: number}): Token {
        const offset = options?.offset || 0;
        return this.tokens[this.coursor + offset];
    }

    isAtEnd() {
        return this.peek().type === TOKEN_TYPES.EOF
    }

    check(type: string): boolean {
        if(this.isAtEnd()) return false;
        return this.peek().type === type;
    }

    /**
     * match метод проверяет соответствует ли токен(ы) ожидаемому типу
     * возвращает true при первом соответствии type
     * @param types 
     * @returns 
     */
    match(...types: string[]) {
        if(this.isAtEnd()) return false;

        for(let token of types) {
            if(this.check(token as TOKEN_TYPE)) {
                this.advance();
                return true;
            }
        }
    }

    /**
     * Panick mode method which throw an error if this.tokens[this.coursor] type
     * and argument type are not same 
     */
    consume(type: string, message: string) {
        if(this.check(type)) {
            this.advance();
            return;
        }
        
        throw this.error(this.peek(), message);
    }

    error(token: Token, message: string) {
        Interpreter.error(token, message);
        return new ParseError();
    }

    synchronize() {
        this.advance();
    
        while (!this.isAtEnd()) {
          if (this.previous().type == TOKEN_TYPES.SEMICOLON) return;
    
          switch (this.peek().type) {
            case TOKEN_TYPES.CLASS:
            case TOKEN_TYPES.FUNCTION:
            case TOKEN_TYPES.VAR:
            case TOKEN_TYPES.FOR:
            case TOKEN_TYPES.IF:
            case TOKEN_TYPES.WHILE:
            case TOKEN_TYPES.PRINT:
            case TOKEN_TYPES.RETURN:
              return;
          }
    
          this.advance();
        }
      }

}
