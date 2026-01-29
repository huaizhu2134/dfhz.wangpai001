import { updateUser } from '../../../services/usercenter/user';
Page({
  data: {
    nameValue: '',
    uid:'',
    selected:'',
    config: [
        {
          label: '昵称',
          des: '最多可输15个字',
          input_type:'nickname',
          key:'nickName'
        },
        {
          label: '手机号',
          des: '请输入11位手机号',
          input_type:'',
          key:'phoneNumber'
        },
        {
            label: '微信号',
            des: '请输入微信号',
            input_type:'',
            key:'wx_account'
          },
      ],
  },
  onLoad(options) {
    const { name,uid,type} = options;
    console.log(name,"-",uid);
    this.setData({
      nameValue: name,
      uid:uid,
      selected:type
    });
  },
  async onSubmit() {
    wx.showToast({
        title: "保存中",
        icon: 'loading',
        mask: true,
        duration: 20000
    });
      
    const uid = this.data.uid;
    const name = this.data.nameValue;
    const field = this.data.config[this.data.selected].key;

    // const user =  await updateUser();
    console.log('name',name);
    console.log('field',field);
    const res = await updateUser({
        uid,
        data:{
            [field]: name
        },
      });
    console.log("up-res",res);
    wx.hideToast();
    if(typeof(res.openId)!='undefined'){
        wx.showToast({
            title: '修改成功',
            icon: 'success',
            duration: 1500
          }).then(() => {
            wx.navigateBack({ backRefresh: true });
          });
    }else{
        wx.showToast({
            title: '修改失败',
            icon: 'none',
            duration: 1500
          })
    }
    // 
  },
  clearContent() {
    this.setData({
      nameValue: '',
    });
  },
});
