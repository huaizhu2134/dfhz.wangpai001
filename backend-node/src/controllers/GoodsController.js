import { GoodsService } from "../services/GoodsService.js";
import { success, fail } from "../utils/response.js";
import asyncHandler from "express-async-handler";

export const listSpu = asyncHandler(async (req, res) => {
  const page = Number(req.query.pageNumber || 1);
  const size = Number(req.query.pageSize || 20);
  const keyword = String(req.query.keyword || "");
  
  const result = await GoodsService.listSpu({ page, size, keyword });
  success(res, result);
});

export const getSpuDetail = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const result = await GoodsService.getSpuDetail(id);
  if (!result) {
    res.status(404);
    throw new Error("NOT_FOUND");
  }
  success(res, result);
});

export const listSku = asyncHandler(async (req, res) => {
  const spuId = req.query.spuId;
  const result = await GoodsService.listSku(spuId);
  success(res, { records: result });
});
