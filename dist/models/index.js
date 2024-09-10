"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sequelize = void 0;
const db_1 = __importDefault(require("../db")); // Adjust the path to your Sequelize instance
exports.sequelize = db_1.default;
const role_1 = __importDefault(require("./role"));
const permission_1 = __importDefault(require("./permission"));
const admin_1 = __importDefault(require("./admin"));
// Initialize models and associate them
const models = {
    Admins: admin_1.default,
    Role: role_1.default,
    Permission: permission_1.default,
};
// Call the associate method for each model to set up associations
Object.values(models).forEach(model => {
    if (model.associate) {
        model.associate(models);
    }
});
exports.default = models;
//# sourceMappingURL=index.js.map