import TabMenu from './data';
import { getUser } from '../services/usercenter/user';

Component({
  options: {
    addGlobalClass: true,
  },
  data: {
    active: 0,
    list: TabMenu,
  },

  methods: {
    onChange(event) {
      const { value } = event.detail;
      this.setData({ active: value });
      wx.switchTab({
        url: this.data.list[value].url.startsWith('/')
          ? this.data.list[value].url
          : `/${this.data.list[value].url}`,
      });
    },

    async init() {
      const userInfo = await getUser();
      let list = TabMenu.map((item) => ({ ...item, iconSource: 'wr' }));
      
      // 如果是打手，添加“接单”导航项
      if (userInfo && Number(userInfo.role) === 2) {
        const hasSquare = list.some(item => item.url.includes('pages/order/square/index'));
        if (!hasSquare) {
          list.push({
            icon: 'saving-pot',
            iconSource: '',
            text: '接单',
            url: 'pages/order/square/index',
          });
        }
      }

      const page = getCurrentPages().pop();
      const route = page ? page.route.split('?')[0] : '';
      const active = list.findIndex(
        (item) =>
          (item.url.startsWith('/') ? item.url.substr(1) : item.url) ===
          `${route}`,
      );
      this.setData({ list, active });
    },
  },
});
