import { Interpreeter } from './AST/interpreeter';
import { ASTPrinter } from './AST/printer/ASTprinter';
import { Parser } from './parser/Parser';
import Scanner from './scanner/Scanner/Scanner';
import { TOKEN_TYPES } from './tokens/constants/tokensType';
import Token from './tokens/Token/Token';

type ErrorReporterOptions = {
	line: number;
	where: string;
	message: string;
}


class Language {
	static hadError = false;
	static hadRuntimeError = false;
	static interpreter = new Interpreeter();

	static error(token: Token, message: string) {
		if(token.type === TOKEN_TYPES.EOF) {
			this.signalError(token.line, 'at end' + message)
		} else {
			this.signalError(token.line, 'at' + ` "${token.lexeme}". ` + message);
		}
	}

	static runtimeError(token: Token, message: string) {
		console.error(`\x1b[33m [Line ${token.line}] Error: ${message} \x1b[0m`);
		this.hadRuntimeError = true;
	}

	static signalError(line: number, message: string) {
		this.reportError({ line, where: "", message });
	}

	static reportError(options: ErrorReporterOptions) {
		const { line, where, message } = options;
		Language.hadError = true;
		console.error(`\x1b[33m [Line ${line}] Error: ${message} \x1b[0m`);
	}

	public interprete(source: string) {
		return this.runFile(source);
	}

	private runFile(source: string) {
		return this.run(source);
	}

	private run(source: string) {
		const scanner = new Scanner(source);
		const tokens = scanner.scanTokens();

		if (Language.hadError || Language.hadRuntimeError) {
			return;
		}
		return this.parse(tokens);
	}

	private parse(tokens: Token[]) {
		const parser = new Parser(tokens);
		const syntaxTree = parser.parse();

		if(syntaxTree) {
			Language.interpreter.interprete(syntaxTree);
			// return Interpreter.interpreterMath.evaluate(syntaxTree);
		}
	}
}

export default Language;