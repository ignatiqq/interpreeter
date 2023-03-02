import { Expr, ExprVisitor, LiteralExpr, UnaryExpr, BinaryExpr, GroupingExpr } from "../../expressions/Expressions";
import { TOKEN_TYPES } from "../../tokens/constants/tokensType";

type LiteralReturnType = string | number | boolean | null;

export class InterpreeterMath implements ExprVisitor<any> {
    evaluate(expr: Expr): LiteralReturnType {
        return expr.accept(this);
    }

    visitBinaryExpr(expr: BinaryExpr) {
        const left = Number(this.evaluate(expr.left));
        const right = Number(this.evaluate(expr.right));

        switch(expr.operator.type) {
            case TOKEN_TYPES.STAR: 
                return left * right;
            case TOKEN_TYPES.MINUS: 
                return left - right;
            case TOKEN_TYPES.SLASH: 
                return left / right;
            case TOKEN_TYPES.EQUAL_EQUAL: 
                return this.isEqual(left, right);
            case TOKEN_TYPES.NOT_EQUAL: 
                return !this.isEqual(left, right);
            case TOKEN_TYPES.LESS_EQUAL:
                return left <= right;
            case TOKEN_TYPES.GREATER_EQUAL:
                return left >= right;
            case TOKEN_TYPES.LESS:
                return left < right;
            case TOKEN_TYPES.GREATER:
                return left > right;
            case TOKEN_TYPES.PLUS:
                if(
                    typeof left === 'string' && typeof right === 'number' ||
                    typeof left === 'number' && typeof right === 'string'
                ) {
                    return String(left) + String(right);
                }
                return left + right;

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