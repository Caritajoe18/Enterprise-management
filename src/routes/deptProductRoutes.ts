import express from "express";
import { createDepartment, deleteDept, editDepartment, getAllDepartments, getDepartmentLedgerByDepartmentId, getDepartments, getDepartmentsLikePharm } from "../controller/departmentController";
import { authorize } from "../middleware/staffPermissions";
import { getDepartmentForPurchase, getDepartmentForSale, getDepartmentProducts } from "../controller/productController";
import upload from "../utilities/multer";
import { addQuantityToPharmacyStore, createOrder, createStore, deletePharmStore, editStore, getPharmStores, getStoreForPurchase, getStoreForSale, removeQuantityFromPharmacyStore, uploadImage, viewOrder } from "../controller/pharmacyStore";
import { addQuantityToGeneralStore, createGenOrder, createGenStore, deleteGenStore, editGenStore, getGenStores, removeQuantityFromGeneralStore, searchGenStore, viewGenOrder } from "../controller/generalStore";
import { addQuantityToDepartmentStore, createDeptOrder, createDeptStore, deleteDeptStore, editDeptStore, getDeptStoreForPurchase, getDeptStoreForSale, removeQuantityFromDepartmentStore, viewDeptOrder } from "../controller/departmentStoreController";
import { checkDepartmentAccess } from "../middleware/deptLedgerAuth";

const router = express.Router();

router.post("/create-department", authorize(), createDepartment);
router.patch("/edit-department/:id", authorize(), editDepartment);
router.get("/view-department", getAllDepartments);
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
router.get("/view-pharmstore-raw", getStoreForPurchase);
router.patch("/edit-pharmstore/:id",authorize(), editStore);
router.post("/raise-pharm-order",authorize(), createOrder);
router.get("/view-pharm-order",authorize(), viewOrder);
router.delete("/delete-pharmstore/:id",authorize(), deletePharmStore);
router.patch("/remove-quantity-pharm/:Id", removeQuantityFromPharmacyStore);
router.patch("/add-quantity-pharm/:Id", addQuantityToPharmacyStore);


//general Store
router.post("/create-gen-store", createGenStore);
router.get("/view-gen-store",authorize(), getGenStores);
router.patch("/edit-genstore/:id",authorize(), editGenStore);
router.delete("/delete-genstore/:id",authorize(), deleteGenStore);
router.get("/view-gen-order",authorize(), viewGenOrder);
router.post("/create-genstore-order",authorize(), createGenOrder);
router.patch("/remove-quantity-gen/:Id", removeQuantityFromGeneralStore);
router.patch("/add-quantity-gen/:Id", addQuantityToGeneralStore);
router.get("/search-genstore", searchGenStore);

//dept store
router.post('/create-dept-store',authorize(), createDeptStore);
router.get('/view-deptstore-prod', authorize(), getDeptStoreForSale);
router.get('/view-deptstore-raw',authorize(), getDeptStoreForPurchase);
router.patch('/edit-deptstore/:id',authorize(), editDeptStore);
router.delete("/delete-deptstore/:id",authorize(), deleteDeptStore);
router.post("/create-deptstore-order",authorize(), createDeptOrder);
router.get("/view-deptstore-order",authorize(), viewDeptOrder);
router.patch("/remove-quantity-dept/:Id", removeQuantityFromDepartmentStore);
router.patch("/add-quantity-dept/:Id", addQuantityToDepartmentStore);

//department ledger
router.get("/department-ledger/:departmentId", checkDepartmentAccess, getDepartmentLedgerByDepartmentId);


export default router;