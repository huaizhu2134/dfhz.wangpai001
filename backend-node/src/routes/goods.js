import express from "express";
import * as GoodsController from "../controllers/GoodsController.js";

const router = express.Router();

router.get("/spu/list", GoodsController.listSpu);
router.get("/spu/:id", GoodsController.getSpuDetail);
router.get("/sku/list", GoodsController.listSku);

export default router;
