import { getUser, updateUser } from '../../../services/usercenter/user';
import Toast from 'tdesign-miniprogram/toast/index';
import { getCloudImageTempUrl } from '../../../utils/cloudImageHandler';
import { API_BASE_URL, API_PATH_PREFIX, USE_MOCK } from '../../../config/api';
import { getAccessToken } from '../../../services/_utils/request';

Page({
  data: {
    personInfo: {
      nickName: '',
      _id: '',
      avatarUrl: '',
    },
    avatarDisplayUrl: '',
    supportChooseAvatar: false,
    defaultAvatarUrl: 'https://cdn-we-retail.ym.tencent.com/miniapp/usercenter/icon-user-center-avatar@2x.png',
  },
  onLoad() {
    this.setData({
      supportChooseAvatar: wx.canIUse('button.open-type.chooseAvatar'),
    });
  },
  onShow() {
    this.init();
  },
  init() {
    this.fetchData();
  },
  async fetchData() {
    const personInfo = (await getUser()) || {};
    if (personInfo && (personInfo.nickName === '' || personInfo.nickName == null)) delete personInfo.nickName;
    if (personInfo && (personInfo.avatarUrl === '' || personInfo.avatarUrl == null)) delete personInfo.avatarUrl;
    let avatarDisplayUrl = '';
    if (personInfo.avatarUrl) {
      try {
        const temp = await getCloudImageTempUrl([personInfo.avatarUrl]);
        avatarDisplayUrl = temp?.[0] || '';
      } catch (error) {
        avatarDisplayUrl = '';
      }
    }
    this.setData({
      personInfo: { ...this.data.personInfo, ...personInfo },
      avatarDisplayUrl,
    });
  },
  onClickCell({ currentTarget }) {
    const { dataset } = currentTarget;
    const { nickName, _id } = this.data.personInfo;

    switch (dataset.type) {
      case 'name':
        wx.navigateTo({
          url: `/pages/usercenter/name-edit/index?type=0&name=${nickName}&uid=${_id}`,
        });
        break;
      case 'wechatProfile':
        this.getWechatProfile();
        break;
      case 'avatar':
        break;
      default: {
        break;
      }
    }
  },
  onChooseAvatar(e) {
    const filePath = e?.detail?.avatarUrl;
    if (!filePath) {
      Toast({
        context: this,
        selector: '#t-toast',
        message: '未获取到头像文件',
        icon: '',
        duration: 1500,
      });
      return;
    }
    this.uploadAvatarAndSave(filePath);
  },
  onChooseImage() {
    const chooseImage = () =>
      new Promise((resolve, reject) => {
        wx.chooseImage({
          count: 1,
          sizeType: ['compressed'],
          sourceType: ['album', 'camera'],
          success: resolve,
          fail: reject,
        });
      });

    chooseImage()
      .then((res) => {
        const filePath = res?.tempFilePaths?.[0];
        if (!filePath) throw new Error('NO_FILE');
        return this.uploadAvatarAndSave(filePath);
      })
      .catch(() => {
        Toast({
          context: this,
          selector: '#t-toast',
          message: '未选择图片',
          icon: '',
          duration: 1200,
        });
      });
  },
  async getWechatProfile() {
    if (!wx.getUserProfile) {
      Toast({
        context: this,
        selector: '#t-toast',
        message: '当前微信版本不支持获取用户信息',
        icon: '',
        duration: 1500,
      });
      return;
    }

    const getProfile = () =>
      new Promise((resolve, reject) => {
        wx.getUserProfile({
          desc: '用于完善个人资料',
          success: resolve,
          fail: reject,
        });
      });

    try {
      const res = await getProfile();
      const userInfo = res?.userInfo || {};
      const rawNickName = userInfo.nickName || '';
      const rawAvatarUrl = userInfo.avatarUrl || '';
      const defaultNickName = `微信用户${String(this.data.personInfo?._id || '').slice(-6)}`;

      const isNickNameValid =
        !!rawNickName && rawNickName !== '微信用户' && rawNickName !== defaultNickName && !/^微信用户\d{6,}$/.test(rawNickName);
      const isAvatarValid =
        !!rawAvatarUrl &&
        rawAvatarUrl !== this.data.defaultAvatarUrl &&
        !rawAvatarUrl.includes('we-retail-static-1300977798.cos') &&
        !rawAvatarUrl.includes('cdn-we-retail.ym.tencent.com/miniapp/usercenter/icon-user-center-avatar@2x.png');

      if (!isNickNameValid && !isAvatarValid) {
        Toast({
          context: this,
          selector: '#t-toast',
          message: '未获取到微信头像昵称',
          icon: '',
          duration: 1500,
        });
        return;
      }

      let localAvatarPath = '';
      if (isAvatarValid) {
        const downloadFile = () =>
          new Promise((resolve, reject) => {
            wx.downloadFile({
              url: rawAvatarUrl,
              success: resolve,
              fail: reject,
            });
          });
        try {
          const downloadRes = await downloadFile();
          localAvatarPath = downloadRes?.tempFilePath || '';
        } catch (error) {
          localAvatarPath = '';
        }
      }

      if (localAvatarPath) {
        await this.uploadAvatarAndSave(localAvatarPath, { nickName: isNickNameValid ? rawNickName : undefined });
        return;
      }

      if (isNickNameValid) {
        await this.updateProfileFields({ nickName: rawNickName });
      }
    } catch (error) {
      Toast({
        context: this,
        selector: '#t-toast',
        message: '已取消',
        icon: '',
        duration: 1000,
      });
    }
  },
  async uploadAvatarAndSave(filePath, extraData = {}) {
    const uid = this.data.personInfo?._id;
    if (!uid) {
      Toast({
        context: this,
        selector: '#t-toast',
        message: '用户未就绪，请稍后重试',
        icon: '',
        duration: 1500,
      });
      return;
    }

    Toast({
      context: this,
      selector: '#t-toast',
      message: '正在保存头像...',
      icon: '',
      duration: 1500,
    });

    if (USE_MOCK) {
      await this.updateProfileFields({
        ...extraData,
        avatarUrl: 'https://cdn-we-retail.ym.tencent.com/miniapp/home/swiper/1.png',
      });
      return;
    }

    const uploadFile = () =>
      new Promise((resolve, reject) => {
        const token = getAccessToken();
        const header = token ? { Authorization: `Bearer ${token}` } : {};
        wx.uploadFile({
          url: `${API_BASE_URL}${API_PATH_PREFIX}/upload/avatar`,
          filePath,
          name: 'file',
          header,
          success: resolve,
          fail: reject,
        });
      });

    try {
      const uploadRes = await uploadFile();
      const raw = uploadRes?.data || '';
      const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
      const avatarUrl = parsed?.user?.avatarUrl;
      if (!avatarUrl) throw new Error('UPLOAD_FAIL');
      await this.updateProfileFields({ ...extraData, avatarUrl });
    } catch (error) {
      Toast({
        context: this,
        selector: '#t-toast',
        message: '头像保存失败',
        icon: '',
        duration: 1500,
      });
    }
  },
  async updateProfileFields(data) {
    const uid = this.data.personInfo?._id;
    if (!uid) return;

    const next = { ...data };
    if (next.nickName === '' || next.nickName == null) delete next.nickName;
    if (next.avatarUrl === '' || next.avatarUrl == null) delete next.avatarUrl;
    if (next.nickName && (next.nickName === '微信用户' || /^微信用户\d{6,}$/.test(next.nickName))) delete next.nickName;
    if (
      next.avatarUrl &&
      (next.avatarUrl === this.data.defaultAvatarUrl ||
        next.avatarUrl.includes('we-retail-static-1300977798.cos') ||
        next.avatarUrl.includes('cdn-we-retail.ym.tencent.com/miniapp/usercenter/icon-user-center-avatar@2x.png'))
    ) {
      delete next.avatarUrl;
    }
    if (!Object.keys(next).length) {
      Toast({
        context: this,
        selector: '#t-toast',
        message: '未获取到可更新的资料',
        icon: '',
        duration: 1500,
      });
      return;
    }

    try {
      const updatedUser = await updateUser({ uid, data: next });
      const personInfo = updatedUser && updatedUser.error ? { ...this.data.personInfo, ...next } : updatedUser;
      let avatarDisplayUrl = '';
      if (personInfo?.avatarUrl) {
        try {
          const temp = await getCloudImageTempUrl([personInfo.avatarUrl]);
          avatarDisplayUrl = temp?.[0] || '';
        } catch (error) {
          avatarDisplayUrl = '';
        }
      }
      this.setData({
        personInfo: { ...this.data.personInfo, ...personInfo },
        avatarDisplayUrl,
      });
      Toast({
        context: this,
        selector: '#t-toast',
        message: '已更新',
        icon: '',
        duration: 1000,
      });
    } catch (error) {
      Toast({
        context: this,
        selector: '#t-toast',
        message: '更新失败',
        icon: '',
        duration: 1500,
      });
    }
  },
});
