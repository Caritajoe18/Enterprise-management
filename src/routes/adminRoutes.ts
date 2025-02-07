import express from "express";
import {
  forgotPassword,
  loginAdmin,
  resetPassword,
  signupAdmin,
} from "../controller/adminController";
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
  approveAuthToWeigh,
  approveCashTicket,
  approveLPO,
  approveStoreAuth,
  getACashTicket,
  getAStoreAuth,
  getAnAuthToWeigh,
  getAnLPO,
  getAuthToWeigh,
  getCashTicket,
  getLPO,
  getStoreAuth,
  raiseAuthToCollectFromStore,
  raiseAuthToWeight,
  raiseCashTicket,
  raiseLPO,
  recieveCashTicket,
  rejectAuthToWeigh,
  rejectCashTicket,
  rejectLPO,
  rejectStoreAuth,
  sendAuthtoweigh,
  sendLPOToAdmin,
  sendStoreCollectionAdmin,
  sendTicketToAdmin,
} from "../controller/ticketController";
import { createCashierEntry, getCashierEntry } from "../controller/cashier";
import { getAuthToWeighDetails } from "../controller/weighBridge";
import {
  bulkDeleteNotifications,
  getNotification,
  getNotifications,
} from "../controller/notification";

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
router.patch("/edit-product/:id", updateProducts);
router.get("/get-products", getProducts);
router.get("/get-raw-materials", getRawMaterials);
router.get("/search-products", searchProducts);
router.delete("/delete-product/:id", authorize(), deleteProduct);

//staff
router.post("/create-role", authorize(), addRole);
router.get("/get-roles", authorize(), getAllRoles); //with nav parents without permissins
router.get("/get-rolePerm", getRoles); //roles with their Ids only, no prmissions no nav
router.get("/get-a-role/:roleId", getARoleWithPermission);
router.put("/edit-role/:roleId", authorize(), editRolePermissions);
router.put("/editing-role/:roleId", authorize(), editRole); // reviewed
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
router.post("/forgot", limiter, forgotPassword);

router.patch("/reset-password", limiter, resetPassword);
router.patch("/update-staff/:id", authorize(), updateStaff);
router.patch("/suspend-staff/:id", suspendStaff);
router.patch("/restore-staff/:id", restoreStaff);
router.delete("/delete-staff/:id", deleteStaff);
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
router.post("/recieve-cash-ticket/:ticketId", authorize(), recieveCashTicket);
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
router.patch("/approve-cash-ticket/:ticketId", authorize(), approveCashTicket);
router.patch("/approve-lpo/:ticketId", authorize(), approveLPO);
router.patch("/approve-store-auth/:ticketId", authorize(), approveStoreAuth);
router.patch("/approve-weigh-auth/:ticketId", authorize(), approveAuthToWeigh);
router.patch("/reject-cashticket/:ticketId", authorize(), rejectCashTicket);
router.patch("/reject-lpo/:ticketId", authorize(), rejectLPO);
router.patch("/reject-store-auth/:ticketId", authorize(), rejectStoreAuth);
router.patch("/reject-weigh-auth/:ticketId", authorize(), rejectAuthToWeigh);
router.get("/view-cash-ticket", getCashTicket);
router.get("/view-lpo", getLPO);
router.get("/view-store-auth", getStoreAuth);
router.get("/view-all-auth-weigh", getAuthToWeigh);
router.get("/view-aproved-cash-ticket/:id", getACashTicket);
router.get("/view-approved-lpo/:id", getAnLPO);
router.get("/view-approved-store-auth/:id", getAStoreAuth);
router.get("/view-approved-auth-weigh/:id", getAnAuthToWeigh);

//weighinsss
router.get("/view-auth-weigh/:ticketId", getAuthToWeighDetails);

//notification
router.get("/get-notifications", authorize(), getNotifications);
router.get("/get-notification/:id", getNotification);
router.delete("/delete-notifications", bulkDeleteNotifications);

export default router;
