import { Expr } from "../expressions/Expressions";

export type StmtVisitor<T> = {
    visitExpressionStmt: (stmt: ExpressionStmt) => T;
    visitPrintStmr: (stmt: PrintStmt) => T;
}

export abstract class Stmt {
    abstract accept<T>(visitor: StmtVisitor<T>): T
}

export class ExpressionStmt extends Stmt {
    expression: Expr;

    constructor(expression: Expr) {
        super();
        this.expression = expression;
    }

    accept<T>(visitor: StmtVisitor<T>): T {
        return visitor.visitExpressionStmt(this);
    }
}

export class PrintStmt extends Stmt {
    expression: Expr;

    constructor(expression: Expr) {
        super();
        this.expression = expression;
    }

    accept<T>(visitor: StmtVisitor<T>): T {
        return visitor.visitPrintStmr(this);
    }
}