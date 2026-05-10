"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const config_service_1 = require("../config/config.service");
const connectDB = async () => {
    try {
        await mongoose_1.default.connect(config_service_1.MONGO_URI, { dbName: "Social_Media_App" });
        console.log(`Connected To Database Successfully to : ${config_service_1.MONGO_URI}`);
    }
    catch (error) {
        console.error("Error connecting to database:", error);
    }
};
exports.connectDB = connectDB;
