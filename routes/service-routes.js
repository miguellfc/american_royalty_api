import express from "express";
import ServiceController from "../controllers/service-controller.js";

const router = express.Router()

router.post('/', ServiceController.getAll);
router.post('/create', ServiceController.create);
router.patch('/update/:id', ServiceController.update);
router.delete('/delete/:ids', ServiceController.delete);
router.get('/bests', ServiceController.bests);

export default router;