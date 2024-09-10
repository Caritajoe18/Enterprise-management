"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importStar(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const http_errors_1 = __importDefault(require("http-errors"));
const routes_1 = __importDefault(require("../routes")); // Ensure this is your main routing file
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const adminRoutes_1 = __importDefault(require("../routes/adminRoutes"));
const customerRoutes_1 = __importDefault(require("../routes/customerRoutes"));
const app = (0, express_1.default)();
// Middleware setup
app.use((0, cors_1.default)());
app.use((0, helmet_1.default)());
app.use((0, express_1.json)());
app.use((0, express_1.urlencoded)({ extended: true }));
app.use((0, morgan_1.default)("dev"));
app.use((0, cookie_parser_1.default)());
// Mount the admin routes
app.use('/admin', adminRoutes_1.default);
app.use('/customer', customerRoutes_1.default);
// Mount the main routes if applicable
app.use(routes_1.default);
// 404 error handler
app.use((req, res, next) => {
    next((0, http_errors_1.default)(404));
});
// General error handler
app.use((err, req, res) => {
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};
    // Change this to respond with JSON if not rendering views
    res.status(err.status || 500);
    res.json({ error: res.locals.message }); // Return JSON for errors
});
exports.default = app;
//# sourceMappingURL=index.js.map