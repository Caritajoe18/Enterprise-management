import express from 'express';
import { forgotPassword, loginAdmin, resendOTP, resetPassword, signupAdmin, verifyEmail } from '../controller/adminController';
//import { authenticateAdmin } from '../middleware/adminAuth';
import { createRawMaterial, getAllProducts, updateRawMaterial } from '../controller/productController';
import { deleteStaff, getAllStaff, getStaff, getSuspendedStaff, restoreStaff, signupStaff, suspendStaff, updateStaff } from '../controller/staffController';

const router = express.Router();
router.post('/sign-up', signupAdmin);
router.post('/login', loginAdmin );

//products
router.post('/add-rawMaterial', createRawMaterial );
router.patch('/edit-rawMaterial/:id', updateRawMaterial );
router.get('/get-products', getAllProducts );

//staff
router.post('/reg-staff', signupStaff );
router.post('/resendOTP', resendOTP  );
router.post('/verify/:id', verifyEmail);
router.post('/forgot', forgotPassword);
//router.get('/reset-password/:token');
router.patch('/reset-password/:token', resetPassword);
router.patch('/update-staff/:id', updateStaff);
router.patch('/suspend-staff/:id', suspendStaff);
router.patch('/restore-staff/:id', restoreStaff);
router.delete('/delete-staff/:id',deleteStaff);
router.get('/all-staff', getAllStaff);
router.get('/staff', getStaff);
router.get('/suspended-staff', getSuspendedStaff);




export default router;