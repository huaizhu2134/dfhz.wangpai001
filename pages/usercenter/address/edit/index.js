import Toast from 'tdesign-miniprogram/toast/index';
import { createAddress, updateAddress } from '../../../../services/address/address';
import { addressListShouldFresh } from '../../../../utils/addressListFresh';
import { getUser } from '../../../../services/usercenter/user';

const innerNameReg = '^[a-zA-Z\\d\\u4e00-\\u9fa5]+$';

Page({
  options: {
    multipleSlots: true,
  },
  externalClasses: ['theme-wrapper-class'],
  data: {
    uid:'',
    gameName: '',
    gameId: '',
    addressId: null,
    loading: false,
    platformVisible: false,
    platformValue: '',
    platformText: '请选择游戏端',
    platformOptions: [
      { name: '手机', code: 'mobile' },
      { name: '电脑', code: 'pc' },
    ],
  },
  showPlatformPicker() {
    this.setData({ platformVisible: true });
  },
  onPlatformConfirm(e) {
    const { value } = e.detail;
    const selectedOption = this.data.platformOptions.find(opt => opt.code === value);
    this.setData({
      platformVisible: false,
      platformValue: value,
      platformText: selectedOption ? selectedOption.name : '请选择游戏端',
    });
  },
  onPlatformClose() {
    this.setData({ platformVisible: false });
  },
  setLoading() {
    this.setData({ loading: true });
  },
  unsetLoading() {
    this.setData({ loading: false });
  },
  async onLoad(options) {
    // 获取用户ID
    if (!this.data.uid) {
      const { _id } = await getUser();
      if (_id) {
        this.setData({ uid: _id });
      }
    }
    
    // 更新游戏账号
    const { gameName, gameId, gamePlatform, _id } = options;
    if (gameName || gameId || gamePlatform) {
      this.setData({
        gameName: gameName ? decodeURIComponent(gameName) : '',
        gameId: gameId ? decodeURIComponent(gameId) : '',
        platformValue: gamePlatform || '',
        platformText: gamePlatform === 'mobile' ? '手机' : (gamePlatform === 'pc' ? '电脑' : '请选择游戏端'),
        addressId: _id || null,
      });
    }
  },
  onInputValue(event) {
    const {
      detail: { value },
      currentTarget: {
        dataset: { item },
      },
    } = event;
    this.setData({ [item]: value });
  },
  onPasteGameId() {
    wx.getClipboardData({
      success: (res) => {
        if (res.data) {
          this.setData({ gameId: res.data });
          this.toast('已粘贴');
        } else {
            this.toast('剪贴板为空');
        }
      },
      fail: () => {
        this.toast('无法获取剪贴板内容');
      }
    });
  },
  onVerifyInputLegal() {
    const { gameName, platformValue } = this.data;
    const nameRegExp = new RegExp(innerNameReg);

    if (!gameName || !gameName.trim()) {
      return {
        isLegal: false,
        tips: '请填写游戏昵称',
      };
    }

    if (!nameRegExp.test(gameName)) {
      return {
        isLegal: false,
        tips: '游戏昵称仅支持输入中文、英文（区分大小写）、数字',
      };
    }

    if (!platformValue) {
      return {
        isLegal: false,
        tips: '请选择游戏端',
      };
    }

    return {
      isLegal: true,
      tips: '保存成功',
    };
  },
  toast(message) {
    Toast({
      context: this,
      selector: '#t-toast',
      message,
      icon: '',
      duration: 1000,
    });
  },
  async formSubmit() {
    const { isLegal, tips } = this.onVerifyInputLegal();

    if (isLegal) {
      let { gameName, gameId, platformValue, addressId, uid } = this.data;

      // 如果是创建新账号，必须保证有 uid
      if (!addressId && !uid) {
        try {
          const user = await getUser();
          if (user && user._id) {
            uid = user._id;
            this.setData({ uid });
          } else {
            this.toast('用户信息获取失败，请重试');
            return;
          }
        } catch (e) {
          this.toast('用户信息获取失败，请重试');
          return;
        }
      }

      this.setLoading();

      let action, failedMessage;
      if (typeof addressId === 'string') {
        console.log('to update');
        action = () => updateAddress({ uid, gameName, gameId, gamePlatform: platformValue, _id: addressId });
        failedMessage = '修改游戏账号失败，请稍候重试';
      } else {
        console.log('to create');
        action = () => createAddress({ uid, gameName, gameId, gamePlatform: platformValue });
        failedMessage = '添加游戏账号失败，请稍候重试';
      }

      try {
        await action();
        addressListShouldFresh();
        wx.navigateBack({ delta: 1 });
      } catch {
        this.toast(failedMessage);
      } finally {
        this.unsetLoading();
      }
    } else {
      this.toast(tips);
    }
  },
});
  