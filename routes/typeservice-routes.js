import express from "express";
import TypeServiceController from "../controllers/typeservice-controller.js";

const router = express.Router()

router.get('/', TypeServiceController.getAll)

export default router