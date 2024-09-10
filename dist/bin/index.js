"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const node_http_1 = require("node:http");
dotenv_1.default.config();
const index_1 = __importDefault(require("../app/index"));
const db_1 = __importDefault(require("../db"));
const server = (0, node_http_1.createServer)(index_1.default);
const port = process.env.PORT ?? 5000;
db_1.default.sync({ alter: false }).then(() => {
    console.log("Connected to MySql");
});
server.listen(port, () => {
    console.log(`Server running on port: ${port} `);
});
//# sourceMappingURL=index.js.map