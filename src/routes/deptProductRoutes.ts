import express from "express";
import { createDepartment, deleteDept, editDepartment, getAllDepartments, getDepartments } from "../controller/departmentController";
import { authorize } from "../middleware/staffPermissions";

const router = express.Router();

router.post("/create-department", authorize(), createDepartment);
router.patch("/edit-department/:id", authorize(), editDepartment);
router.get("/view-department", authorize(), getAllDepartments);
router.get("/get-department", getDepartments);
router.delete("/delete-department/:id", authorize(), deleteDept);

export default router;