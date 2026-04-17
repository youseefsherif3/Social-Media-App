import { EventEmitter } from "node:events";

//* Creating an instance of EventEmitter to handle custom events related to email operations
export const Eventemitter = new EventEmitter();

Eventemitter.on("confirmEmail", async (fn) => {
	await fn();
});