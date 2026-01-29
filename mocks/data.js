import { SPU_SELLING_STATUS } from "../utils/spuStatus";
import { DATA_MODEL_KEY } from "../config/model";

const IMG1 = "https://cdn-we-retail.ym.tencent.com/miniapp/home/swiper/1.png";
const IMG2 = "https://cdn-we-retail.ym.tencent.com/miniapp/home/swiper/2.png";
const IMG3 = "https://cdn-we-retail.ym.tencent.com/miniapp/home/swiper/3.png";

export const mockData = {
  [DATA_MODEL_KEY.HOME_SWIPER]: [
    {
      _id: "home_swiper_1",
      images: [IMG1, IMG2, IMG3],
    },
  ],
  [DATA_MODEL_KEY.CATE]: [
    {
      _id: "cate_1",
      name: "热门",
      image: IMG1,
      child_cate: [
        { _id: "cate_1_1", name: "王者荣耀", image: IMG2 },
        { _id: "cate_1_2", name: "和平精英", image: IMG3 },
      ],
      spu: [
        {
          _id: "spu_1",
          name: "王者荣耀上分",
          cover_image: IMG2,
          swiper_images: [IMG2, IMG3],
          status: SPU_SELLING_STATUS,
          priority: 10,
        },
        {
          _id: "spu_2",
          name: "和平精英上分",
          cover_image: IMG3,
          swiper_images: [IMG1, IMG3],
          status: SPU_SELLING_STATUS,
          priority: 5,
        },
      ],
    },
  ],
  [DATA_MODEL_KEY.SPU]: [
    {
      _id: "spu_1",
      name: "王者荣耀上分",
      cover_image: IMG2,
      swiper_images: [IMG2, IMG3],
      status: SPU_SELLING_STATUS,
      priority: 10,
    },
    {
      _id: "spu_2",
      name: "和平精英上分",
      cover_image: IMG3,
      swiper_images: [IMG1, IMG3],
      status: SPU_SELLING_STATUS,
      priority: 5,
    },
  ],
  [DATA_MODEL_KEY.SKU]: [
    {
      _id: "sku_1",
      spu: { _id: "spu_1", name: "王者荣耀上分" },
      count: 999,
      price: 9.9,
      image: IMG2,
      attr_value: [{ _id: "attr_1", value: "单排" }],
    },
    {
      _id: "sku_2",
      spu: { _id: "spu_2", name: "和平精英上分" },
      count: 999,
      price: 12.9,
      image: IMG3,
      attr_value: [{ _id: "attr_2", value: "双排" }],
    },
  ],
  [DATA_MODEL_KEY.ATTR_VALUE]: [
    { _id: "attr_1", value: "单排", attr_name: { _id: "attr_name_1", name: "模式" } },
    { _id: "attr_2", value: "双排", attr_name: { _id: "attr_name_1", name: "模式" } },
  ],
  [DATA_MODEL_KEY.COMMENT]: [
    { _id: "c_1", spu: "spu_1", purchaser: "u_mock_1", content: "很快很稳", rate: 5, createdAt: Date.now() },
  ],
  [DATA_MODEL_KEY.ORDER]: [],
  [DATA_MODEL_KEY.ORDER_ITEM]: [],
  [DATA_MODEL_KEY.GAME_ACCOUNT]: [],
  [DATA_MODEL_KEY.USER]: [],
};
