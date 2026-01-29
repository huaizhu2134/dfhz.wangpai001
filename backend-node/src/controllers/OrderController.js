import { OrderService } from "../services/OrderService.js";
import { success } from "../utils/response.js";
import asyncHandler from "express-async-handler";

export const listOrders = asyncHandler(async (req, res) => {
  const uid = req.user.uid;
  const status = req.query.status;
  
  const result = await OrderService.listOrders(uid, status);
  success(res, { records: result });
});

export const createOrder = asyncHandler(async (req, res) => {
  await OrderService.createOrder();
});
