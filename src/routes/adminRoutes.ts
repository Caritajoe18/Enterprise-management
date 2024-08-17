import express from 'express';
import { forgotPassword, loginAdmin, resendOTP, resetPassword, signupAdmin, signupStaff, verifyEmail } from '../controller/adminController';
import { authenticateAdmin } from '../middleware/adminAuth';
import { createRawMaterial, updateRawMaterial } from '../controller/productController';

const router = express.Router();
router.post('/sign-up', signupAdmin);
router.post('/login', loginAdmin );
router.post('/add-rawMaterial', createRawMaterial );
router.post('/edit-rawMaterial/:id', updateRawMaterial );
router.post('/reg-staff', signupStaff );
router.post('/resendOTP', resendOTP  );
router.post('/verify/:id', verifyEmail);
router.post('/forgot', forgotPassword);
//router.get('/reset-password/:token');
router.patch('/reset-password/:token', resetPassword);


export default router;