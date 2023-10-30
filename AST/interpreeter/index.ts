import { Enviroment } from "../../Enviroment";
import { RuntimeError } from "../../error/error";
import { Expr, ExprVisitor, LiteralExpr, UnaryExpr, BinaryExpr, GroupingExpr, VariableExpr, AssignmentExpr } from "../../expressions/Expressions";
import Interpreter from "../../Interpreter";
import { ExpressionStmt, PrintStmt, Stmt, StmtVisitor, VarStmt } from "../../statements/statements";
import { TOKEN_TYPES } from "../../tokens/constants/tokensType";
import Token from "../../tokens/Token/Token";

type LiteralReturnType = string | number | boolean | null;

/**
 * Interptreete -класс интерпритатора реализовывающий все методы посетителя 
 * (Рекурсивный обход и выполнение AST дерева)
 * имеющихся Expression и Statemen'тов
 * наш интерпретатор выполняет пост-заказный обход — каждый узел оценивает своих дочерних узлов,
 * прежде чем выполнять свою собственную работу.
 *  
 */
export class Interpreeter implements ExprVisitor<any>, StmtVisitor<void> {
    enviroment: Enviroment;
    
    constructor(enviroment: Enviroment) {
        this.enviroment = enviroment;
    }

    interprete(stmts: Stmt[]) {
        try {
            for(const stmt of stmts) {
                this.execute(stmt);
            }
        } catch (error) {
            Interpreter.runtimeError((error as RuntimeError).token, (error as RuntimeError).message);
        }
    }

    private execute(stmt: Stmt) {
        return stmt.accept<void>(this);
    }

    evaluate(expr: Expr): LiteralReturnType | undefined | void {
        try {
            return expr.accept(this);
        } catch (error) {
            Interpreter.runtimeError((error as RuntimeError).token, (error as RuntimeError).message);
        }
        
    }

    checkNumberOperand<T extends Expr>(token: Token, operand: T) {
        if(typeof operand === 'number') return true;
        throw new RuntimeError(token, 'Operand must be a number.')
    }

    checkNumberOperands(token: Token, left: any, right: any) {
        if(this.checkNumberOperand(token, left) && this.checkNumberOperand(token, right))
            return true;
    }

    visitBinaryExpr(expr: BinaryExpr) {
        const left = this.evaluate(expr.left);
        const right = this.evaluate(expr.right);

        switch(expr.operator.type) {
            case TOKEN_TYPES.STAR:
                this.checkNumberOperands(expr.operator, left, right);
                return Number(left) * Number(right);
            case TOKEN_TYPES.MINUS:
                this.checkNumberOperands(expr.operator, left, right);
                return Number(left) - Number(right);
            case TOKEN_TYPES.SLASH:
                if(right === 0) throw new RuntimeError(expr.operator,
                    "Division operand cannot be 0");
                this.checkNumberOperands(expr.operator, left, right);
                if(left === 0 || right === 0) {
                    return 0;
                }
                return Number(left) / Number(right);
            case TOKEN_TYPES.EQUAL_EQUAL: 
                return this.isEqual(left, right);
            case TOKEN_TYPES.NOT_EQUAL: 
                return !this.isEqual(left, right);
            case TOKEN_TYPES.LESS_EQUAL:
                this.checkNumberOperands(expr.operator, left, right);
                return Number(left) <= Number(right);
            case TOKEN_TYPES.GREATER_EQUAL:
                this.checkNumberOperands(expr.operator, left, right);
                return Number(left) >= Number(right);
            case TOKEN_TYPES.LESS:
                this.checkNumberOperands(expr.operator, left, right);
                return Number(left) < Number(right);
            case TOKEN_TYPES.GREATER:
                this.checkNumberOperands(expr.operator, left, right);
                return Number(left) > Number(right);
            case TOKEN_TYPES.PLUS:
                if(
                    typeof left === 'string' && typeof right === 'number' ||
                    typeof left === 'number' && typeof right === 'string'
                ) {
                    return String(left) + String(right);
                } else if(typeof left === 'number' && typeof right === 'number') {
                    return left + right;
                }
                throw new RuntimeError(expr.operator,
                    "Operands of '+' operator must be numbers or strings.");

            default: return null;
        }
    }
    
    visitLiteralExpr(expr: LiteralExpr): LiteralReturnType {
        return expr.literal;
    };

    visitGroupingExpr(expr: GroupingExpr) {
        return this.evaluate(expr.expression);
    };

    visitUnaryExpr(expr: UnaryExpr) {
        switch(expr.operator.type) {
            case TOKEN_TYPES.NOT: {
                return !this.isTruthy(this.evaluate(expr.expression));
            }

            case TOKEN_TYPES.MINUS: {
                return -(Number(this.evaluate(expr.expression)));
            }
            
            default: return null;
        }
    };

    visitAssignmentExpr(expr: AssignmentExpr) {
        const val = expr.expr !== null ? this.evaluate(expr.expr) : null;

        this.enviroment.assign(expr.token, val || null);

        return val;
    }

    isEqual(val: any, val2: any) {
        if(val === null && val2 === null) return true;
        return val === val2;
    }

    isTruthy<T>(val: T) {
        if(val === null) return false;
        return Boolean(val);
    }

    visitVarStmt(stmt: VarStmt) {
        let value: any = null;

        // var initalizer not null
        if(stmt.initializer !== null) {
            const res = this.evaluate(stmt.initializer);
            if(res !== undefined && res !== null) {
                value = res;
            }
        }


        // define variable (actually global) at the variables hashmap
        // сетим переменную в enviroment
        this.enviroment.define(stmt.token.lexeme, value);
    };

    // имя переменной это expression
    // потомучто нужно вычислить чем является имя, 
    // а значит имя = значение (имя преобразуется в значение, а значение = Expression)
    visitVariableExpr(expr: VariableExpr) {
        // берем переменную из enviroment по имени
        return this.enviroment.get(expr.token);
    }

    // stmt visitors
    visitExpressionStmt(stmt: ExpressionStmt) {
        this.evaluate(stmt.expression);
    };

    visitPrintStmt(stmt: PrintStmt) {
        // выполняем и получаем значение потомучто в print мы передаем
        // только expression мы не можем передать statement (консрукцию языка)
        // потомучто оно не ресолвиться в значение (value)
        const expr = this.evaluate(stmt.expression);
        console.log(`${expr}`);
    };
}