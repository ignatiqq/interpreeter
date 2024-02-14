"use strict";
exports.__esModule = true;
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
        if (!this.isGlobalEnviroment())
            return this.enclosing.assign(token, val);
        throw new error_1.RuntimeError(token, 'Undefined variable ' + token.lexeme);
    };
    Enviroment.prototype["delete"] = function (name) {
        this.map["delete"](name);
    };
    Enviroment.prototype.get = function (token) {
        if (this.map.has(token.lexeme)) {
            return this.map.get(token.lexeme);
        }
        // @ts-ignore @TODO
        // рекурсивный поиск перменных в областях видимости (евайроментах) выше
        if (!this.isGlobalEnviroment())
            return this.enclosing.get(token);
        throw new error_1.RuntimeError(token, 'Undefined variable ' + token.lexeme);
    };
    Enviroment.prototype.isGlobalEnviroment = function () {
        return this.enclosing === null;
    };
    // getAt method который берет расстояние до локальной переменной определнной по шагам
    // из Resolver класса
    Enviroment.prototype.getAt = function (distance, name) {
        return this.ancestor(distance).map.get(name);
    };
    /**
     * мы будем уходить вверх ровно на distance кол-во шагов
     * которые получили из Resolver класса
     * Так же мы точно знаем что переменная существует, так как она попала в мапу и до нее есть расстояние
     */
    Enviroment.prototype.ancestor = function (distance) {
        var env = this;
        for (var i = 0; i < distance; i++) {
            // It will be Enviroment in any cases
            // because we checking locals now which already locals not globals
            // because of resolver
            // @ts-expect-error
            env = env.enclosing;
        }
        return env;
    };
    /**
     * присваивание переменной значения
     * знаем на каком уровне оно находится
     */
    Enviroment.prototype.assignAt = function (distance, name, val) {
        this.ancestor(distance).map.set(name, val);
    };
    return Enviroment;
}());
exports.Enviroment = Enviroment;
