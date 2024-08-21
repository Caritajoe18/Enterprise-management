import express from 'express';
import { forgotPassword, loginAdmin, resendOTP, resetPassword, signupAdmin, verifyEmail } from '../controller/adminController';
//import { authenticateAdmin } from '../middleware/adminAuth';
import { createProducts, deleteProduct, getProducts, searchProducts, updateProducts } from '../controller/productController';
import { deleteStaff, getAllStaff, searchStaff, getSuspendedStaff, restoreStaff, signupStaff, suspendStaff, updateStaff } from '../controller/staffController';

const router = express.Router();
router.post('/sign-up', signupAdmin);
router.post('/login', loginAdmin );

//products
router.post('/add-product', createProducts );
router.patch('/edit-product/:id', updateProducts);
router.get('/get-products', getProducts );
router.get('/search-products', searchProducts );
router.delete('/delete-product/:id', deleteProduct);



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
router.get('/search-staff', searchStaff);
router.get('/suspended-staff', getSuspendedStaff);




export default router;