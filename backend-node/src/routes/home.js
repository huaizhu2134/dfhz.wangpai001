import express from "express";
import * as HomeController from "../controllers/HomeController.js";

const router = express.Router();

router.get("/swiper", HomeController.getSwiper);

export default router;
