"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const adminController_1 = require("../controller/adminController");
//import { authenticateAdmin } from '../middleware/adminAuth';
const productController_1 = require("../controller/productController");
const staffController_1 = require("../controller/staffController");
const roleController_1 = require("../controller/roleController");
const permissionController_1 = require("../controller/permissionController");
const staffPermissions_1 = require("../middleware/staffPermissions");
const router = express_1.default.Router();
router.post("/sign-up", adminController_1.signupAdmin);
router.post("/login", adminController_1.loginAdmin);
//permissions
router.post("/add-permissions", permissionController_1.createPermissions);
//products
router.post("/add-product", productController_1.createProducts);
router.patch("/edit-product/:id", productController_1.updateProducts);
router.get("/get-products", productController_1.getProducts);
router.get("/search-products", productController_1.searchProducts);
router.delete("/delete-product/:id", productController_1.deleteProduct);
//staff
router.post('/create-role', (0, staffPermissions_1.authorize)('admin'), roleController_1.addRole);
router.patch('/add-permission/:roleId/permissions', permissionController_1.addPermissionsToRole);
router.delete('/remove-permission/:roleId/permissions', permissionController_1.removePermissionsFromRole);
router.post("/reg-staff", staffController_1.signupStaff);
router.post("/login-mail", adminController_1.loginMial);
router.post("/forgot", adminController_1.forgotPassword);
router.patch("/reset-password/:token", adminController_1.resetPassword);
router.patch("/update-staff/:id", staffController_1.updateStaff);
router.patch("/suspend-staff/:id", staffController_1.suspendStaff);
router.patch("/restore-staff/:id", staffController_1.restoreStaff);
router.delete("/delete-staff/:id", staffController_1.deleteStaff);
router.get("/all-staff", staffController_1.getAllStaff);
router.get("/search-staff", staffController_1.searchStaff);
router.get("/suspended-staff", staffController_1.getSuspendedStaff);
exports.default = router;
//# sourceMappingURL=adminRoutes.js.map