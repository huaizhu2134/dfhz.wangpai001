import express from "express";
import { authMiddleware } from "../auth.js";
import { loadConfig } from "../config.js";
import * as OrderController from "../controllers/OrderController.js";

const config = loadConfig(process.env);
const router = express.Router();
const auth = authMiddleware({ jwtSecret: config.jwtSecret });

router.post("/create", auth, OrderController.createOrder);
router.get("/list", auth, OrderController.listOrders);

export default router;
