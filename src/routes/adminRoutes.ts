import express from 'express';
import { createRawMaterial, loginAdmin, signupAdmin, updateRawMaterial } from '../controller/adminController';
import { authenticateAdmin } from '../middleware/adminAuth';

const router = express.Router();
router.post('/sign-up', signupAdmin);
router.post('/login', loginAdmin );
router.post('/add-rawMaterial', createRawMaterial );
router.post('/edit-rawMaterial/:id', updateRawMaterial );
//router.post('/add-rawMaterial', createRawMaterial );

export default router;