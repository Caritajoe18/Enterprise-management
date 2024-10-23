import express from "express";
import { createDepartment, deleteDept, editDepartment, getAllDepartments, getDepartments } from "../controller/departmentController";
import { authorize } from "../middleware/staffPermissions";
import { getDepartmentForPurchase, getDepartmentForSale, getDepartmentProducts } from "../controller/productController";
import upload from "../utilities/multer";
import { createOrder, createStore, editStore, getPharmStores, getStoreForPurchase, getStoreForSale, uploadImage } from "../controller/pharmacyStore";

const router = express.Router();

router.post("/create-department", authorize(), createDepartment);
router.patch("/edit-department/:id", authorize(), editDepartment);
router.get("/view-department", authorize(), getAllDepartments);
router.get("/get-department", getDepartments);
router.delete("/delete-department/:id", authorize(), deleteDept);

//pharmacy store
router.get('/get-all-dept-product/:departmentId', getDepartmentProducts);
router.get('/get-dept-product/:departmentId', getDepartmentForSale);
router.get('/get-dept-raw/:departmentId', getDepartmentForPurchase);
router.post("/upload", upload.single("file"), uploadImage);
router.post("/create-pharmstore", createStore);
router.get("/view-pharmstore", getPharmStores);
router.get("/view-pharmstore-prod", getStoreForSale);
router.get("/view-pharmstore-raw", getStoreForPurchase);
router.patch("/edit-pharmstore/:id", editStore);
router.post("/raise-pharm-order", createOrder);


export default router;