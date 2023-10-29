type TokenContructorType = {
    // language keywords
    // ключ для определенной лексемы, например
    // LEFT_PAREN: '{'
    // где: 
    // лексема это '{', а 
    // type: LEFT_PAREN
    type: string;
    lexeme: string;
    // литерал в случае обработки переменных почти всегда тоже самое что и лексема,
    // тоесть литерал это например название переменной
    literal: TokenLiteralType;
    // we need to save token line to show errors with line
    // для обработки ошибок
    line: number;
}

export type TokenLiteralType = number | string | null;

class Token {
    type: string;
    lexeme: string;
    literal: TokenLiteralType;
    line: number;

    constructor(options: TokenContructorType) {
        const { type, lexeme, literal, line } = options;
        this.type = type;
        this.lexeme = lexeme;
        this.literal = literal;
        this.line = line;
    }

    public toString() {
        return `${this.type} ${this.lexeme} ${this.literal}`;
    }
}

export default Token;