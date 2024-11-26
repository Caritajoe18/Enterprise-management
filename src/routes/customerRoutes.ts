import express from "express";
import {
  createCustomer,
  deleteCustomer,
  getAllCustomers,
  getCustomer,
  orderCustomersFirstname,
  searchCustomer,
  updateCustomer,
} from "../controller/customerController";
import { authorize } from "../middleware/staffPermissions";
import {
  createSupplier,
  deleteSupplier,
  getAllSuppliers,
  getSupplier,
  orderSupplierFirstname,
  searchSupplier,
  updateSupplier,
} from "../controller/supplierController";
import {
  createAccountAndLedger,
  generateLedgerSummary,
  getAccountBook,
  getCustomerLedger,
  getCustomerLedgerByProduct,
  getOtherAccountBook,
  getProductLedger,
  getSupplierAccountBook,
  getSupplierLedger,
} from "../controller/ledgerController";
import {
  getAllOrders,
  getOrdersByCustomer,
  getOrdersByProduct,
  raiseCustomerOrder,
  searchCustomersFromOrders,
} from "../controller/orders";
import {
  getAllSupplierOrders,
  raiseSupplierOrder,
} from "../controller/supplierOrder";
import {
  createWeigh,
  viewAllWeigh,
  viewWeigh,
} from "../controller/weighBridge";
import {
  approveInvoice,
  approveVehicle,
  generateInvoice,
  generateInvoicePdf,
  generateVehicle,
  getAVehicle,
  getAllInvoices,
  getAllVehicle,
  getApprovedInvoice,
  rejectInvoice,
  rejectVehicle,
  sendInvoice,
  sendVehicle,
} from "../controller/receipts";
import {
  approveGatepass,
  approveWaybill,
  generateGatePass,
  generateWaybill,
  getAGatePass,
  getAWaybill,
  getAllGatepass,
  getAllWaybill,
  rejectGatepass,
  rejectWaybill,
  sendGatePass,
  sendWaybill,
} from "../controller/waybill";
import { createOfficialReceipt, getEntryforReceipt, getReceipt } from "../controller/cashier";
const router = express.Router();

router.post("/reg-customer", authorize(), createCustomer);
router.get("/get-customers", authorize(), getAllCustomers);
router.get("/get-customer/:id", authorize(), getCustomer);
router.patch("/edit-customer/:id", authorize(), updateCustomer);
router.delete("/delete-customer/:id", authorize(), deleteCustomer);
router.get("/search-customer", authorize(), searchCustomer);

//suppliers
router.post("/reg-supplier", authorize(), createSupplier);
router.get("/get-suppliers", authorize(), getAllSuppliers);
router.get("/get-supplier/:id", authorize(), getSupplier);
router.patch("/edit-supplier/:id", authorize(), updateSupplier);
router.delete("/delete-supplier/:id", authorize(), deleteSupplier);
router.get("/search-supplier", authorize(), searchSupplier);
router.get("/order-suppliers", authorize(), orderSupplierFirstname);
router.get("/order-customers", authorize(), orderCustomersFirstname);

//ledger, accountbook, placeorder
router.post("/create-account", authorize(), createAccountAndLedger);
router.get("/get-accountbook", authorize(), getAccountBook);
router.get("/get-supplier-accountbook", authorize(), getSupplierAccountBook);
router.get("/get-other-accountbook", authorize(), getOtherAccountBook);
router.get(
  "/search-customer-for-ledger",
  authorize(),
  searchCustomersFromOrders
);
router.get("/get-customer-ledger/:customerId", authorize(), getCustomerLedger);
router.get("/get-supplier-ledger/:supplierId", authorize(), getSupplierLedger);
router.get(
  "/get-ledger/:productId/:customerId",
  authorize(),
  getCustomerLedgerByProduct
);
router.get("/get-product-ledger/:productId", authorize(), getProductLedger);
router.post("/raise-customer-order", authorize(), raiseCustomerOrder);
router.get("/get-product-order/:productId", authorize(), getOrdersByProduct);
router.get("/get-customer-order/:customerId", authorize(), getOrdersByCustomer);
router.get("/get-all-orders", authorize(), getAllOrders);
router.get("/get-summary/:tranxId", generateLedgerSummary);

//supplier order
router.post("/raise-supplier-order", authorize(), raiseSupplierOrder);
router.get("/get-all-supplier-orders", authorize(), getAllSupplierOrders);

//weigh operations
router.post("/create-weigh/:authToWeighId", authorize(), createWeigh);
router.get("/view-weigh/:weighId", viewWeigh);
router.get("/view-weighs", authorize(), viewAllWeigh);

//receipts
router.post("/create-invoice/:tranxId", authorize(), generateInvoice);
router.get("/get-invoice/:invoiceId", getApprovedInvoice);
router.get("/get-all-invoice", authorize(), getAllInvoices);
router.get("/invoice-pdf/:invoiceId", generateInvoicePdf);
router.post("/sendInvoice/:Id", sendInvoice);
router.patch("/approveInvoice/:recieptId", authorize(), approveInvoice);
router.patch("/rejectInvoice/:invoiceId", authorize(), rejectInvoice);
//waybill
router.post("/create-waybill/:tranxId", authorize(), generateWaybill);
router.get("/get-all-waybill", authorize(), getAllWaybill);
router.post("/send-Waybill/:Id", sendWaybill);
router.patch("/approve-waybill/:recieptId", authorize(), approveWaybill);
router.patch("/reject-waybill/:waybillId", authorize(), rejectWaybill);
router.get("/waybill-pdf/:waybillId", getAWaybill);
//official receipt
router.get("/create-official", getEntryforReceipt );
router.post("/create-official-receipt/:cashierId", createOfficialReceipt);
router.get("/get-official/:receiptId", getReceipt);
//gatepass
router.post("/create-gatepass/:tranxId", authorize(), generateGatePass);
router.get("/get-all-gatepass", authorize(), getAllGatepass);
router.post("/send-gate-pass/:Id", sendGatePass);
router.patch("/approve-gatepass/:recieptId", authorize(), approveGatepass);
router.patch("/reject-gatepass/:gatepassId", authorize(), rejectGatepass);
router.get("/view-gatepass/:id", getAGatePass);
//vehicle dispatch
router.post("/create-vehicle-dispatch", authorize(), generateVehicle);
router.get("/get-all-vehicle-dispatch", authorize(), getAllVehicle);
router.post("/send-vehicle/:Id", sendVehicle);
router.patch("/approve-vehicle/:recieptId", authorize(), approveVehicle);
router.patch("/reject-vehicle/:vehicleId", authorize(), rejectVehicle);
router.get("/view-vehicle/:vehicleId", getAVehicle);

export default router;
