import express from 'express';
import { createCustomer, getAllCustomers, getCustomer, updateCustomer } from '../controller/customerController';
import { authorize } from '../middleware/staffPermissions';
const router = express.Router();

router.post('/register',authorize('register-customer') ,createCustomer);
router.get('/get-customers',authorize('get-customers'), getAllCustomers);
router.get('/get-customer/:id', getCustomer);
router.patch('/update-customer', updateCustomer);


export default router;