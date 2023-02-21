
export class SyntaxError extends Error {
    line?: number;
    message: string;
    name = "SyntaxError"
    where?: string;

    constructor(message: string, line?: number, where?: string) {
        super()
        this.message = message;
        this.line = line;
        this.where = where;
      }
}

export class ParseError extends Error {}
