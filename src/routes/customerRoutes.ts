import express from 'express';
import { createCustomer, getAllCustomers, getCustomer, updateCustomer } from '../controller/customerController';
const router = express.Router();

router.post('/register', createCustomer);
router.get('/get-customers', getAllCustomers);
router.get('/get-customer/:id', getCustomer);
router.patch('/update-customer', updateCustomer);


export default router;