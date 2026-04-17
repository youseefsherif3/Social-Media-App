"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_model_1 = __importDefault(require("../../DB/models/user.model"));
class UserService {
    _userModel = user_model_1.default;
    constructor() { }
    signUp = async (req, res, next) => {
        let { userName, email, password, age, gender, address, phone, } = req.body;
        const newUser = await this._userModel.create({
            userName,
            email,
            password,
            age,
            gender,
            address,
            phone,
        });
        res.status(201).json({ message: "User signed up successfully", user: newUser });
    };
}
exports.default = new UserService();
