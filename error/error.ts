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

// класс ехтендящий рантайм ошибку потомучто рантайм === интерпритатор
// а исключения используется для раскручивания стеков вызова
export class Return extends RuntimeError {
  // значения return эксепшна, которое будет использоваться
  // для асайна
  // например
  //             throw error here because of "return" inside and assign value
  // var value = getValue();
  value: any;

  constructor(value: any) {
    // @ts-ignore 
    super(null, null);
    this.value = value;
  }
}