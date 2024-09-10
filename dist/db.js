"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
//import fs from "fs";
//import path from "path";
// const file = path.join(__dirname, "../..", "certificate.pem");
// const file2 = path.join(__dirname, "../../", "private-key.pem");
const sequelize = new sequelize_1.Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    dialect: "mysql",
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    logging: false,
    // //ssl: true,
    // dialectOptions: {
    // 	ssl: {
    // 		key: fs.readFileSync(file2),
    // 		cert: fs.readFileSync(file),
    // 	},
    // },
});
exports.default = sequelize;
//# sourceMappingURL=db.js.map