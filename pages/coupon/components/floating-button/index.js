Component({
  options: {
    addGlobalClass: true,
  },
  data: { icon: 'cart' },

  properties: {
    count: {
      type: Number,
    },
  },

  methods: {
    goToCart() {
      // wx.switchTab({
      //   url: '/pages/cart/index',
      // });
    },
  },
});
