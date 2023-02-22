import { Parser } from './parser/Parser';
import Scanner from './scanner/Scanner/Scanner';
import { TOKEN_TYPES } from './tokens/constants/tokensType';
import Token from './tokens/Token/Token';

type ErrorReporterOptions = {
	line: number;
	where: string;
	message: string;
}


class Interpreter {
	static hadError = false;

	static error(token: Token, message: string) {
		if(token.type === TOKEN_TYPES.EOF) {
			this.signalError(token.line, 'at end' + message)
		} else {
			this.signalError(token.line, 'at' + ` "${token.lexeme}". ` + message);
		}
	}

	static signalError(line: number, message: string) {
		this.reportError({ line, where: "", message });
	}

	static reportError(options: ErrorReporterOptions) {
		const { line, where, message } = options;
		Interpreter.hadError = true;
		console.error(`\x1b[33m [Line ${line}] Error: ${message} \x1b[0m`);
	}

	public interprete(source: string) {
		this.runFile(source);
	}

	private runFile(source: string) {
		this.run(source);

		if (Interpreter.hadError) {
			return;
		}
	}

	private run(source: string) {
		const scanner = new Scanner(source);
		const tokens = scanner.scanTokens();
		this.parse(tokens);
	}

	private parse(tokens: Token[]) {
		const parser = new Parser(tokens);
		console.log('parse result: ', parser.parse());
	}
}

export default Interpreter;