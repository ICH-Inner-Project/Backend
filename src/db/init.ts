import mongoose from "mongoose";

import dotenv from "dotenv";
dotenv.config();

export default function initDb() {
    const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/";
    mongoose
        .connect(
            mongoUri,
            {
                authSource: "admin",
            },
        )
        .then(() => console.log("Подключено к MongoDB"))
        .catch(error => console.error(
            "Ошибка подключения к MongoDB:", error,
        ));
};
