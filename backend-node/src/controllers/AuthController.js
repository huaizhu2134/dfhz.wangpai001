import { AuthService } from "../services/AuthService.js";
import { success, fail } from "../utils/response.js";
import asyncHandler from "express-async-handler";

export const login = asyncHandler(async (req, res) => {
  const code = String(req.body?.code || "");
  if (!code && code !== "mock") {
    throw new Error("CODE_REQUIRED");
  }
  
  const result = await AuthService.login(code);
  success(res, result);
});
