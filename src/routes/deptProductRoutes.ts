import express from "express";
import { createDepartment, deleteDept, editDepartment, getAllDepartments, getDepartments } from "../controller/departmentController";
import { authorize } from "../middleware/staffPermissions";
import { getDepartmentProducts } from "../controller/productController";
import upload from "../utilities/multer";
import { uploadImage } from "../controller/pharmacyStore";

const router = express.Router();

router.post("/create-department", authorize(), createDepartment);
router.patch("/edit-department/:id", authorize(), editDepartment);
router.get("/view-department", authorize(), getAllDepartments);
router.get("/get-department", getDepartments);
router.delete("/delete-department/:id", authorize(), deleteDept);

//pharmacy store
router.get('/get-dept-product/:departmentId', getDepartmentProducts);
router.post("/upload", upload.single("file"), uploadImage);


export default router;