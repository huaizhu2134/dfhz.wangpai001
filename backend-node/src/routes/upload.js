import express from "express";
import multer from "multer";
import { authMiddleware } from "../auth.js";
import { loadConfig } from "../config.js";
import * as UploadController from "../controllers/UploadController.js";

const config = loadConfig(process.env);
const router = express.Router();
const auth = authMiddleware({ jwtSecret: config.jwtSecret });
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.post("/avatar", auth, upload.single("file"), UploadController.uploadAvatar);

export default router;
