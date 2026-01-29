import express from "express";
import * as AuthController from "../controllers/AuthController.js";

const router = express.Router();

router.post("/wxlogin", AuthController.login);

export default router;
