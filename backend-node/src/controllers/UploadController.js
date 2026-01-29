import { UploadService } from "../services/UploadService.js";
import { success } from "../utils/response.js";
import asyncHandler from "express-async-handler";
import { createCosClient } from "../cos.js";
import { loadConfig } from "../config.js";

// Init COS client once (or per request if dynamic, but usually static)
const config = loadConfig(process.env);
const cosClient = createCosClient(config.cos);

export const uploadAvatar = asyncHandler(async (req, res) => {
  const uid = String(req.user?.uid || "");
  const file = req.file;
  
  const user = await UploadService.uploadAvatar(uid, file, cosClient);
  success(res, { user });
});
