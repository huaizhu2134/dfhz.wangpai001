import { UserService } from "../services/UserService.js";
import { success } from "../utils/response.js";
import asyncHandler from "express-async-handler";

export const getMe = asyncHandler(async (req, res) => {
  const uid = String(req.user?.uid || "");
  const user = await UserService.getUserById(uid);
  if (!user) {
    res.status(404);
    throw new Error("USER_NOT_FOUND");
  }
  success(res, { user });
});

export const updateMe = asyncHandler(async (req, res) => {
  const uid = String(req.user?.uid || "");
  const data = req.body?.data && typeof req.body.data === "object" ? req.body.data : req.body;
  
  const user = await UserService.updateUser(uid, data);
  success(res, { user });
});
