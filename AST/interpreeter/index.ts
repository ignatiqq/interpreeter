import { constants } from "buffer";
import { Enviroment, VariableValueType } from "../../Enviroment";
import { Return, RuntimeError } from "../../error/error";
import { Expr, ExprVisitor, LiteralExpr, UnaryExpr, BinaryExpr, GroupingExpr, VariableExpr, AssignmentExpr, LogicalExpr, CallExpr, GetExpr, SetExpr, ThisExpr } from "../../expressions/Expressions";
import Interpreter from "../../Interpreter";
import { LoxCallable, LoxClass, LoxFunction, LoxInstance } from "../../loxCallable";
import { Clock } from "../../nativeFunctions";
import { BlockStmt, ClassStmt, ExpressionStmt, FunctionStmt, IfStmt, PrintStmt, ReturnStmt, Stmt, StmtVisitor, VarStmt, WhileStmt } from "../../statements/statements";
import { TOKEN_TYPES } from "../../tokens/constants/tokensType";
import Token from "../../tokens/Token/Token";

type LiteralReturnType = string | number | boolean | null;

/**
 * Interptreete - класс интерпритатора реализовывающий все методы посетителя 
 * (Рекурсивный обход и выполнение AST дерева)
 * имеющихся Expression и Statemen'тов
 * наш интерпретатор выполняет пост-заказный обход — каждый узел оценивает своих дочерних узлов,
 * прежде чем выполнять свою собственную работу.
 *  
 */
export class Interpreeter implements ExprVisitor<any>, StmtVisitor<void> {
    enviroment: Enviroment;
    // globals enviroment used for provide language base functions
    globals: Enviroment;

    /**
     * resolving variables
     * 
     * храним здесь только initialized (определенные) 
     * перменные к которым мы можем получить доступ
     */
    locals = new Map<Expr, number>();

    constructor(enviroment: Enviroment) {
        this.globals = enviroment;
        this.enviroment = this.globals;

        this.globals.define('clock', new Clock());
    }

    // ресолв всех переменных которые мы заранее (одним проходом) собрали и прикрепили
    // к разным областям видимости
    resolve(expr: Expr, depth: number) {
        this.locals.set(expr, depth);
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

    // @ts-ignore it will anyway reset code interpreeting
    evaluate(expr: Expr): VariableValueType {
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
                }

                if(typeof left === 'string' && typeof right === 'string') {
                    return left + right;
                }
                
                if(typeof left === 'number' && typeof right === 'number') {
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

        let distance = this.locals.get(expr);

        if(!Number.isInteger(distance)) {
            this.globals.assign(expr.token, val)
        } else {
            // @ts-ignore
            this.enviroment.assignAt(distance, expr.token.lexeme, val);
        }

        // @ts-ignore
        // this.enviroment.assign(expr.token, val);

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
        return this.enviroment.get(stmt.token);
    };

    // имя переменной это expression
    // потомучто нужно вычислить чем является имя, 
    // а значит имя = значение (имя преобразуется в значение, а значение = Expression)
    visitVariableExpr(expr: VariableExpr) {
        // берем переменную из enviroment по имени
        // return this.enviroment.get(expr.token);
        return this.lookupForVariable(expr.token, expr);
    }

    lookupForVariable(token: Token, expr: Expr) {
        const distance = this.locals.get(expr);
        
        if(!Number.isInteger(distance)) { 
            return this.globals.get(token);
        } else {
            // @ts-ignore
            return this.enviroment.getAt(distance, token.lexeme);
        }
    }

    // stmt visitors
    visitExpressionStmt(stmt: ExpressionStmt) {
        return this.evaluate(stmt.expression);
    };

    visitPrintStmt(stmt: PrintStmt) {
        // выполняем и получаем значение потомучто в print мы передаем
        // только expression мы не можем передать statement (консрукцию языка)
        // потомучто оно не ресолвиться в значение (value)
        const expr = this.evaluate(stmt.expression);
        console.log(expr);
    };

    executeBlock(stmts: Stmt[], enviroment: Enviroment) {
        const prev = this.enviroment;

        // finally 
        // здесь только для того чтобы гарантировать рампутывание енвайромента
        // в блоке может и не быть ошибки
        try {
            // рекурсивно проваливаемся в новый енвайромент
            this.enviroment = enviroment;
            for(const stmt of stmts) {
                this.execute(stmt);
            }
        } finally {
            // распутываем рекурсию
            this.enviroment = prev;
        }
    }

    visitBlockStmt(stmt: BlockStmt) {
        this.executeBlock(stmt.stmts, new Enviroment(this.enviroment));
        return null;
    }

    visitIfStmt(stmt: IfStmt) {
        // check on truethly
        // because we want to let it run "if(123)" or "if('hello')"
        const isConditionTruthly = this.isTruthy(this.evaluate(stmt.condition));

        if(isConditionTruthly) {
            this.execute(stmt.thenBranch);
        } else if(stmt.elseBranch !== null) {
            this.execute(stmt.elseBranch);
        }

        return null;
    }

    visitLogicalExpr(expr: LogicalExpr) {
        if(expr.operator.type === TOKEN_TYPES.OR) {
            return this.evaluate(expr.left) || this.evaluate(expr.right);
        }

        if(expr.operator.type === TOKEN_TYPES.AND) {
            return this.evaluate(expr.left) && this.evaluate(expr.right);
        }
    }

    visitWhileStmt(stmt: WhileStmt) {
        while(this.isTruthy(this.evaluate(stmt.condition))) {
            this.execute(stmt.body);
        }
        return null;
    }

    visitClassStmt(stmt: ClassStmt): null {
        this.enviroment.define(stmt.token.lexeme, null);

        // resolve this for class methods
        const methods = new Map<string, LoxFunction>();

        for(const method of stmt.methods) {
            const fn = new LoxFunction(method, this.enviroment);
            methods.set(method.identifier.lexeme, fn);
        }

        const klass = new LoxClass(stmt.token.lexeme, methods);
        this.enviroment.assign(stmt.token, klass);
        return null;
    }

    visitFunctionStmt(stmt: FunctionStmt): null {
        // this.enviroment.define(stmt.identifier.lexeme, stmt.)
        const fn = new LoxFunction(stmt, this.enviroment);
        // define function indentifier in enviroment
        this.enviroment.define(stmt.identifier.lexeme, fn);
        return null;
    }

    visitCallExpr(expr: CallExpr) {
        // actually identifier
        const callee = this.evaluate(expr.callee);

        const evaluatedArgs: VariableValueType[] = [];

        for(const arg of expr.args) {
            evaluatedArgs.push(this.evaluate(arg));
        }

        if(!(callee instanceof LoxFunction) && !(callee instanceof LoxClass)) {
            throw new RuntimeError(expr.paren, 'Can only call functions and classes.');
        }

        if(evaluatedArgs.length !== callee.arity()) {
            throw new RuntimeError(expr.paren, 'Expected ' + callee.arity() + ' arguments but got ' + arguments.length);
        }

        return callee.call(this, evaluatedArgs);
    }
    
    visitThisExpr(expr: ThisExpr) {
        return this.lookupForVariable(expr.token, expr);
    }

    /**
     * Так как только в джсе можно литерально создать объект
     * 
     * а в других языках объекты генерят только классы мы будем првоерять на инстанс и 
     * выхывать гет метод у LoxInstance рантайм класса
     * @param expr 
     */
    visitGetExpr(expr: GetExpr) {
        const object = this.evaluate(expr.object);

        if(object instanceof LoxInstance) {
            // реализовать у рантайм класса инстанса метод get
            return object.get(expr.token);
        }

        throw new RuntimeError(expr.token, 'Only instances have properties.');
    }

    visitSetExpr(expr: SetExpr) {
        const object = this.evaluate(expr.object);

        if(object instanceof LoxInstance) {
            const value = this.evaluate(expr.value);

            object.set(expr.token, value);
            return value;
        }

        throw new RuntimeError(expr.token, 'Only instances can set properties.');
    }

    // мы используем исключение для раскручивания стека
    // чтобы выйти из всех циклов и функций
    visitReturnStmt(stmt: ReturnStmt): void {
        let value: VariableValueType = null;
        
        if(stmt.expr !== null) value = this.evaluate(stmt.expr);

        // раскручиваем стек со значением которое вернем
        throw new Return(value);
    }
}