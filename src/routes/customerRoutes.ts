import express from 'express';
import { createCustomer, getAllCustomers, getCustomer, updateCustomer } from '../controller/customerController';
import { authorize } from '../middleware/staffPermissions';
const router = express.Router();

router.post('/reg-customer',authorize() ,createCustomer);
router.get('/get-customers',authorize(), getAllCustomers);
router.get('/get-customer/:id', getCustomer);
router.patch('/update-customer', updateCustomer);


export default router;