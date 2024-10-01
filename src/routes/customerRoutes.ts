import express from 'express';
import { createCustomer, deleteCustomer, getAllCustomers, getCustomer, orderCustomersFirstname, searchCustomer, updateCustomer } from '../controller/customerController';
import { authorize } from '../middleware/staffPermissions';
import { createSupplier, deleteSupplier, getAllSuppliers, getSupplier, orderSupplierFirstname, searchSupplier, updateSupplier } from '../controller/supplierController';
import { createAccountandLedger } from '../controller/ledgerController';
import { approveCashTicket, raiseCashTicket, rejectCashTicket } from '../controller/ticketController';
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
router.post('/create-account', authorize(), createAccountandLedger);
router.get('/get-customerledger', authorize(), )
router.post('/raise-cashticket', authorize(), raiseCashTicket)
router.patch('/approve-cashticket/:ticketId', authorize(), approveCashTicket)
router.patch('/reject-cashticket/:ticketId', authorize(), rejectCashTicket)



export default router;