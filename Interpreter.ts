import fs from 'fs';

import Scanner from './scanner/Scanner/Scanner';

type ErrorReporterOptions = {
	line: number;
	where: string;
	message: string;
}


class Interpreter {
	static hadError = false;

	static signalError(line: number, message: string) {
		this.reportError({ line, where: "", message });
	}

	static reportError(options: ErrorReporterOptions) {
		const { line, where, message } = options;
		Interpreter.hadError = true;
		console.error(`\x1b[33m [Line ${line}] Error ${where}: ${message} \x1b[0m`);
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

		for (let i = 0; i < tokens.length; i++) {
			console.log(tokens[i]);
		}
	}
}

export default Interpreter;