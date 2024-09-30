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
  orderStaffFirstname,
} from "../controller/staffController";
import {addRole, getAllRoles, getRoles} from "../controller/roleController";
import { addPermissionsToRole, createPermissions, getAllPermissions, removePermissionsFromRole } from "../controller/permissionController";
import { authorize } from "../middleware/staffPermissions";
import { limiter } from "../utilities/auths";
import { createNavParent, getAllNavandPerm, getNavWithPermissions, getUserNavPermissions } from "../controller/navBarController";
import { authenticateAdmin } from "../middleware/adminAuth";

const router = express.Router();
router.post("/sign-up", signupAdmin);
router.post("/login", loginAdmin);

//permissions
router.get("/get-all-nav", getAllNavandPerm);
router.post("/add-permissions", authorize(), createPermissions);
router.post("/add-nav", authorize(), createNavParent);
router.get("/get-nav",authenticateAdmin, getUserNavPermissions);
router.get("/get-permissions",authorize(), getAllPermissions);

//router.get("/get-permissi",authorize(), getNavWithPermissions ); //testing


//products
router.post("/add-product",authorize(), createProducts);
router.patch("/edit-product/:id",authorize(), updateProducts);
router.get("/get-products",authorize(), getProducts);
router.get("/search-products",authorize(), searchProducts);
router.delete("/delete-product/:id",authorize(), deleteProduct);

//staff
router.post('/create-role',authorize(), addRole);
router.get('/get-roles',authorize(), getAllRoles);
router.get('/get-rolePerm',authorize(), getRoles);
router.patch('/add-permission/:roleId/permissions',authorize(), addPermissionsToRole);
router.delete('/remove-permission/:roleId/permissions',authorize(), removePermissionsFromRole);


router.post("/reg-staff",authorize(), signupStaff);
router.post("/login-mail", loginMial);
router.post("/forgot", limiter,authorize(), forgotPassword);

router.patch("/reset-password",limiter, resetPassword);
router.patch("/update-staff/:id",authorize(), updateStaff);
router.patch("/suspend-staff/:id", authorize(),suspendStaff);
router.patch("/restore-staff/:id",authorize(), restoreStaff);
router.delete("/delete-staff/:id", authorize(),deleteStaff);
router.get("/all-staff",authorize(), getAllStaff);
router.get("/search-staff", searchStaff);
router.get("/suspended-staff", authorize(),getSuspendedStaff);
router.get("/order-staff", authorize(),orderStaffFirstname);

export default router;
