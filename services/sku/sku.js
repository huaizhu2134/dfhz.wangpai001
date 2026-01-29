import { model, getAll } from '../_utils/model';
import { DATA_MODEL_KEY } from '../../config/model';
import { USE_MOCK } from '../../config/api';
import { request } from '../_utils/request';

const SKU_MODEL_KEY = DATA_MODEL_KEY.SKU;

/**
 *
 * @param {String} skuId
 */
export async function getSkuDetail(skuId) {
  const { data } = await model()[SKU_MODEL_KEY].get({
    filter: {
      where: {
        _id: { $eq: skuId },
      },
    },
    select: {
      _id: true,
      count: true,
      price: true,
      image: true,
      attr_value: {
        value: true,
        _id: true,
      },
      spu: {
        name: true,
      },
    },
  });
  return data;
}

export async function updateSku({ skuId, data }) {
  if (USE_MOCK) {
    await model()[SKU_MODEL_KEY].update({
      filter: { where: { _id: { $eq: skuId } } },
      data,
    });
    return { result: { data: { count: 1 } } };
  }
  return request({ url: '/sku/update', method: 'POST', data: { skuId, data } });
}

export async function getAllSku(spuId) {
  return getAll({
    name: SKU_MODEL_KEY,
    filter: {
      where: {
        spu: {
          $eq: spuId,
        },
      },
    },
  });
}
