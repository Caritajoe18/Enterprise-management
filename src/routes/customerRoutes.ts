import express from 'express';
import { createCustomer, deleteCustomer, getAllCustomers, getCustomer, updateCustomer } from '../controller/customerController';
import { authorize } from '../middleware/staffPermissions';
const router = express.Router();

router.post('/reg-customer',authorize() ,createCustomer);
router.get('/get-customers',authorize(), getAllCustomers);
router.get('/get-customer/:id',authorize(), getCustomer);
router.patch('/edit-customer/:id',authorize(), updateCustomer);
router.delete('/delete-customer/:id',authorize(), deleteCustomer);


export default router;