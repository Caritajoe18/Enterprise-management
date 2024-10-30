import express from "express";
import { createDepartment, deleteDept, editDepartment, getAllDepartments, getDepartments, getDepartmentsLikePharm } from "../controller/departmentController";
import { authorize } from "../middleware/staffPermissions";
import { getDepartmentForPurchase, getDepartmentForSale, getDepartmentProducts } from "../controller/productController";
import upload from "../utilities/multer";
import { createOrder, createStore, deletePharmStore, editStore, getPharmStores, getStoreForPurchase, getStoreForSale, uploadImage, viewOrder } from "../controller/pharmacyStore";
import { createGenOrder, createGenStore, deleteGenStore, editGenStore, getGenStores, viewGenOrder } from "../controller/generalStore";
import { createDeptOrder, createDeptStore, deleteDeptStore, editDeptStore, getDeptStoreForPurchase, getDeptStoreForSale, viewDeptOrder } from "../controller/departmentStoreController";

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
router.get('/get-pharm-dept', getDepartmentsLikePharm);
router.post("/upload", upload.single("file"), uploadImage);
router.post("/create-pharmstore", createStore);
router.get("/view-pharmstore", authorize(), getPharmStores);
router.get("/view-pharmstore-prod", authorize(), getStoreForSale);
router.get("/view-pharmstore-raw", authorize(), getStoreForPurchase);
router.patch("/edit-pharmstore/:id",authorize(), editStore);
router.post("/raise-pharm-order",authorize(), createOrder);
router.get("/view-pharm-order",authorize(), viewOrder);
router.delete("/delete-pharmstore/:id",authorize(), deletePharmStore);


//general Store
router.post("/create-gen-store", createGenStore);
router.get("/view-gen-store",authorize(), getGenStores);
router.patch("/edit-genstore/:id",authorize(), editGenStore);
router.delete("/delete-genstore/:id",authorize(), deleteGenStore);
router.get("/view-gen-order",authorize(), viewGenOrder);
router.post("/create-genstore-order", createGenOrder);

//dept store
router.post('/create-dept-store',authorize(), createDeptStore);
router.get('/view-deptstore-prod', authorize(), getDeptStoreForSale);
router.get('/view-deptstore-raw',authorize(), getDeptStoreForPurchase);
router.patch('/edit-deptstore/:id',authorize(), editDeptStore);
router.delete("/delete-deptstore/:id",authorize(), deleteDeptStore);
router.post("/create-deptstore-order",authorize(), createDeptOrder);
router.get("/view-deptstore-order",authorize(), viewDeptOrder);


export default router;