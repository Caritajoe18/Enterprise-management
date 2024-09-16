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
import {addRole, getAllRoles} from "../controller/roleController";
import { addPermissionsToRole, createPermissions, getAllPermissions, removePermissionsFromRole } from "../controller/permissionController";
import { authorize } from "../middleware/staffPermissions";
import { limiter } from "../utilities/auths";
import { createNavParent, getNavWithPermissions, getUserNavPermissions } from "../controller/navBarController";
import { authenticateAdmin } from "../middleware/adminAuth";

const router = express.Router();
router.post("/sign-up", signupAdmin);
router.post("/login", loginAdmin);

//permissions
router.post("/add-permissions", authorize(), createPermissions);
router.post("/add-nav", authorize(), createNavParent);
router.get("/get-nav",authenticateAdmin, getUserNavPermissions);
router.get("/get-permissions",authorize(), getAllPermissions);

//products
router.post("/add-product",authorize(), createProducts);
router.patch("/edit-product/:id",authorize(), updateProducts);
router.get("/get-products", getProducts);
router.get("/search-products",authorize(), searchProducts);
router.delete("/delete-product/:id",authorize(), deleteProduct);

//staff
router.post('/create-role',authorize(), addRole);
router.get('/get-roles',authorize, getAllRoles);
router.patch('/add-permission/:roleId/permissions',authorize(), addPermissionsToRole);
router.delete('/remove-permission/:roleId/permissions',authorize(), removePermissionsFromRole);


router.post("/reg-staff",authorize(), signupStaff);
router.post("/login-mail", loginMial);
router.post("/forgot", limiter,authorize(), forgotPassword);

router.patch("/reset-password",limiter, resetPassword);
router.patch("/update-staff/:id", updateStaff);
router.patch("/suspend-staff/:id", suspendStaff);
router.patch("/restore-staff/:id", restoreStaff);
router.delete("/delete-staff/:id", deleteStaff);
router.get("/all-staff", getAllStaff);
router.get("/search-staff", searchStaff);
router.get("/suspended-staff", getSuspendedStaff);

export default router;
