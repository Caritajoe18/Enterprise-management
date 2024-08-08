import { Router, Request, Response } from "express";

const router = Router();
router.get("/", (_: Request, res: Response) =>
  res.status(200).json({ message: "success" })
);

export default router;
