import { HomeService } from "../services/HomeService.js";
import { success } from "../utils/response.js";
import asyncHandler from "express-async-handler";

export const getSwiper = asyncHandler(async (req, res) => {
  const images = await HomeService.getSwiper();
  success(res, { images });
});
