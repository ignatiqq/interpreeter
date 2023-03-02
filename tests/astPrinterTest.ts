import { ASTPrinter } from "../AST/printer/ASTprinter";
import { BinaryExpr, UnaryExpr, GroupingExpr, LiteralExpr } from "../expressions/Expressions";
import Token from '../tokens/Token/Token';
import {TOKEN_TYPES} from '../tokens/constants/tokensType';


const expression = new BinaryExpr(
        new UnaryExpr(new Token({type: TOKEN_TYPES.MINUS, lexeme: "-", literal: null, line: 1}), new LiteralExpr(123)),
        new Token({type: TOKEN_TYPES.STAR, lexeme: "*", literal: null, line: 1}),
        new GroupingExpr(new BinaryExpr(new LiteralExpr('Hello '), new Token({type: TOKEN_TYPES.PLUS, lexeme: "+", literal: null, line: 2}), new LiteralExpr('World!'))));

        // const expression = new UnaryExpr(new Token({type: TOKEN_TYPES.MINUS, lexeme: "-", literal: null, line: 1}), new LiteralExpr(123));

        // console.log({expression});
const Flatter = new ASTPrinter().visit(expression);
console.log(Flatter);