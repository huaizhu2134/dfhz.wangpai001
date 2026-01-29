import { fetchUserCenter } from '../../services/usercenter/fetchUsercenter';
import { getToPayOrderCount, getToSendOrderCount, getToReceiveOrderCount, getFinishedOrderCount } from '../../services/order/order';
import { ORDER_STATUS } from '../../services/order/order';
import Toast from 'tdesign-miniprogram/toast/index';
import { getUser } from '../../services/usercenter/user';
import { getCloudImageTempUrl } from '../../utils/cloudImageHandler';


const menuData = [
  [
    {
      title: '游戏账号',
      tit: '',
      url: '',
      type: 'address',
    },
    {
      title: '成为打手',
      tit: '',
      url: '',
      type: 'apply-booster',
    },
  ],
];

const orderTagInfos = [
  {
    title: '待付款',
    iconName: 'wallet',
    orderNum: 0,
    tabType: ORDER_STATUS.TO_PAY,
    status: 1,
  },
  {
    title: '未接单',
    iconName: 'wallet',
    orderNum: 0,
    tabType: 'NOT_TAKEN',
    status: 1,
  },
  {
    title: '已接单',
    iconName: 'package',
    orderNum: 0,
    tabType: ORDER_STATUS.TO_RECEIVE,
    status: 1,
  },
  {
    title: '已完成',
    iconName: 'comment',
    orderNum: 0,
    tabType: ORDER_STATUS.FINISHED,
    status: 1,
  },
  // {
  //   title: '退款/售后',
  //   iconName: 'exchang',
  //   orderNum: 0,
  //   tabType: 0,
  //   status: 1,
  // },
];

const getDefaultData = () => ({
  showMakePhone: false,
  userInfo: {
    avatarUrl: '',
    nickName: '正在登录...',
    phoneNumber: '',
    _id:''
  },
  menuData,
  orderTagInfos,
  customerServiceInfo: {},
  currAuthStep: 1,
  showKefu: true,
  versionNo: '',
  toPayOrderCount: 0,
  toSendOrderCount: 0,
  toReceiveOrderCount: 0,
});

Page({
  data: getDefaultData(),

  onLoad() {
    this.getVersionInfo();
  },

  onShow() {
    this.getTabBar().init();
    this.init();
  },
  onPullDownRefresh() {
    this.init();
  },

  init() {
    this.fetUseriInfoHandle();
    // 强制重置 orderTagInfos 以确保 UI 更新
    this.setData({ orderTagInfos });
    this.initOrderCount();
  },
  
  async initOrderCount() {
    let userInfo = {};
    try {
      userInfo = (await getUser()) || {};
    } catch (error) {
      Toast({
        context: this,
        selector: '#t-toast',
        message: '用户信息获取失败，请稍后重试',
        icon: '',
        duration: 1500,
      });
      this.setData({
        userInfo: { ...this.data.userInfo },
        currAuthStep: 1,
      });
      return;
    }

    if (userInfo && (userInfo.nickName === '' || userInfo.nickName == null)) delete userInfo.nickName;
    if (userInfo && (userInfo.avatarUrl === '' || userInfo.avatarUrl == null)) delete userInfo.avatarUrl;

    const mergedUserInfo = { ...this.data.userInfo, ...userInfo };

    if (typeof mergedUserInfo.avatarUrl === 'string' && mergedUserInfo.avatarUrl.includes('we-retail-static-1300977798')) {
      mergedUserInfo.avatarUrl = '';
    }

    if (mergedUserInfo.avatarUrl) {
      try {
        const temp = await getCloudImageTempUrl([mergedUserInfo.avatarUrl]);
        mergedUserInfo.avatarUrl = temp?.[0] || '';
      } catch (error) {
        mergedUserInfo.avatarUrl = '';
      }
    }

    const newMenuData = [...this.data.menuData];
    if (Number(mergedUserInfo.role) === 2) {
        newMenuData[0][1].tit = '已认证';
    } else if (mergedUserInfo.boosterStatus === 'pending') {
        newMenuData[0][1].tit = '审核中';
    } else if (mergedUserInfo.boosterStatus === 'rejected') {
        newMenuData[0][1].tit = '已拒绝';
    }

    this.setData({
        userInfo: mergedUserInfo,
        currAuthStep: mergedUserInfo?._id ? 2 : 1,
        menuData: newMenuData
    })
    const { _id } = mergedUserInfo;
    if (!_id) return;
    const [toPay, toSend, receive, finished] = await Promise.all([
      getToPayOrderCount(_id),
      getToSendOrderCount(_id),
      getToReceiveOrderCount(_id),
      getFinishedOrderCount(_id),
    ]);
    this.setData({
      'orderTagInfos[0].orderNum': toPay,
      'orderTagInfos[1].orderNum': toSend,
      'orderTagInfos[2].orderNum': receive,
      'orderTagInfos[3].orderNum': finished,
    });
  },

  fetUseriInfoHandle() {
    fetchUserCenter().then(({ countsData, customerServiceInfo }) => {
      // eslint-disable-next-line no-unused-expressions
      menuData?.[0].forEach((v) => {
        countsData && countsData.forEach((counts) => {
          if (counts.type === v.type) {
            // eslint-disable-next-line no-param-reassign
            v.tit = counts.num;
          }
        });
      });
    
      this.setData({
        menuData,
        customerServiceInfo,
        // currAuthStep: 2,
      });
    //   this.initUser();
      wx.stopPullDownRefresh();
    });
  },

  onClickCell({ currentTarget }) {
    const { type } = currentTarget.dataset;

    switch (type) {
      case 'address': {
        wx.navigateTo({ url: '/pages/usercenter/address/list/index' });
        break;
      }
      case 'apply-booster': {
        wx.navigateTo({ url: '/pages/usercenter/apply-booster/index' });
        break;
      }
      case 'service': {
        this.openMakePhone();
        break;
      }
      case 'help-center': {
        Toast({
          context: this,
          selector: '#t-toast',
          message: '你点击了帮助中心',
          icon: '',
          duration: 1000,
        });
        break;
      }
      case 'point': {
        Toast({
          context: this,
          selector: '#t-toast',
          message: '你点击了积分菜单',
          icon: '',
          duration: 1000,
        });
        break;
      }
      case 'coupon': {
        wx.navigateTo({ url: '/pages/coupon/coupon-list/index' });
        break;
      }
      default: {
        Toast({
          context: this,
          selector: '#t-toast',
          message: '未知跳转',
          icon: '',
          duration: 1000,
        });
        break;
      }
    }
  },

  jumpNav(e) {
    const status = e.detail.tabType;

    if (status === 0) {
      wx.navigateTo({ url: '/pages/order/after-service-list/index' });
    } else {
      wx.navigateTo({ url: `/pages/order/order-list/index?status=${status}` });
    }
  },

  jumpAllOrder() {
    wx.navigateTo({ url: '/pages/order/order-list/index' });
  },

  openMakePhone() {
    this.setData({ showMakePhone: true });
  },

  closeMakePhone() {
    this.setData({ showMakePhone: false });
  },

  call() {
    wx.makePhoneCall({
      phoneNumber: this.data.customerServiceInfo.servicePhone,
    });
  },

  gotoUserEditPage() {
    const { currAuthStep } = this.data;
    if (currAuthStep === 2) {
      wx.navigateTo({ url: '/pages/usercenter/person-info/index' });
    } else {
      this.initOrderCount();
    }
  },

  getVersionInfo() {
    const versionInfo = wx.getAccountInfoSync();
    const { version, envVersion = __wxConfig } = versionInfo.miniProgram;
    this.setData({
      versionNo: envVersion === 'release' ? version : envVersion,
    });
  },
});
