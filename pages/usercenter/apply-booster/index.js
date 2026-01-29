import Toast from 'tdesign-miniprogram/toast/index';
import { request } from '../../../services/_utils/request';

Page({
  data: {
    name: '',
    wechat: '',
    loading: false
  },
  onNameChange(e) {
    this.setData({ name: e.detail.value });
  },
  onWechatChange(e) {
    this.setData({ wechat: e.detail.value });
  },
  async submitApply() {
    const { name, wechat } = this.data;
    if (!name || !wechat) {
      Toast({ context: this, selector: '#t-toast', message: '请填写完整信息', theme: 'warning' });
      return;
    }
    
    this.setData({ loading: true });
    
    try {
      const res = await request({ url: '/booster/apply', method: 'POST', data: { realName: name, boosterWechat: wechat } });
      
      if (res?.code === 0) {
        Toast({ context: this, selector: '#t-toast', message: '申请提交成功，请等待审核', theme: 'success' });
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      } else {
        Toast({ context: this, selector: '#t-toast', message: res?.msg || '提交失败', theme: 'error' });
      }
    } catch (err) {
      console.error(err);
      Toast({ context: this, selector: '#t-toast', message: '网络错误', theme: 'error' });
    } finally {
      this.setData({ loading: false });
    }
  }
});
