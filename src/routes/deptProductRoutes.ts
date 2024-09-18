import express from "express";
import { creaetDepartment, deleteDept, editDepartment, getAllDepartments } from "../controller/departmentController";
import { authorize } from "../middleware/staffPermissions";

const router = express.Router();

router.post("/create-department", authorize(), creaetDepartment);
router.patch("/edit-department/:id", authorize(), editDepartment);
router.get("/view-department", authorize(), getAllDepartments);
router.delete("/Delete-department/:id", authorize(), deleteDept);

export default router;
