import { RuntimeError } from "../../error/error";
import { Expr, ExprVisitor, LiteralExpr, UnaryExpr, BinaryExpr, GroupingExpr } from "../../expressions/Expressions";
import Interpreter from "../../Interpreter";
import { TOKEN_TYPES } from "../../tokens/constants/tokensType";
import Token from "../../tokens/Token/Token";

type LiteralReturnType = string | number | boolean | null;

export class InterpreeterMath implements ExprVisitor<any> {
    evaluate(expr: Expr): LiteralReturnType | undefined {
        try {
            return expr.accept(this);
        } catch (error) {
            Interpreter.runtimeError((error as RuntimeError).token, (error as RuntimeError).message);
        }
        
    }

    checkNumberOperand<T>(token: Token, operand: T) {
        if(typeof operand === 'number') return true;
        throw new RuntimeError(token, 'Operand must be a number.')
    }

    checkNumberOperands(token: Token, left: any, right: any) {
        if(typeof left === 'number' && typeof right === 'number')
            return true;
        throw new RuntimeError(token, 'Operands must be a numbers.')
    }

    visitBinaryExpr(expr: BinaryExpr) {
        const left = this.evaluate(expr.left);
        const right = this.evaluate(expr.right);

        console.log({left, right})

        switch(expr.operator.type) {
            case TOKEN_TYPES.STAR:
                this.checkNumberOperands(expr.operator, left, right);
                return Number(left) * Number(right);
            case TOKEN_TYPES.MINUS:
                this.checkNumberOperands(expr.operator, left, right);
                return Number(left) - Number(right);
            case TOKEN_TYPES.SLASH:
                this.checkNumberOperands(expr.operator, left, right);
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
                    console.log(left, right)
                    return String(left) + String(right);
                } else if(typeof left === 'number' && typeof right === 'number') {
                    return left + right;
                }
                throw new RuntimeError(expr.operator,
                    "Operands must be two numbers or two strings.");

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
                this.checkNumberOperand(expr.operator, expr.expression);
                return !this.isTruthy(this.evaluate(expr.expression));
            }

            case TOKEN_TYPES.MINUS: {
                this.checkNumberOperand(expr.operator, expr.expression);
                return -(Number(this.evaluate(expr.expression)));
            }

            default: return null;
        }
    };

    isEqual(val: any, val2: any) {
        if(val === null && val2 === null) return true;
        if(val === undefined && val2 === undefined) return true;
        return val === val2;
    }

    isTruthy<T>(val: T) {
        if(val === null) return false;
        if(typeof val === 'undefined') return false;
        return Boolean(val);
    }
}