"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = initDb;
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function initDb() {
    const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/";
    mongoose_1.default
        .connect(mongoUri, {
        authSource: "admin",
    })
        .then(() => console.log("Подключено к MongoDB"))
        .catch(error => console.error("Ошибка подключения к MongoDB:", error));
}
;
