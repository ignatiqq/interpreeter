import Token from "../tokens/Token/Token";

/** 
 * В этом файле мы определяем синтаскис нашего языка для интерпретатора
 * все виды операций группировок и тд. Для того чтобы построить на основе него
 * дерево синтаксического анализа и AST
 */

export interface ExprVisitor<T> {
    visitBinaryExpr: (expr: BinaryExpr) => T;
    visitGroupingExpr: (expr: GroupingExpr) => T;
    visitLiteralExpr: (expr: LiteralExpr) => T;
    visitUnaryExpr: (expr: UnaryExpr) => T;
    visitVariableExpr: (expr: VariableExpr) => T;
    visitAssignmentExpr(expr: AssignmentExpr): T;
    visitLogicalExpr(expr: LogicalExpr): T;
    visitCallExpr(expr: CallExpr): T;
    visitGetExpr(expr: GetExpr): T;
    visitSetExpr(expr: SetExpr): T;
    // visitIdentifierExpr: (expr: IdentifierExpr) => T;
    
    // just binary 
    // visitFactorExpr: (expr: FactorExpr) => T;
    // visitTermExpr: (expr: TermExpr) => T;
    // visitComparisonExpr: (expr: ComparisonExpr) => T;
    // visitEqualityExpr: (expr: EqualityExpr) => T;
    // just binary 
}

/**
 * Expression abstract class for our syntax tree
 * Classes which will be inherited must define
 * left, right (because it's tree) and operator 
 * which can be (unary, binary, plus, minus, not, null. etc.) expressions
 */
export abstract class Expr {
    abstract accept<T>(visitor: ExprVisitor<T>): T
}

/**
 * Binary operation expression in our Syntax tree
 */
export class BinaryExpr extends Expr {
    left: Expr;
    right: Expr;
    operator: Token;

    constructor(left: Expr, operator: Token, right: Expr) {
        super();
        this.left = left;
        this.right = right;
        this.operator = operator;
    }
    
    accept<T>(visitor: ExprVisitor<T>): T {
        return visitor.visitBinaryExpr(this);
    }
}

export class GroupingExpr extends Expr {
    expression: Expr;
    constructor(expression: Expr) {
        super();
        this.expression = expression;
    }

    accept<T>(visitor: ExprVisitor<T>): T {
        return visitor.visitGroupingExpr(this);
    }
}

export class LiteralExpr extends Expr {
    literal: string | number | boolean | null;

    constructor(literal: string | number | boolean | null) {
        super();
        this.literal = literal;
    }
    
    accept<T>(visitor: ExprVisitor<T>): T {
        return visitor.visitLiteralExpr(this);
    }
}

export class UnaryExpr extends Expr {
    operator: Token;
    expression: Expr;

    constructor(operator: Token, expression: Expr) {
        super();
        this.operator = operator;
        this.expression = expression;
    }
    
    accept<T>(visitor: ExprVisitor<T>): T {
        return visitor.visitUnaryExpr(this);
    }
}

// Variable (IDENTIFIER is expression here 
// because variable defines by it's "name"
// "name" represents value
// "name" === value
// for example some_val = 5;
// some_val === 5;
// 5
export class VariableExpr extends Expr {
    token: Token;

    constructor(token: Token) {
        super();
        this.token = token;
    }

    accept<T>(visitor: ExprVisitor<T>): T {
        return visitor.visitVariableExpr(this);
    }
}

export class AssignmentExpr extends Expr {
    // для какого токена осуществляется переприсваивание
    token: Token;
    // новое значение для перменной
    expr: Expr;

    constructor(token: Token, expr: Expr) {
        super();
        this.token = token;
        this.expr = expr;
    }

    accept<T>(visitor: ExprVisitor<T>): T {
        return visitor.visitAssignmentExpr(this);    
    }
}

export class LogicalExpr extends Expr {
    left: Expr;
    operator: Token;
    right: Expr;

    constructor(left: Expr, operator: Token, right: Expr) {
        super();
        this.left = left;
        this.operator = operator;
        this.right = right;
    }
    
    accept<T>(visitor: ExprVisitor<T>): T {
        return visitor.visitLogicalExpr(this);
    }
}

export class CallExpr extends Expr {
    callee: Expr;
    paren: Token;
    args: Expr[];

    constructor(callee: Expr, paren: Token, args: Expr[]) {
        super();
        this.callee = callee;
        this.paren = paren;
        this.args = args;
    }

    accept<T>(visitor: ExprVisitor<T>): T {
        return visitor.visitCallExpr(this);    
    }
}

export class GetExpr extends Expr {
    object: Expr;
    token: Token;

    constructor(object: Expr, token: Token) {
        super();
        this.object = object;
        this.token = token;
    }

    accept<T>(visitor: ExprVisitor<T>): T {
        return visitor.visitGetExpr(this);    
    }
}

export class SetExpr extends Expr {
    object: Expr;
    token: Token;
    value: Expr;

    constructor(object: Expr, token: Token, value: Expr) {
        super();
        this.object = object;
        this.token = token;
        this.value = value;
    }

    accept<T>(visitor: ExprVisitor<T>): T {
        return visitor.visitSetExpr(this);    
    }
}