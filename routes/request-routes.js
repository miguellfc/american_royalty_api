import express from "express";
import RequestController from "../controllers/request-controller.js";

const router = express.Router();

router.post('/', RequestController.getAll);
router.post('/create', RequestController.create);
router.patch('/update/:id', RequestController.update);
router.delete('/delete/:ids',RequestController.delete);
router.get('/resume', RequestController.resumeMonth);
router.get('/budget', RequestController.budgetCollect);

export default router;