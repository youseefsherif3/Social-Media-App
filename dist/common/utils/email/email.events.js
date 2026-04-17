"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Eventemitter = void 0;
const node_events_1 = require("node:events");
exports.Eventemitter = new node_events_1.EventEmitter();
exports.Eventemitter.on("confirmEmail", async (fn) => {
    await fn();
});
