import Token from "../tokens/Token/Token";

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

export class ParseError extends Error {

}

export class RuntimeError extends Error {
  token: Token;
  message: string;

  constructor(token: Token, message: string) {
    super();
    this.token = token;
    this.message = message;
  }
}