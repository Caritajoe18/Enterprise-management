"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const customerController_1 = require("../controller/customerController");
const staffPermissions_1 = require("../middleware/staffPermissions");
const router = express_1.default.Router();
router.post('/register', (0, staffPermissions_1.authorize)('register-customer'), customerController_1.createCustomer);
router.get('/get-customers', (0, staffPermissions_1.authorize)('get-customers'), customerController_1.getAllCustomers);
router.get('/get-customer/:id', customerController_1.getCustomer);
router.patch('/update-customer', customerController_1.updateCustomer);
exports.default = router;
//# sourceMappingURL=customerRoutes.js.map