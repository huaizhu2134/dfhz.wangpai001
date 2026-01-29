import express from "express";
import { authMiddleware } from "../auth.js";
import { loadConfig } from "../config.js";
import * as UserController from "../controllers/UserController.js";

const config = loadConfig(process.env);
const router = express.Router();
const auth = authMiddleware({ jwtSecret: config.jwtSecret });

router.get("/me", auth, UserController.getMe);
router.put("/me", auth, UserController.updateMe);

export default router;
