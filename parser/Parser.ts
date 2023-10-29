import { ParseError } from "../error/error";
import {  Expr, BinaryExpr, GroupingExpr, LiteralExpr, UnaryExpr, VariableExpr } from "../expressions/Expressions";
import Interpreter from "../Interpreter";
import { ExpressionStmt, PrintStmt, Stmt, VarStmt } from "../statements/statements";
import { TOKEN_TYPE, TOKEN_TYPES } from "../tokens/constants/tokensType";
import Token from "../tokens/Token/Token";

type PrimaryExprReturnType = LiteralExpr | GroupingExpr | VariableExpr;
type UnaryExprReturnType = UnaryExpr | PrimaryExprReturnType;
type BinaryExprType = BinaryExpr | UnaryExprReturnType;

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
export class Parser {
    private coursor: number;
    tokens: Token[];

    constructor(tokens: Token[]) {
        this.tokens = tokens;
        this.coursor = 0;
    }

    parse() {
        try {
            const statements: Stmt[] = [];

            while(!this.isAtEnd()) {
                statements.push(this.declaration());
            }

            console.log({statements})

            return statements;
        } catch (error) {
            console.error(error);
            return;
        }
    }

    // @ts-ignore в любом случае вернет Stmt
    // или стригерит ошибку которая развернет стек и пуш в стейтментс не выполнится
    declaration(): Stmt {
        try {
            console.log('token: ', this.tokens[this.coursor], 'check: ' + this.check(TOKEN_TYPES.VAR));
            if(this.match(TOKEN_TYPES.VAR)) return this.varDeclaration();
            return this.statement();
        } catch (error) {
            this.synchronize();
            console.error(error);
        }
    }

    varDeclaration(): Stmt {
        console.log('var declar: ', this.tokens[this.coursor]);
        const token = this.consume(TOKEN_TYPES.IDENTIFIER, 'Expected variable name');

        let intializer: Expr | null = null;

        if(this.match(TOKEN_TYPES.EQUAL)) {
            // recursively deep for "Identifier" at "primary" literals
            intializer = this.expression();
        }

        this.consume(TOKEN_TYPES.SEMICOLON, 'Semicolon after expression are required');
        return new VarStmt(token, intializer);
    }

    statement(): Stmt {
        if(this.match(TOKEN_TYPES.PRINT)) {
            return this.printStatement();
        }
        return this.expressionStatement();
    }

    /**
     * мы берем expression значения токенов, потомучто 
     * в принт можно передать как бинарные так унарные, так 
     * и сложные выражения со скобками умножением и тд
     */
    printStatement(): Stmt {
        // только expressions могут быть переданы в print
        // print if(true) {}; <- низя
        const expr = this.expression();
        // SEMICOLON after expression is required
        // in our language
        this.consume(TOKEN_TYPES.SEMICOLON, 'Semicolon after expression are required');
        return new PrintStmt(expr);
    }

    expressionStatement(): Stmt {
        const expr = this.expression();
        // SEMICOLON after expression is required
        // in our language
        this.consume(TOKEN_TYPES.SEMICOLON, 'Semicolon after expression are required');
        return new ExpressionStmt(expr);
    }

    expression(): Expr {
        return this.equality();
    }

    equality(): BinaryExprType {
        // любой expression,
        // будь то primary (number) или binary expression
        // изза рекурсии и внизсходящиего алгоритма парсера
        // сначала берем самое приоритетное выражение парсера (число -> отрицание -> умножение) и т.д.
        let expr: BinaryExprType = this.comparison();

        while(this.matchMany(TOKEN_TYPES.EQUAL, TOKEN_TYPES.NOT_EQUAL)) {
            // мы уже увеличели каутнер mathMany методом, поэтому берем предыдущий токен
            const operator = this.previous();
            const right = this.comparison();
            
            expr = new BinaryExpr(expr, operator, right);
        }

        return expr;
    }

    comparison(): BinaryExprType {
        let expr: BinaryExprType = this.term();

        while(this.matchMany(TOKEN_TYPES.LESS, TOKEN_TYPES.GREATER, TOKEN_TYPES.GREATER_EQUAL, TOKEN_TYPES.LESS_EQUAL)) {
            const operator = this.previous();
            const right = this.term();
            return new BinaryExpr(expr, operator, right);
        }

        return expr;
    }

    term(): BinaryExprType {
        let expr: BinaryExprType = this.factor();

        while(this.matchMany(TOKEN_TYPES.MINUS, TOKEN_TYPES.PLUS)) {
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

        if(this.matchMany(TOKEN_TYPES.SLASH, TOKEN_TYPES.STAR)) {
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
        if(this.matchMany(TOKEN_TYPES.NOT, TOKEN_TYPES.MINUS)) {
            const operator = this.previous();
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
        if(this.match(TOKEN_TYPES.IDENTIFIER)) {
            return new VariableExpr(this.previous());
        }
        if(this.match(TOKEN_TYPES.NUMBER) || this.match(TOKEN_TYPES.STRING)) {
            return new LiteralExpr(this.previous().lexeme);
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
    match(token: string) {
        if(this.isAtEnd()) return false;

        if(this.check(token)) {
            this.advance();
            return true;
        }

        return false;
    }
    
    /** 
     * matchMany method который позволяет матчить сразу несколько токенов метода match
     */
    matchMany(...tokenTypes: string[]) {
        if(this.isAtEnd()) return false;

        for(let token of tokenTypes) {
            const result = this.match(token);
            if(result) return true;
        }

        return false;
    }

    /**
     * Panick mode method which throw an error if this.tokens[this.coursor] type
     * and argument type are not same 
     */
    consume(type: string, message: string): Token {
        if(this.check(type)) {
            this.advance();
            return this.previous();
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
