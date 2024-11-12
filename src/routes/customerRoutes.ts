import express from 'express';
import { createCustomer, deleteCustomer, getAllCustomers, getCustomer, orderCustomersFirstname, searchCustomer, updateCustomer } from '../controller/customerController';
import { authorize } from '../middleware/staffPermissions';
import { createSupplier, deleteSupplier, getAllSuppliers, getSupplier, orderSupplierFirstname, searchSupplier, updateSupplier } from '../controller/supplierController';
import { createAccountAndLedger, getAccountBook, getCustomerLedger, getCustomerLedgerByProduct, getProductLedger, getSupplierAccountBook } from '../controller/ledgerController';
import { getAllOrders, getOrdersByCustomer, getOrdersByProduct, raiseCustomerOrder, searchCustomersFromOrders } from '../controller/orders';
import { getAllSupplierOrders, raiseSupplierOrder } from '../controller/supplierOrder';
const router = express.Router();

router.post('/reg-customer',authorize() ,createCustomer);
router.get('/get-customers',authorize(), getAllCustomers);
router.get('/get-customer/:id',authorize(), getCustomer);
router.patch('/edit-customer/:id',authorize(), updateCustomer);
router.delete('/delete-customer/:id',authorize(), deleteCustomer);
router.get('/search-customer',authorize(), searchCustomer);

//suppliers
router.post('/reg-supplier',authorize() ,createSupplier);
router.get('/get-suppliers',authorize(), getAllSuppliers);
router.get('/get-supplier/:id',authorize(), getSupplier);
router.patch('/edit-supplier/:id',authorize(), updateSupplier);
router.delete('/delete-supplier/:id',authorize(), deleteSupplier);
router.get('/search-supplier',authorize(), searchSupplier);
router.get('/order-suppliers',authorize(), orderSupplierFirstname);
router.get('/order-customers',authorize(), orderCustomersFirstname);


//ledger, accountbook, placeorder
router.post('/create-account', authorize(), createAccountAndLedger);
router.get('/get-accountbook', authorize(), getAccountBook);
router.get('/get-supplier-accountbook', authorize(), getSupplierAccountBook);
router.get('/search-customer-for-ledger', authorize(), searchCustomersFromOrders);
router.get("/get-customer-ledger/:customerId",authorize(), getCustomerLedger)
router.get("/get-ledger/:productId/:customerId", authorize(), getCustomerLedgerByProduct);
router.get("/get-product-ledger/:productId", authorize(), getProductLedger)
router.post('/raise-customer-order',authorize(),raiseCustomerOrder);
router.get('/get-product-order/:productId', authorize(), getOrdersByProduct);
router.get('/get-customer-order/:customerId', authorize(), getOrdersByCustomer);
router.get('/get-all-orders', authorize(), getAllOrders);
//supplier order
router.post('/raise-supplier-order',authorize(),raiseSupplierOrder);
router.get('/get-all-supplier-orders', authorize(), getAllSupplierOrders);


export default router;