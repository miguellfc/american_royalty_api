import express from "express";
import UserController from "../controllers/user-controller.js";

const router = express.Router();

router.post('/', UserController.getAll);
router.delete('/delete/:ids', UserController.delete);
router.get('/totals', UserController.totals);
router.get('/waiter', UserController.waiter);
router.get('/finisher', UserController.finisher);
router.get('/sellers', UserController.sellers);

export default router;