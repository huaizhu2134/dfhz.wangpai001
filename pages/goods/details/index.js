// 第三方库
import Toast from 'tdesign-miniprogram/toast/index';

// 服务层
import { getAllAttrValues } from '../../../services/attrValue/attrValue';
import { handleSpuCloudImage, getSpu } from '../../../services/good/spu';
import { getGoodsDetailCommentInfo } from '../../../services/comments/comments';
import { getAllSku } from '../../../services/sku/sku';
import { getUser } from '../../../services/usercenter/user';

// 工具函数
import { cdnBase } from '../../../config/index';
import { getCloudImageTempUrl, getSingleCloudImageTempUrl } from '../../../utils/cloudImageHandler';
import { objectToParamString } from '../../../utils/util';

const imgPrefix = `${cdnBase}/`;

const recLeftImg = `${imgPrefix}common/rec-left.png`;
const recRightImg = `${imgPrefix}common/rec-right.png`;


async function replaceCloudImageWithTempUrl(text) {
  let ret = text;

  // 使用正则表达式匹配所有被双引号包裹的链接
  const regex = /"(cloud:\/\/[^"]*)"/g;
  let match;
  // 使用一个循环来处理所有匹配的链接
  while ((match = regex.exec(ret)) !== null) {
    const originalLink = match[0];
    const pureLink = match[1];
    // 处理链接
    const processedLink = await getSingleCloudImageTempUrl(pureLink);
    // 替换文本中的原始链接
    ret = ret.replace(originalLink, `"${processedLink}"`);
  }
  const widthRegex = /width="[^"]*"/;
  const heightRegex = /height="[^"]*"/;
  let pTagRegex = /<p.*?>/g;
  //文字左右留白
  ret = ret.replace(pTagRegex, '<p style="padding: 0 12px;">');
  // 图片自适应
  ret = ret.replace(/<img\s+([^>]*?)width="[^"]*?"\s+height="[^"]*?"([^>]*?)>/g, '<img style="vertical-align:middle;" $1width="100%" height="auto"$2>');
  return ret;
}

const OUT_OPERATE_STATUS = {
  BUY: 'buy',
  NO: 'no',
};

Page({
  data: {
    commentsList: [],
    commentsStatistics: {
      badCount: 0,
      commentCount: 0,
      goodCount: 0,
      goodRate: 0,
      hasImageCount: 0,
      middleCount: 0,
    },
    isShowPromotionPop: false,
    activityList: [],
    recLeftImg,
    recRightImg,
    details: {},
    jumpArray: [
      {
        title: '首页',
        url: '/pages/home/home',
        iconName: 'home',
      },
    ],
    isStock: true,
    type:0,
    soldout: false,
    buttonType: 1,
    buyNum: 1,
    selectedAttrStr: '',
    skuArray: [],
    primaryImage: '',
    specImg: '',
    isSpuSelectPopupShow: false,
    isAllSelectedSku: false,
    buyType: 0,
    outOperateStatus: OUT_OPERATE_STATUS.NO, // 是否外层加入购物车
    operateType: 0,
    selectSkuSellsPrice: 0,
    maxLinePrice: 0,
    minSalePrice: 0,
    maxSalePrice: 0,
    list: [],
    spuId: '',
    navigation: { type: 'fraction' },
    current: 0,
    autoplay: true,
    duration: 500,
    interval: 5000,
    soldNum: 0, // 已售数量,
    loading: false,
  },
//   onShareTimeline: function () {
//     return {
//       title: details.title, // 可不填
//       query: `spuId=${this.data.spu._id}`, // 可不填 传递的参数，只能是这种格式
//       imageUrl:this.data.primaryImage
//     }
//   },
onShareAppMessage() {
    const promise = new Promise(resolve => {
      setTimeout(() => {
        resolve({
          title: this.data.details.title
        })
      }, 2000)
    })
    return {
      title: this.data.details.title,
      path: `pages/goods/details/index?spuId=${this.data.spu._id}`,
    //   imageUrl:this.data.primaryImage,
      promise 
    }
  },
  setLoading() {
    this.setData({ loading: true });
  },
  unsetLoading() {
    this.setData({ loading: false });
  },

  handlePopupHide() {
    this.setData({
      isSpuSelectPopupShow: false,
    });
  },

  onSpecSelectTap() {
    this.showSkuSelectPopup(OUT_OPERATE_STATUS.NO);
  },

  showSkuSelectPopup(status) {
    this.setData({
      outOperateStatus: status,
      isSpuSelectPopupShow: true,
    });
  },

  buyItNow() {
    this.showSkuSelectPopup(OUT_OPERATE_STATUS.BUY);
  },

  toNav(e) {
    const { url } = e.detail;
    wx.switchTab({
      url: url,
    });
  },

  showCurImg(e) {
    const { index } = e.detail;
    const { images } = this.data.details;
    wx.previewImage({
      current: images[index],
      urls: images, // 需要预览的图片http链接列表
    });
  },

  onPageScroll({ scrollTop }) {
    const goodsTab = this.selectComponent('#goodsTab');
    goodsTab && goodsTab.onScroll(scrollTop);
  },

  chooseSpecItem(e) {
    const { specList } = this.data.details;
    const { selectedSku, isAllSelectedSku } = e.detail;
    if (!isAllSelectedSku) {
      this.setData({
        selectSkuSellsPrice: 0,
      });
    }
    this.setData({
      isAllSelectedSku,
    });
    this.getSkuItem(specList, selectedSku);
  },

  getSkuItem(specList, selectedSku) {
    const { skuArray, primaryImage } = this.data;
    const selectedSkuValues = this.getSelectedSkuValues(specList, selectedSku);
    let selectedAttrStr = ` 件  `;
    selectedSkuValues.forEach((item) => {
      selectedAttrStr += `，${item.specValue}  `;
    });
    // eslint-disable-next-line array-callback-return
    const skuItem = skuArray.filter((item) => {
      let status = true;
      (item.specInfo || []).forEach((subItem) => {
        if (!selectedSku[subItem.specId] || selectedSku[subItem.specId] !== subItem.specValueId) {
          status = false;
        }
      });
      if (status) return item;
    });
    this.selectSpecsName(selectedSkuValues.length > 0 ? selectedAttrStr : '');
    if (skuItem) {
      this.setData({
        selectItem: skuItem,
        selectSkuSellsPrice: skuItem.price || 0,
      });
    } else {
      this.setData({
        selectItem: null,
        selectSkuSellsPrice: 0,
      });
    }
    this.setData({
      specImg: skuItem && skuItem.skuImage ? skuItem.skuImage : primaryImage,
    });
  },

  // 获取已选择的sku名称
  getSelectedSkuValues(skuTree, selectedSku) {
    const normalizedTree = this.normalizeSkuTree(skuTree);
    return Object.keys(selectedSku).reduce((selectedValues, skuKeyStr) => {
      const skuValues = normalizedTree[skuKeyStr];
      const skuValueId = selectedSku[skuKeyStr];
      if (skuValueId !== '') {
        const skuValue = skuValues.filter((value) => {
          return value.specValueId === skuValueId;
        })[0];
        skuValue && selectedValues.push(skuValue);
      }
      return selectedValues;
    }, []);
  },

  normalizeSkuTree(skuTree) {
    const normalizedTree = {};
    skuTree.forEach((treeItem) => {
      normalizedTree[treeItem.specId] = treeItem.specValueList;
    });
    return normalizedTree;
  },

  selectSpecsName(selectSpecsName) {
    if (selectSpecsName) {
      this.setData({
        selectedAttrStr: selectSpecsName,
      });
    } else {
      this.setData({
        selectedAttrStr: '',
      });
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
  
  onPicked() {
    this.setData({ isAllSelectedSku: true });
  },

  gotoBuy(e) {
    const overCount = () => this.toast('超过购买上限了');
    const buyCount = e.detail.count;
    const skuId = e.detail.pickedSku._id;
    const skuCount = e.detail.pickedSku.count;
    if (buyCount > skuCount) return overCount();

    wx.navigateTo({
      url: `/pages/order/order-confirm/index?${objectToParamString({ type: 'direct', count: buyCount, skuId })}`,
    });
  },

  changeNum(e) {
    this.setData({
      buyNum: e.detail.buyNum,
    });
  },

  closePromotionPopup() {
    this.setData({
      isShowPromotionPop: false,
    });
  },

  promotionChange(e) {
    const { index } = e.detail;
    wx.navigateTo({
      url: `/pages/promotion-detail/index?promotion_id=${index}`,
    });
  },

  showPromotionPopup() {
    this.setData({
      isShowPromotionPop: true,
    });
  },

  async getInfo(spuId) {
    // pics
    // min price
    // spu title
    // attrs => sku => count + price
    // spu detail
    // comment
    const spu = await getSpu(spuId);

    const loadSkus = async () => {
      const skus = await getAllSku(spuId);
      const minPrice = skus.reduce((acc, current) => Math.min(acc, current.price), Infinity) * 100;
      const loadSkuAttrValues = async () => {
        return Promise.all(
          skus.map(async (sku) => {
            const attrValues = await getAllAttrValues(sku._id);
            sku.attrValues = attrValues;
          }),
        );
      };
      const handleSkuImages = async () => {
        const images = skus.map((s) => s.image ?? '');
        const handledImages = await getCloudImageTempUrl(images);
        handledImages.forEach((image, index) => (skus[index].image = image));
      };
      await Promise.all([handleSkuImages(), loadSkuAttrValues()]);
      return { skus, minPrice };
    };

    const [_x, { skus, minPrice }, commentInfo] = await Promise.all([
      handleSpuCloudImage(spu),
      loadSkus(),
      getGoodsDetailCommentInfo(spu._id),
    ]);

    const [
      {
        data: { records, total: commentCount },
      },
      {
        data: { total: goodCommentCount },
      },
    ] = commentInfo;

    // records.forEach((x) => (x.userNameString = x.createBy.substring(0, 10)));
    for(const x of records){
        let url = await getSingleCloudImageTempUrl(x.purchaser.avatarUrl);
        x.url = url;
    }
    const detail = await replaceCloudImageWithTempUrl(spu.detail);
    this.setData({
      details: {
        images: spu.swiper_images,
        title: spu.name,
      },
      minSalePrice: minPrice,
      detail,
      descPopUpInitProps: {
        skus,
        minPrice,
        spu,
      },
      commentsStatistics: {
        commentCount,
        goodRate: (goodCommentCount / commentCount) * 100,
      },
      spu,
      commentsList: records,
    });
  },

  /** 跳转到评价列表 */
  navToCommentsListPage() {
    wx.navigateTo({
      url: `/pages/goods/comments/index?spuId=${this.data.spu._id}`,
    });
  },

  async onLoad(query) {
    const { spuId } = query;
    this.setLoading();
    try {
      await this.getInfo(spuId);
    } catch (e) {
      console.error(e);
      this.toast('获取商品详情失败');
    } finally {
      this.unsetLoading();
    }
  },
});
