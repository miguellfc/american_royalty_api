import express from "express";
import RoleController from "../controllers/role-controller.js";

const router = express.Router();

router.get('/', RoleController.getAll);

export default router;