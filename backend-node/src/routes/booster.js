import express from "express";
import { authMiddleware } from "../auth.js";
import { loadConfig } from "../config.js";
import * as BoosterController from "../controllers/BoosterController.js";

const config = loadConfig(process.env);
const router = express.Router();
const auth = authMiddleware({ jwtSecret: config.jwtSecret });

router.post("/squareOrders", auth, BoosterController.listOrders);
router.post("/takeOrder", auth, BoosterController.takeOrder);
router.post("/increaseManpower", auth, BoosterController.increaseManpower);

export default router;
