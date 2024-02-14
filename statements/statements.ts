import { Expr } from "../expressions/Expressions";
import Token from "../tokens/Token/Token";

export type StmtVisitor<T> = {
    visitExpressionStmt(stmt: ExpressionStmt): T;
    visitPrintStmt(stmt: PrintStmt): T;
    visitVarStmt(stmt: VarStmt): T;
    visitBlockStmt(stmt: BlockStmt): T;
    visitIfStmt(stmt: IfStmt): T;
    visitWhileStmt(stmt: WhileStmt): T;
    visitFunctionStmt(stmt: FunctionStmt): T;
    visitReturnStmt(stmt: ReturnStmt): T;
    visitClassStmt(stmt: ClassStmt): T;
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

export class FunctionStmt extends Stmt {
    identifier: Token;
    params: Token[];
    body: Stmt[];

    constructor(identifier: Token, params: Token[], body: Stmt[]) {
        super();
        this.identifier = identifier;
        this.params = params;
        this.body = body;
    }

    accept<T>(visitor: StmtVisitor<T>): T {
        return visitor.visitFunctionStmt(this);
    }
}

export class BlockStmt extends Stmt {
    stmts: Stmt[];

    constructor(stmts: Stmt[]) {
        super();
        this.stmts = stmts;
    }

    accept<T>(visitor: StmtVisitor<T>): T {
        return visitor.visitBlockStmt(this);
    }
}

export class IfStmt extends Stmt {
    condition: Expr;
    thenBranch: Stmt;
    elseBranch: Stmt | null;

    constructor(condition: Expr, thenBranch: Stmt, elseBranch: Stmt | null = null) {
        super();
        this.condition = condition;
        this.thenBranch = thenBranch;
        this.elseBranch = elseBranch;
    }

    accept<T>(visitor: StmtVisitor<T>): T {
        return visitor.visitIfStmt(this);
    }
}

export class WhileStmt extends Stmt {
    condition: Expr;
    body: Stmt;

    constructor(condition: Expr, body: Stmt) {
        super();
        this.condition = condition;
        this.body = body;
    }

    accept<T>(visitor: StmtVisitor<T>): T {
        return visitor.visitWhileStmt(this);
    }
}

export class ReturnStmt extends Stmt {
    expr: Expr | null;
    // used only for error logging (line)
    keyword: Token;

    constructor(keyword: Token, expr: Expr | null) {
        super();
        this.expr = expr;
        this.keyword = keyword;
    }

    accept<T>(visitor: StmtVisitor<T>): T {
        return visitor.visitReturnStmt(this);
    }
}

export class ClassStmt extends Stmt {
    token: Token;
    methods: FunctionStmt[];

    constructor(token: Token, methods: FunctionStmt[]) {
        super();
        this.token = token;
        this.methods = methods;
    }

    accept<T>(visitor: StmtVisitor<T>): T {
        return visitor.visitClassStmt(this);
    }
}