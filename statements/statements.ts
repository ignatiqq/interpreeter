import { Expr } from "../expressions/Expressions";
import Token from "../tokens/Token/Token";

export type StmtVisitor<T> = {
    visitExpressionStmt: (stmt: ExpressionStmt) => T;
    visitPrintStmt: (stmt: PrintStmt) => T;
    visitVarStmt: (stmt: VarStmt) => T;
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
        return visitor.visitPrintStmt(this);
    }
}

// IDENTIFIER STMT
export class VarStmt extends Stmt {
    token: Token;
    initializer: Expr | null;

    constructor(token: Token, initializer: Expr | null) {
        super();
        this.token = token;
        this.initializer = initializer;
    }

    accept<T>(visitor: StmtVisitor<T>): T {
        return visitor.visitVarStmt(this);
    }
}