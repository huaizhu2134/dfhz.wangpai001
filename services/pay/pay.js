import { USE_MOCK } from '../../config/api';
import { request } from '../_utils/request';

/**
 *
 * @param {{id: String, totalPrice: Number}} order
 * @returns
 */
export async function pay(order) {
  if (USE_MOCK) return true;
  const res = await request({ url: '/pay/create', method: 'POST', data: { orderId: order.id } });
  const paymentData = res?.payment;
  if (!paymentData) return false;
  await wx.requestPayment({
    timeStamp: paymentData?.timeStamp,
    nonceStr: paymentData?.nonceStr,
    package: paymentData?.packageVal,
    paySign: paymentData?.paySign,
    signType: 'RSA',
  });
  return true;
}

export async function refund(orderId) {
  if (USE_MOCK) return { ok: true };
  return request({ url: '/pay/refund', method: 'POST', data: { orderId } });
}
