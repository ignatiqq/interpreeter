"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Enviroment = void 0;
var error_1 = require("../error/error");
var Enviroment = /** @class */ (function () {
    function Enviroment(enclosing) {
        if (enclosing === void 0) { enclosing = null; }
        this.map = new Map();
        this.enclosing = enclosing;
    }
    Enviroment.prototype.define = function (name, val) {
        this.map.set(name, val);
    };
    Enviroment.prototype.assign = function (token, val) {
        if (this.map.has(token.lexeme)) {
            return this.map.set(token.lexeme, val);
        }
        // @ts-ignore @TODO
        if (!this.isGlobalEnviroment)
            return this.enclosing.assign(token, val);
        throw new error_1.RuntimeError(token, 'Undefined variable ' + token.lexeme);
    };
    Enviroment.prototype.delete = function (name) {
        this.map.delete(name);
    };
    Enviroment.prototype.get = function (token) {
        if (this.map.has(token.lexeme)) {
            return this.map.get(token.lexeme);
        }
        // @ts-ignore @TODO
        // рекурсивный поиск перменных в областях видимости (евайроментах) выше
        if (!this.isGlobalEnviroment)
            return this.enclosing.get(token);
        throw new error_1.RuntimeError(token, 'Undefined variable ' + token.lexeme);
    };
    Object.defineProperty(Enviroment.prototype, "isGlobalEnviroment", {
        get: function () {
            return this.enclosing === null;
        },
        enumerable: false,
        configurable: true
    });
    return Enviroment;
}());
exports.Enviroment = Enviroment;
