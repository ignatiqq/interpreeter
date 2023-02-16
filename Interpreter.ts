import fs from 'fs';

import Scanner from './scanner/Scanner/Scanner';

type ErrorReporterOptions = {
	line: number;
	where: string;
	message: string;
}


class Interpreter {
	originalStr: string;
	static hadError = false;

	static signalError(line: number, message: string) {
		this.reportError({ line, where: "", message });
	}

	static reportError(options: ErrorReporterOptions) {
		const { line, where, message } = options;
		Interpreter.hadError = true;
		console.error(`[Line ${line} ] Error ${where}: ${message}`);
	}

	public interprete(path: string) {
		if (path) {
			this.runFile(path);
		}
	}

	private runFile(path: string) {
		const originalCode = fs.readFileSync(path, 'utf-8');
		console.log({ originalCode });
		this.run(originalCode);

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