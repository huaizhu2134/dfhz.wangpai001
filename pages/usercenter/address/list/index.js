/* eslint-disable no-param-reassign */
import { getAllAddress, deleteAddress } from '../../../../services/address/address';
import Toast from 'tdesign-miniprogram/toast/index';
import { resolveAddress, rejectAddress } from './util';
import { shouldFresh, addressListFinishFresh } from '../../../../utils/addressListFresh';
import { objectToParamString } from '../../../../utils/util';
import { getUser } from '../../../../services/usercenter/user';

Page({
  data: {
    uid:'',
    addressList: [],
    deleteID: '',
    showDeleteConfirm: false,
    loading: false,
  },

  setLoading() {
    this.setData({ loading: true });
  },
  unsetLoading() {
    this.setData({ loading: false });
  },

  /**
   * 如果是 true 的话，点击后会选中并返回上一页；否则点击后会进入编辑页
   */
  selectMode: false,
  /** 是否已经选择地址，不置为 true 的话页面离开时会触发取消选择行为 */
  hasSelect: false,

  onLoad(query) {
    const { selectMode, id = '' } = query;
    // this.initUser();
    this.setData({
      id,
    });
    this.selectMode = selectMode === 'true';
    this.init();
  },

  onShow() {
    shouldFresh && this.fresh();
  },

  init() {
    this.fresh();
  },
  
  onUnload() {
    if (this.selectMode && !this.hasSelect) {
      rejectAddress();
    }
  },
  async fresh() {
    this.setLoading();
    try {
      await this.getAddressList();
      addressListFinishFresh();
    } catch {
      this.toast('拉取游戏账号失败，请稍后再试');
    } finally {
      this.unsetLoading();
    }
  },
  async getAddressList() {
    // const uid = this.data.uid;
    const {_id} = await getUser();
    if( _id.length > 0 ){
        console.log('ad',_id);
        this.setData({
            uid:_id,
          });
        const addressList = await getAllAddress(_id);
        this.setData({ addressList });
    }
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
  noop() {
    // 阻止事件冒泡
  },
  async onDeleteAddress(e) {
    const { currentTarget: { dataset: { id } } } = e;
    
    Dialog.confirm({
      title: '确认删除',
      content: '确定要删除这个游戏账号吗？此操作不可撤销。',
      confirmBtn: '删除',
      cancelBtn: '取消',
      theme: 'danger',
    })
      .then(async () => {
        try {
          this.setLoading();
          await deleteAddress({ id });
          const { addressList } = this.data;
          this.setData({ addressList: addressList.filter((x) => x._id !== id) });
          this.toast('删除成功');
        } catch {
          this.toast('删除游戏账号失败，请稍后再试');
        } finally {
          this.unsetLoading();
        }
      })
      .catch(() => {
        // 取消删除
      });
  },
  onEditAddress(e) {
    const { currentTarget: { dataset: { detail } } } = e;
    const { _id, gameName, gameId, gamePlatform } = detail;
    wx.navigateTo({
      url: `/pages/usercenter/address/edit/index?_id=${_id}&gameName=${encodeURIComponent(gameName)}&gameId=${encodeURIComponent(gameId)}&gamePlatform=${gamePlatform}`
    });
  },
  selectHandle(e) {
    const { currentTarget: { dataset: { detail } } } = e;
    if (this.selectMode) {
      this.hasSelect = true;
      resolveAddress(detail);
      wx.navigateBack({ delta: 1 });
    } else {
      this.onEditAddress(e);
    }
  },
  createHandle() {
    const {uid} = this.data;
    wx.navigateTo({ url: `/pages/usercenter/address/edit/index?uid=${uid}` });
  },
});
