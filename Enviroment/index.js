"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Enviroment = void 0;
var error_1 = require("../error/error");
var Enviroment = /** @class */ (function () {
    function Enviroment() {
        this.map = new Map();
    }
    Enviroment.prototype.define = function (name, val) {
        this.map.set(name, val);
    };
    Enviroment.prototype.assign = function (token, val) {
        if (this.map.has(token.lexeme)) {
            return this.map.get(token.lexeme);
        }
        throw new error_1.RuntimeError(token, 'Undefined variable ' + token.lexeme);
    };
    Enviroment.prototype.delete = function (name) {
        this.map.delete(name);
    };
    Enviroment.prototype.get = function (token) {
        if (this.map.has(token.lexeme)) {
            return this.map.get(token.lexeme);
        }
        throw new error_1.RuntimeError(token, 'Undefined variable ' + token.lexeme);
    };
    return Enviroment;
}());
exports.Enviroment = Enviroment;
