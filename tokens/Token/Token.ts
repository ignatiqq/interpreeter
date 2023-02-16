import { TOKEN_TYPES } from "../constants/tokensType";

type TokenContructorType = {
    // language keywords
    type: TOKEN_TYPES;
    // key (something-meaningful) word
    lexeme: string;
    literal: number | string | null;
    // we need to save token line to show errors with line
    line: number;
}

class Token {
    private type: TOKEN_TYPES;
    private lexeme: string;
    private literal: number | string | null;
    private line: number;

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