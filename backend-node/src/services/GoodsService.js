import { GoodsModel } from "../models/Goods.js";

export class GoodsService {
  static async listSpu(params) {
    const { records, total } = await GoodsModel.listSpu(params);
    
    // Transform data
    const list = records.map(r => ({
      ...r,
      _id: String(r.id),
      swiper_images: typeof r.swiper_images === 'string' ? JSON.parse(r.swiper_images) : r.swiper_images
    }));

    return {
      records: list,
      total,
      pageNumber: params.page,
      pageSize: params.size
    };
  }

  static async getSpuDetail(id) {
    const spu = await GoodsModel.getSpuById(id);
    if (!spu) return null;

    return {
      ...spu,
      _id: String(spu.id),
      swiper_images: typeof spu.swiper_images === 'string' ? JSON.parse(spu.swiper_images) : spu.swiper_images
    };
  }

  static async listSku(spuId) {
    const rows = await GoodsModel.listSku(spuId);
    return rows.map(r => ({
      ...r,
      _id: String(r.id),
      attr_value: r.attr_json ? (typeof r.attr_json === 'string' ? JSON.parse(r.attr_json) : r.attr_json) : []
    }));
  }
}
