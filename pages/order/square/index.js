import Toast from 'tdesign-miniprogram/toast/toast';
import { getUser } from '../../../services/usercenter/user';
import { request } from '../../../services/_utils/request';

const SQUARE_TAB = {
  PENDING: 'PENDING',
  TAKEN: 'TAKEN',
};

Page({
  data: {
    orders: [],
    userInfo: null,
    isRefeshing: false,
    tabs: [
      { key: SQUARE_TAB.PENDING, text: '待接单' },
      { key: SQUARE_TAB.TAKEN, text: '已接单' },
    ],
    curTab: SQUARE_TAB.PENDING,
  },

  onShow() {
    // 每次进入页面更新 tabBar 选中态
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
        this.getTabBar().init();
    }
    this.init();
  },

  async onPullDownRefresh() {
      this.setData({ isRefeshing: true });
      await this.fetchOrders();
      this.setData({ isRefeshing: false });
  },

  async init() {
    const userInfo = await getUser(true);
    this.setData({ userInfo });
    this.fetchOrders();
  },

  async fetchOrders() {
    if (!this.data.userInfo || !this.data.userInfo._id) return;
    try {
      const res = await request({ url: '/booster/squareOrders', method: 'POST', data: { tab: this.data.curTab } });

      if (res?.code === 0) {
        const orders = (res.data || []).map(item => {
          let boosters = item.boosters || [];
          if (typeof boosters === 'string') {
            try {
              boosters = JSON.parse(boosters);
            } catch (e) {
              boosters = [];
            }
          }
          const maxBoosters = item.maxBoosters || 1;
          const hasTaken = boosters.includes(this.data.userInfo._id);
          const isFirstBooster = boosters.length > 0 && boosters[0] === this.data.userInfo._id;
          
          const totalAmount = typeof item.total_amount === 'number' ? item.total_amount : 0;
          const statusName = item.status === 'TO_RECEIVE' ? '已接单' : '待接单';
          return {
            ...item,
            boosters,
            reward: (totalAmount * 0.8).toFixed(2),
            statusName,
            hasTaken,
            canIncreaseManpower: isFirstBooster && maxBoosters < 3 && item.status === 'TO_RECEIVE'
          };
        });
        this.setData({ orders });
      }
    } catch (err) {
      console.error(err);
      Toast({ context: this, selector: '#t-toast', message: '加载失败', theme: 'error' });
    }
  },

  onTabChange(e) {
    const { value } = e.detail;
    this.setData({ curTab: value });
    this.fetchOrders();
  },

  async onTakeOrder(e) {
    const { id } = e.currentTarget.dataset;
    
    try {
      const res = await request({ url: '/booster/takeOrder', method: 'POST', data: { orderId: id } });
      
      if (res?.code === 0) {
        Toast({ context: this, selector: '#t-toast', message: '接单成功', theme: 'success' });
        this.fetchOrders();
      } else {
        Toast({ context: this, selector: '#t-toast', message: res?.msg, theme: 'error' });
      }
    } catch (err) {
        Toast({ context: this, selector: '#t-toast', message: '网络错误', theme: 'error' });
    }
  },

  async onIncreaseManpower(e) {
      const { id } = e.currentTarget.dataset;
       try {
      const res = await request({ url: '/booster/increaseManpower', method: 'POST', data: { orderId: id } });
      
      if (res?.code === 0) {
        Toast({ context: this, selector: '#t-toast', message: '名额增加成功', theme: 'success' });
        this.fetchOrders();
      } else {
        Toast({ context: this, selector: '#t-toast', message: res?.msg, theme: 'error' });
      }
    } catch (err) {
        Toast({ context: this, selector: '#t-toast', message: '网络错误', theme: 'error' });
    }
  }
});
