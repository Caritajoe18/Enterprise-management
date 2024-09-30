import express from 'express';
import { createCustomer, deleteCustomer, getAllCustomers, getCustomer, orderCustomersFirstname, searchCustomer, updateCustomer } from '../controller/customerController';
import { authorize } from '../middleware/staffPermissions';
import { createSupplier, deleteSupplier, getAllSuppliers, getSupplier, orderSupplierFirstname, searchSupplier, updateSupplier } from '../controller/supplierController';
const router = express.Router();

router.post('/reg-customer',authorize() ,createCustomer);
router.get('/get-customers',authorize(), getAllCustomers);
router.get('/get-customer/:id',authorize(), getCustomer);
router.patch('/edit-customer/:id',authorize(), updateCustomer);
router.delete('/delete-customer/:id',authorize(), deleteCustomer);
router.get('/search-customer',authorize(), searchCustomer);
router.post('/reg-supplier',authorize() ,createSupplier);
router.get('/get-suppliers',authorize(), getAllSuppliers);
router.get('/get-supplier/:id',authorize(), getSupplier);
router.patch('/edit-supplier/:id',authorize(), updateSupplier);
router.delete('/delete-supplier/:id',authorize(), deleteSupplier);
router.get('/search-supplier',authorize(), searchSupplier);
router.get('/order-suppliers',authorize(), orderSupplierFirstname);
router.get('/order-customers',authorize(), orderCustomersFirstname);


export default router;