import {ExprVisitor, Expr, BinaryExpr, GroupingExpr, LiteralExpr, UnaryExpr} from '../../expressions/Expressions';

interface ASTPrinterMethods {
    parenthesize<T>(name: string, ...expr: Expr[]): string;
}

export class ASTPrinter implements ExprVisitor<string>, ASTPrinterMethods {
    print(expr: Expr) {
        return this.visit(expr);
    }

    visit(expr: Expr) {
        return expr.accept(this);
    }

    parenthesize(name: string , ...exprs: Expr[]) {
        let result = '';
        result += `(${name}`;

        for(const expr of exprs) {
            // recursively parse all tree nodes to flat values to string
            result += ` ${expr.accept(this)}`;
        }
        result += ')';

        return result;
    }

    visitBinaryExpr(expr: BinaryExpr) {
        return this.parenthesize(expr.operator.lexeme, expr.left, expr.right)
    }

    visitGroupingExpr(expr: GroupingExpr) {
        return this.parenthesize('group', expr.expression);
    }

    visitLiteralExpr(expr: LiteralExpr) {
        if(expr.literal === null) return 'null';
        if (typeof expr.literal === "string") return `"${expr.literal}"`
        return this.parenthesize(`${expr.literal}`);
    }

    visitUnaryExpr(expr: UnaryExpr) {
        return this.parenthesize(expr.operator.lexeme, expr.expression);
    }

    // visitComparisonExpr(expr: ComparisonExpr) {
    //     return this.parenthesize(expr.operator.lexeme, expr.left, expr.right);
    // }

    // visitFactorExpr(expr: FactorExpr) {
    //     return this.parenthesize(expr.operator.lexeme, expr.left, expr.right);
    // }

    // visitTermExpr(expr: TermExpr) {
    //     return this.parenthesize(expr.operator.lexeme, expr.left, expr.right);
    // };

    // visitEqualityExpr(expr: EqualityExpr) {
    //     return this.parenthesize(expr.operator.lexeme, expr.left, expr.right);
    // };
}