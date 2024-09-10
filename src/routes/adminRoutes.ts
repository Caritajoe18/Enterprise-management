import express from "express";
import {
  forgotPassword,
  loginAdmin,
  loginMial,
  resetPassword,
  signupAdmin,
} from "../controller/adminController";
//import { authenticateAdmin } from '../middleware/adminAuth';
import {
  createProducts,
  deleteProduct,
  getProducts,
  searchProducts,
  updateProducts,
} from "../controller/productController";
import {
  deleteStaff,
  getAllStaff,
  searchStaff,
  getSuspendedStaff,
  restoreStaff,
  signupStaff,
  suspendStaff,
  updateStaff,
} from "../controller/staffController";
import {addRole} from "../controller/roleController";
import { addPermissionsToRole, createPermissions, removePermissionsFromRole } from "../controller/permissionController";
import { authorize } from "../middleware/staffPermissions";

const router = express.Router();
router.post("/sign-up", signupAdmin);
router.post("/login", loginAdmin);

//permissions
router.post("/add-permissions", createPermissions);

//products
router.post("/add-product", createProducts);
router.patch("/edit-product/:id", updateProducts);
router.get("/get-products", getProducts);
router.get("/search-products", searchProducts);
router.delete("/delete-product/:id", deleteProduct);

//staff
router.post('/create-role',authorize('admin'), addRole);
router.patch('/add-permission/:roleId/permissions', addPermissionsToRole);
router.delete('/remove-permission/:roleId/permissions', removePermissionsFromRole);


router.post("/reg-staff", signupStaff);
router.post("/login-mail", loginMial);
router.post("/forgot", forgotPassword);

router.patch("/reset-password/:token", resetPassword);
router.patch("/update-staff/:id", updateStaff);
router.patch("/suspend-staff/:id", suspendStaff);
router.patch("/restore-staff/:id", restoreStaff);
router.delete("/delete-staff/:id", deleteStaff);
router.get("/all-staff", getAllStaff);
router.get("/search-staff", searchStaff);
router.get("/suspended-staff", getSuspendedStaff);

export default router;
