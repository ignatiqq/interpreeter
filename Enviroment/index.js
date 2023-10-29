"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Enviroment = void 0;
var error_1 = require("../error/error");
var Enviroment = /** @class */ (function () {
    function Enviroment() {
        this.map = new Map();
    }
    Enviroment.prototype.define = function (name, val) {
        console.log('define name: ', name);
        this.map.set(name, val);
    };
    Enviroment.prototype.delete = function (name) {
        this.map.delete(name);
    };
    Enviroment.prototype.get = function (token) {
        console.log("env.get map: ", this.map, 'token: ', token);
        if (this.map.has(token.lexeme)) {
            return this.map.get(token.lexeme);
        }
        throw new error_1.RuntimeError(token, 'Undefined variable ' + token.lexeme);
    };
    return Enviroment;
}());
exports.Enviroment = Enviroment;
