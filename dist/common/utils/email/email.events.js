"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Eventemitter = void 0;
const node_events_1 = require("node:events");
const user_enum_1 = require("../../enum/user.enum");
exports.Eventemitter = new node_events_1.EventEmitter();
exports.Eventemitter.on(user_enum_1.EmailEnum.verification, async (fn) => {
    await fn();
});
