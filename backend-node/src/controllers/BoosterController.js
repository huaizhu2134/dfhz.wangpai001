import { BoosterService } from "../services/BoosterService.js";
import { success } from "../utils/response.js";
import asyncHandler from "express-async-handler";

export const listOrders = asyncHandler(async (req, res) => {
  const { tab } = req.body;
  const result = await BoosterService.listOrders(tab);
  success(res, result);
});

export const takeOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.body;
  const uid = String(req.user.uid);
  
  await BoosterService.takeOrder(orderId, uid);
  success(res, true);
});

export const increaseManpower = asyncHandler(async (req, res) => {
  const { orderId } = req.body;
  const uid = String(req.user.uid);
  
  await BoosterService.increaseManpower(orderId, uid);
  success(res, true);
});
