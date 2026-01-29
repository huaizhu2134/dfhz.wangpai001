import Toast from 'tdesign-miniprogram/toast/index';
import { createOrderItem } from '../../../services/order/orderItem';
import { createOrder, ORDER_STATUS, updateOrderStatus } from '../../../services/order/order';
import { getSkuDetail, updateSku } from '../../../services/sku/sku';
import { getAddressPromise } from '../../usercenter/address/list/util';
import { getSingleCloudImageTempUrl } from '../../../utils/cloudImageHandler';
import { pay } from '../../../services/pay/pay';
import { getUser } from '../../../services/usercenter/user';

const stripeImg = `https://s21.ax1x.com/2025/04/14/pEWs6ER.png`;

async function createOrderItemFromSku({ count, orderId, skuId }) {
  const latestSku = await getSkuDetail(skuId);
  const finalCount = latestSku.count - count;
  const pay_price =  latestSku.price;
  const attr_values = latestSku.attr_value.reduce((acc, current, index) => {
    return acc + current.value + (index === latestSku.attr_value.length - 1? '' : ', ');
  }, '');
  const desc = latestSku.spu.name + ','+ attr_values;
  console.log('desc',desc);
  // check if sku is enough
  if (finalCount < 0) {
    return Promise.reject({ reason: 'SKU_NOT_ENOUGH' });
  }

  try {
    // decrease sku's count
    await updateSku({
      skuId,
      data: {
        count: finalCount,
      },
    });
    try {
      // create order item需要记录item当时的价格
      await createOrderItem({ desc,count, orderId, skuId,pay_price });
    } catch (e) {
      console.error(e);
      return Promise.reject({ reason: 'CREATE_ORDER_ITEM_FAILED' });
    }
  } catch (e) {
    console.error(e);
    return Promise.reject({ reason: 'SKU_DECREASE_FAILED' });
  }
}



Page({
  data: {
    placeholder: '备注信息',
    stripeImg,
    loading: true,
    orderCardList: [], // 仅用于商品卡片展示
    goodsRequestList: [],
    userAddressReq: null,
    storeInfoList: [],
    promotionGoodsList: [], //当前门店商品列表(优惠券)
    currentStoreId: null, //当前优惠券storeId
    userAddress: null,
    goodsList: [],
    totalSalePrice: 0,
    directSku: null,
  },

  payLock: false,

  type: null,
  onShow() {
    this.initUser();
  },
  async initUser(){
    const {_id} = await getUser();  
    console.log('u',_id);
    this.setData({
      uid:_id,
    })
},

  async onLoadFromDirect(countStr, skuId) {
    const count = parseInt(countStr);
    if (typeof count !== 'number' || isNaN(count) || typeof skuId !== 'string') {
      console.error('invalid cunt or skiId', count, skuId);
      this.failedAndBack('初始化信息有误');
      return;
    }

    try {
      const sku = await getSkuDetail(skuId);
      sku.image = await getSingleCloudImageTempUrl(sku.image);

      const goodsList = [
        {
          thumb: sku.image,
          title: sku.spu.name,
          specs: sku.attr_value.map((v) => v.value).join('，'),
          price: sku.price,
          num: count,
        },
      ];

      const totalSalePrice = goodsList.reduce((acc, cur) => acc + cur.price * cur.num, 0);
      this.setData({
        goodsList,
        totalSalePrice,
        directSku: sku,
      });
    } catch (e) {
      this.failedAndBack('获取商品信息失败', e);
    }
  },

  async onLoad(options) {
    this.type = options?.type || 'direct'; // Default to direct
    
    if (this.type === 'direct') {
      await this.onLoadFromDirect(options?.count, options?.skuId);
    } else {
      // Fallback or error handling if unexpected type
      await this.onLoadFromDirect(options?.count, options?.skuId);
    }

    this.setData({
      loading: false,
    });
  },

  init() {
    this.setData({
      loading: false,
    });
    const { goodsRequestList } = this;
    this.handleOptionsParams({ goodsRequestList });
  },

  toast(message) {
    Toast({
      context: this,
      selector: '#t-toast',
      message,
      duration: 1000,
      icon: '',
    });
  },

  onGotoAddress() {
    /** 获取一个Promise */
    getAddressPromise()
      .then((address) => {
        this.setData({
          userAddress: {
            ...address,
          },
        });
      })
      .catch(() => {});

    wx.navigateTo({
      url: `/pages/usercenter/address/list/index?selectMode=true`,
    });
  },
  onTap() {
    this.setData({
      placeholder: '',
    });
  },

  async payImpl(totalPrice, orderId) {
    try {
      const res = await pay({ id: orderId, totalPrice });
      if(res == false){
        this.toast('支付异常');
        throw new Error('支付异常');
      }
      try {
        await updateOrderStatus({ orderId, status: ORDER_STATUS.TO_SEND });
        this.toast('支付成功');
      } catch (e) {
        console.error(e);
        this.toast('支付成功，但订单状态更新失败');
      } finally {
        setTimeout(() => {
          wx.navigateBack();
        }, 1000);
      }
    } catch (e) {
      this.failedAndBack('支付失败', e);
    }
  },

  async submitOrderFromDirect() {
    /**
     * 1.创建订单
     * 2.创建订单项
     */
    wx.showLoading({ title: '订单处理中' });

    const { directSku, userAddress, goodsList,uid } = this.data;
    const goods = goodsList[0];
    const { id: orderId } = await createOrder({ status: ORDER_STATUS.TO_PAY, accountId: userAddress._id, uid });

    try {
      await createOrderItemFromSku({ count: goods.num, orderId, skuId: directSku._id });
      const totalPrice = goods.price * goods.num;

      await this.payImpl(totalPrice, orderId);
      wx.hideLoading();

    } catch (e) {
      this.failedAndBack('创建订单失败', e);
    }
  },

  failedAndBack(message, e) {
    e && console.error(e);
    this.toast(message);
    setTimeout(() => {
      wx.navigateBack();
    }, 1000);
  },

  // 提交订单
  async submitOrder() {
    const { userAddress } = this.data;
    if (!userAddress) {
      Toast({
        context: this,
        selector: '#t-toast',
        message: '请添加游戏账号',
        duration: 2000,
        icon: 'help-circle',
      });
      return;
    }

    this.submitOrderFromDirect();
  },
});
