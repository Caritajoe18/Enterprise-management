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
  getRawMaterials,
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
  getAdmin,
} from "../controller/staffController";
import {
  addRole,
  editRole,
  editRolePermissions,
  getARoleWithPermission,
  getAllRoles,
  getRoles,
} from "../controller/roleController";
import {
  addPermissionsToRole,
  bulkEditPermissions,
  createPermissions,
  getAllPermissions,
  removePermissionsFromRole,
} from "../controller/permissionController";
import { authorize } from "../middleware/staffPermissions";
import { limiter } from "../utilities/auths";
import {
  createNavParent,
  getAllNavandPerm,
  getNavWithPermissions,
  getUserNavPermissions,
} from "../controller/navBarController";
import { authenticateAdmin } from "../middleware/adminAuth";
import {
  approveCashTicket,
  getAuthToWeigh,
  getCashTicket,
  getLPO,
  getStoreAuth,
  raiseAuthToCollectFromStore,
  raiseAuthToWeight,
  raiseCashTicket,
  raiseLPO,
  rejectCashTicket,
  sendAuthtoweigh,
  sendLPOToAdmin,
  sendStoreCollectionAdmin,
  sendTicketToAdmin,
} from "../controller/ticketController";
import { createCashierEntry, getCashierEntry } from "../controller/cashier";
import { getAuthToWeighDetails } from "../controller/weighBridge";
import { getNotifications } from "../controller/notification";

const router = express.Router();
router.post("/sign-up", signupAdmin);
router.post("/login", loginAdmin);

//permissions
router.get("/get-all-nav", getAllNavandPerm);
router.post("/add-permissions", authorize(), createPermissions);
router.patch("/edit-permissions", authorize(), bulkEditPermissions);
router.post("/add-nav", authorize(), createNavParent);
router.get("/get-nav", authenticateAdmin, getUserNavPermissions);
router.get("/get-permissions", authorize(), getAllPermissions);

//products
router.post("/add-product", authorize(), createProducts);
router.patch("/edit-product/:id", authorize(), updateProducts);
router.get("/get-products", authorize(), getProducts);
router.get("/get-raw-materials", authorize(), getRawMaterials);
router.get("/search-products", authorize(), searchProducts);
router.delete("/delete-product/:id", authorize(), deleteProduct);

//staff
router.post("/create-role", authorize(), addRole);
router.get("/get-roles", authorize(), getAllRoles);
router.get("/get-rolePerm", authorize(), getRoles);
router.get("/get-a-role/:roleId", authorize(), getARoleWithPermission);
router.put("/edit-role/:roleId", authorize(), editRole);
router.put("/editing-role/:roleId", authorize(), editRolePermissions); // on review
router.patch(
  "/add-permission/:roleId/permissions",
  authorize(),
  addPermissionsToRole
);
router.delete(
  "/remove-permission/:roleId/permissions",
  authorize(),
  removePermissionsFromRole
);

router.post("/reg-staff", authorize(), signupStaff);
router.post("/login-mail", loginMial);
router.post("/forgot", limiter, forgotPassword);

router.patch("/reset-password", limiter, resetPassword);
router.patch("/update-staff/:id", authorize(), updateStaff);
router.patch("/suspend-staff/:id", authorize(), suspendStaff);
router.patch("/restore-staff/:id", authorize(), restoreStaff);
router.delete("/delete-staff/:id", authorize(), deleteStaff);
router.get("/all-staff", authorize(), getAllStaff);
router.get("/all-admin", getAdmin);
router.get("/search-staff", searchStaff);
router.get("/suspended-staff", authorize(), getSuspendedStaff);
router.get("/order-staff", orderStaffFirstname);

//cashier
router.post("/create-cashier-book", authorize(), createCashierEntry);
router.get("/cashier-ledger", authorize(), getCashierEntry);

//tickets
router.post("/cash-ticket", authorize(), raiseCashTicket);
router.post("/raise-lpo", authorize(), raiseLPO);
router.post(
  "/raise-store-collection",
  authorize(),
  raiseAuthToCollectFromStore
);
router.post("/raise-auth-weigh/:orderId", authorize(), raiseAuthToWeight);
router.post("/send-ticket/:Id", sendTicketToAdmin);
router.post("/send-lpo/:Id", sendLPOToAdmin);
router.post("/send-store-auth/:Id", sendStoreCollectionAdmin);
router.post("/send-weigh-auth/:Id", sendAuthtoweigh);
router.patch("/approve-cash-ticket/:Id", authorize(), approveCashTicket);
router.patch("/reject-cashticket/:ticketId", authorize(), rejectCashTicket);
router.get("/view-cash-ticket", getCashTicket);
router.get("/view-lpo", getLPO);
router.get("/view-store-auth", getStoreAuth);
router.get("/view-all-auth-weigh", getAuthToWeigh);

//weighinsss
router.get("/view-auth-weigh/:ticketId", getAuthToWeighDetails);

//notification
router.get("/get-notifications", authorize(),getNotifications);




export default router;
