import Toast from 'tdesign-miniprogram/toast/index';
import { ORDER_STATUS, listOrder, listOrderByStatuses, orderStatusToName } from '../../../services/order/order';
import { getAllOrderItemsOfAnOrder } from '../../../services/order/orderItem';
import { LIST_LOADING_STATUS } from '../../../utils/listLoading';
import { getCloudImageTempUrl } from '../../../utils/cloudImageHandler';
import { OPERATION_TYPE } from '../../../utils/orderOperation';
import { shouldFresh, orderListFinishFresh } from '../../../utils/orderListFresh';
import { getUser } from '../../../services/usercenter/user';

const ORDER_TAB_NOT_TAKEN = 'NOT_TAKEN';

Page({
  page: {
    size: 5,
    num: 1,
  },

  data: {
    tabs: [
      { key: ORDER_STATUS.TO_PAY, text: '待付款', total: 0 },
      { key: ORDER_TAB_NOT_TAKEN, text: '未接单', total: 0 },
      { key: ORDER_STATUS.TO_RECEIVE, text: '已接单', total: 0 },
      { key: ORDER_STATUS.FINISHED, text: '已完成', total: 0 },
    ],
    curTab: ORDER_TAB_NOT_TAKEN,
    orderList: [],
    listLoading: LIST_LOADING_STATUS.READY,
    emptyImg: 'https://s21.ax1x.com/2025/04/14/pEWssb9.png',
    backRefresh: false,
    status: ORDER_TAB_NOT_TAKEN,
    pullDownRefreshing: false,
    loadingProps: {
      theme: 'circular',
      size: '40rpx',
    },
    currentUserId: '',
  },

  errorToast(message, e) {
    console.error(message, e);
    this.toast(message);
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

  onLoad(query) {
    const status = query?.status || ORDER_TAB_NOT_TAKEN;
    this.setData({
      status,
    });
    this.refreshList(status);
  },
  
  async pullRefresh() {
    this.setData({ pullDownRefreshing: true });
    try {
      await this.onRefresh();
      orderListFinishFresh();
    } catch (e) {
      this.errorToast('获取订单列表失败', e);
    } finally {
      this.setData({ pullDownRefreshing: false });
    }
  },

  async onShow() {
    if (!shouldFresh) return;
    try {
      await this.onRefresh();
      orderListFinishFresh();
    } catch (e) {
      this.errorToast('获取订单列表失败', e);
    }
  },

  onReachBottom() {
    if (this.data.listLoading === LIST_LOADING_STATUS.READY) {
      this.getOrderList(this.data.curTab);
    }
  },

  async getOrderItems(order) {
    
    const orderId = order._id;
    try {
      const orderItems = await getAllOrderItemsOfAnOrder({ orderId });
      console.log('orderItems',orderItems);

      const images = orderItems.map((x) => x.sku.image ?? '');
      (await getCloudImageTempUrl(images)).forEach((image, index) => (orderItems[index].sku.image = image));

      order.orderItems = orderItems;
      order.totalPrice = orderItems.reduce((acc, cur) => acc + cur.pay_price * cur.count, 0);
    } catch (e) {
      this.errorToast('获取订单详情失败', e);
    }
  },

  async getOrderList(statusCode = ORDER_TAB_NOT_TAKEN, reset = false) {
    const { _id } = await getUser();
    if(_id.length <= 0) return;
    if (this.data.currentUserId !== _id) {
      this.setData({ currentUserId: _id });
    }
    this.setData({
      listLoading: LIST_LOADING_STATUS.LOADING,
    });
    try {
      const res =
        statusCode === ORDER_TAB_NOT_TAKEN
          ? await listOrderByStatuses({
              pageSize: this.page.size,
              pageNumber: this.page.num,
              statuses: [ORDER_STATUS.TO_SEND],
              uid: _id,
            })
          : await listOrder({
              pageSize: this.page.size,
              pageNumber: this.page.num,
              status: statusCode,
              uid: _id,
            });
      const { records, total } = res;

      records.forEach((order) => (order.statusDesc = orderStatusToName(order.status)));

      // async get items for each order
      await Promise.all(records.map((order) => this.getOrderItems(order)));

      const orderList = reset ? records : this.data.orderList.concat(records);
      const listLoading = orderList.length >= total ? LIST_LOADING_STATUS.NO_MORE : LIST_LOADING_STATUS.READY; // TODO: maybe we should notify user when `length > total`?

      this.setData({ listLoading, orderList });
      const currentNum = reset ? 1 : this.page.num;
      this.page.num = currentNum + 1;
    } catch (e) {
      console.error('获取订单列表失败', e);
      this.setData({ listLoading: LIST_LOADING_STATUS.FAILED });
    }
  },

  onReTryLoad() {
    this.getOrderList(this.data.curTab);
  },

  refreshList(status = ORDER_TAB_NOT_TAKEN) {
    this.page = {
      size: this.page.size,
      num: 1,
    };
    this.setData({ curTab: status, orderList: [] });

    return this.getOrderList(status, true);
  },

  onRefresh() {
    return this.refreshList(this.data.curTab);
  },

  onTabChange(e) {
    const { value } = e.detail;
    this.setData({
      status: value,
    });
    this.refreshList(value);
  },

  onOrderCardTap(e) {
    const { order } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/order/order-detail/index?orderId=${order._id}`,
    });
  },

  onCopyOrderId(e) {
    const id = e?.currentTarget?.dataset?.id;
    if (!id) return;
    wx.setClipboardData({
      data: id,
    });
  },

  onOperation(e) {
    const type = e?.detail?.type;
    const success = e?.detail?.success;

    if (type == null) return;

    const resultMessage = success ? '成功' : '失败';

    let operationMessage;

    if (type === OPERATION_TYPE.CANCEL) {
      operationMessage = '取消订单';
    } else if (type === OPERATION_TYPE.CONFIRM) {
      operationMessage = '确认完成';
    } else {
      operationMessage = '支付';
    }
    if( type !== 're' ){
      this.toast(`${operationMessage}${resultMessage}`);
    }
    this.onRefresh();
  },
});
