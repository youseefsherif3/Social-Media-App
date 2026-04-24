import { EventEmitter } from "node:events";
import { EmailEnum } from "../../enum/user.enum";

//* Creating an instance of EventEmitter to handle custom events related to email operations
export const Eventemitter = new EventEmitter();

Eventemitter.on(EmailEnum.verification, async (fn) => {
	await fn();
});