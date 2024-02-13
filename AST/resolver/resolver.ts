import Language from "../../Interpreter";
import Interpreter from "../../Interpreter";
import { AssignmentExpr, BinaryExpr, CallExpr, Expr, ExprVisitor, GroupingExpr, LiteralExpr, LogicalExpr, UnaryExpr, VariableExpr } from "../../expressions/Expressions";
import { BlockStmt, ExpressionStmt, FunctionStmt, IfStmt, PrintStmt, ReturnStmt, Stmt, StmtVisitor, VarStmt, WhileStmt } from "../../statements/statements";
import Token from "../../tokens/Token/Token";
import { Interpreeter } from "../interpreeter";

enum FunctionType {
    NONE,
    FUNCTION
}

/**
 * Проверяем семантическую правильность кода пользователя
 * 
 * Мы могли бы пойти дальше и сообщать о предупреждениях для кода, который не обязательно ошибочен,
 *  но, вероятно, бесполезен. Например, многие IDE предупреждают, если после return оператора имеется
 * недостижимый код или локальная переменная, значение которой никогда не читается. 
 * Все это было бы довольно легко добавить в наш статический пропуск на посещение или в виде отдельных пропусков.
 */
export class Resolver implements ExprVisitor<any>, StmtVisitor<void> {
    interpreeter: Interpreeter;
    /**
     * stack
     * в хешмпапах будут храниться все переменные для определенный обалсти видимости
     * 
     * false = означает что переменная была объявлена, но еще не инициализирована (значением)
    */
    scopes = new Array<Map<string, boolean>>();

    /**
     * Мы так же хотим предотвратить return stmt
     * return 'anything';
     * не в функциях
     * поэтому будем отслеживать находимся ли мы сейчас в функции или нет
     * и в returnStmt визиторе смотреть если мы не в функции выдавать ошибку
     * @param interpreeter 
     */
    currentFunction = FunctionType.NONE;

    constructor(interpreeter: Interpreeter) {
        this.interpreeter = interpreeter;
    }

    visitBlockStmt(stmt: BlockStmt) {
        this.beginScope();
        this.resolveStmt(stmt);
        this.endScope();
        return null;
    }

    /**
     * объявление переменных
     * 
     * происходит в 2 этапе
     * объявление -> инициализация
     * если после объявления, но до инициализации мы будем обращаться к перменной
     * мы выддаим ошибку компиляции
     */
    visitVarStmt(stmt: VarStmt) {
        this.declare(stmt.token);
        if(stmt.initializer !== null) {
            this.resolveExpr(stmt.initializer);
        }
        this.define(stmt.token);
    }

    /** 
     * Здесь мы проверим обращается ли ктото в данной области видимости 
     * к переменной которая была объявлена, но еще не была инициализирована
     * var a;
     * var b = a;  <- an error
     * a = 'hello';
    */
    visitVariableExpr(expr: VariableExpr) {
        if(this.scopes.length > 0 && this.scopes[this.scopes.length - 1].get(expr.token.lexeme) === false) {
            Interpreter.error(expr.token, "Can't read local variable in its own initializer.");
        }

        this.resolveLocal(expr, expr.token);
        return null;
    }

    visitAssignmentExpr(expr: AssignmentExpr) {
        // ресолвим ехпрессион
        // это может быть VariableExpr, соответственно в теории можем обратиться к не инициализированной переменной
        // соответственно может быть ошибка, которую мы уже обработалм в visitVariableExpr
        this.resolveExpr(expr.expr);
        // перезаписываем переменную
        // a = b;
        this.resolveLocal(expr, expr.token);
        return null;
    }

    visitFunctionStmt(stmt: FunctionStmt): void {
        this.declare(stmt.identifier);
        this.define(stmt.identifier);
        this.resolveFunction(stmt, FunctionType.FUNCTION);
    }


    // методы визитора которые не объявляют или записывают перменные |
    //                                                               v
    // мы ничего в них не вычисляем и возвращаем, нам нужно
    // пройти через них (или нет) чтобы дойти до мест с изменением скоупа

    visitExpressionStmt(stmt: ExpressionStmt) {
        this.resolveStmt(stmt);
        return null;
    }

    visitBinaryExpr(expr: BinaryExpr) {
        this.resolveExpr(expr.left);
        this.resolveExpr(expr.right);
        return null;
    };

    /**
     *  Если динамическое выполнение затрагивает только ту ветку, которая выполняется,
     *  статический анализ консервативен — он анализирует любую ветку, которая может быть запущена.
     *  Поскольку любой из них может быть достигнут во время выполнения, мы разрешаем оба.
     */
    visitIfStmt(stmt: IfStmt) {
        this.resolveStmt(stmt.thenBranch);
        this.resolveExpr(stmt.condition);
        if(stmt.elseBranch !== null) this.resolveStmt(stmt.elseBranch);
        return null;
    }

    visitGroupingExpr(expr: GroupingExpr) {
        this.resolveExpr(expr.expression);
        return null;
    }

    visitReturnStmt(stmt: ReturnStmt) {
        if(this.currentFunction === FunctionType.NONE) {
            Language.error(stmt.keyword, 'Cant return from top-level code.');
        }
        if(stmt.expr !== null) this.resolveExpr(stmt.expr);
        return null;
    }

    visitWhileStmt(stmt: WhileStmt) {
        this.resolveExpr(stmt.condition);
        this.resolveStmt(stmt.body);
        return null;
    }

    visitCallExpr(expr: CallExpr) {
        this.resolveExpr(expr.callee);
        for(let val of expr.args) {
            this.resolveExpr(val);
        }
        return null;
    }

    visitLiteralExpr(expr: LiteralExpr) {
        return null;
    }

    visitLogicalExpr(expr: LogicalExpr) {
        this.resolveExpr(expr.left);
        this.resolveExpr(expr.right);
        return null;
    }

    visitPrintStmt(stmt: PrintStmt) {
        this.resolveExpr(stmt.expression);
        return null;
    }

    visitUnaryExpr(expr: UnaryExpr) {
        this.resolveExpr(expr.expression);
        return null;
    };

    // вспомогательные методы для разрешениий областей видимости

    /**
     * объявление
     */
    declare(token: Token) {
        if(this.scopes.length === 0) return;
        const currScope = this.scopes[this.scopes.length - 1];

        /**
         * we cant define two variables with the same name in one block stmt
         * 
         * fun bad() {
         *    var a = "first";
         *    var a = "second";
         * }
         */
        if(currScope.has(token.lexeme)) {
            Language.error(token, 'Already a variable with this name in this scope.');
        }

        currScope.set(token.lexeme, false);
    }

    /**
     * инициализация
     */
    define(token: Token) {
        if(this.scopes.length === 0) return;

        this.scopes[this.scopes.length - 1].set(token.lexeme, true);
    }

    resolveFunction(stmt: FunctionStmt, type: FunctionType) {
        // сохраняем состояние "в функции"
        const tempType = this.currentFunction;
        // не пишем FunctionType.FUNCTION чтобы метод работал и с классами
        this.currentFunction = type;
        this.beginScope();
        for(const param of stmt.params) { 
            this.declare(param);
            this.define(param);
        }
        this.resolveManyStmt(stmt.body);
        this.endScope();
        // раскручиваем currentFunction значение
        this.currentFunction = tempType;
    }

    /**
     * ресолвим (делаем тру в хешмапе (делаем инициализированной))
     * и передаем на каком уровне (глубине) скоупов находится переменная
     */
    resolveLocal(expr: Expr, token: Token) {
        for(let idx = this.scopes.length - 1; idx >= 0; idx++) {
            if(this.scopes[idx].has(token.lexeme)) {
                this.interpreeter.resolve(expr, (this.scopes.length - 1) - idx);
            }
        }
    }

    resolveManyStmt(stmts: Stmt[]) {
        for(const stmt of stmts) {
            this.resolveStmt(stmt);
        }
    }

    resolveStmt(stmt: Stmt) {
        // execute all stmts
        return stmt.accept(this);
    }

    resolveExpr(expr: Expr) {
        // execute all expr
        return expr.accept(this);
    }

    /**
     * здесь создаются новые области видимости
     * 
     * в хешмпапах будут храниться все переменные для определенный обалсти видимости
     */
    beginScope() {
        this.scopes.push(new Map<string, boolean>());
    }

    /**
     * Выходим из скоупа, когда выходим из блока
     */
    endScope() {
        this.scopes.pop();
    }

}