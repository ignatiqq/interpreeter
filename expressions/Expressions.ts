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
    // visitFactorExpr: (expr: FactorExpr) => T;
    // visitTermExpr: (expr: TermExpr) => T;
    // visitComparisonExpr: (expr: ComparisonExpr) => T;
    // visitEqualityExpr: (expr: EqualityExpr) => T;
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

type ExprOptionsType = {left: Expr, operator: Token, right: Expr};

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

// export class FactorExpr extends Expr {
//     left: Expr;
//     operator: Token;
//     right: Expr;

//     constructor(left: Expr, operator: Token, right: Expr) {
//         super();
//         this.left = left;
//         this.right = right;
//         this.operator = operator;
//     }

//     accept<T>(visitor: ExprVisitor<T>): T {
//         return visitor.visitFactorExpr(this);
//     }
// }

// export class TermExpr extends Expr {
//     left: Expr;
//     operator: Token;
//     right: Expr;

//     constructor(left: Expr, operator: Token, right: Expr) {
//         super();
//         this.left = left;
//         this.right = right;
//         this.operator = operator;
//     }

//     accept<T>(visitor: ExprVisitor<T>): T {
//         return visitor.visitTermExpr(this);
//     }
// }

// export class ComparisonExpr extends Expr {
//     left: Expr;
//     operator: Token;
//     right: Expr;

//     constructor(left: Expr, operator: Token, right: Expr) {
//         super();
//         this.left = left;
//         this.right = right;
//         this.operator = operator;
//     }

//     accept<T>(visitor: ExprVisitor<T>): T {
//         return visitor.visitComparisonExpr(this);
//     }
// }

// export class EqualityExpr extends Expr {
//     left: Expr;
//     operator: Token;
//     right: Expr;

//     constructor(left: Expr, operator: Token, right: Expr) {
//         super();
//         this.left = left;
//         this.right = right;
//         this.operator = operator;
//     }

//     accept<T>(visitor: ExprVisitor<T>): T {
//         return visitor.visitEqualityExpr(this);
//     }
// }