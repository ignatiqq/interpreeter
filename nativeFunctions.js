"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Clock = void 0;
var loxCallable_1 = require("./loxCallable");
var Clock = /** @class */ (function (_super) {
    __extends(Clock, _super);
    function Clock() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Clock.prototype.arity = function () {
        return 0;
    };
    Clock.prototype.call = function (interpreter, args) {
        return Date.now();
    };
    return Clock;
}(loxCallable_1.LoxCallable));
exports.Clock = Clock;
