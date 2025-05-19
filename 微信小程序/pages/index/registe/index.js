// pages/index/registe/index.js
const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'

Page({
  data: {
    nickname: '',
    account: '',
    password: '',
    comfirmPassword: '',
  },
  onLoad(options) {

  },
  // 输入值绑定
  handleNicknameInput(e) {
      this.setData({
          nickname: e.detail.value
      })
  },
  handleAccountInput(e) {
    this.setData({
        account: e.detail.value
    })
  },
  handlePasswordInput(e) {
    this.setData({
        password: e.detail.value
    })
  },
  handleComfirmPasswordInput(e) {
    this.setData({
        comfirmPassword: e.detail.value
    })
  },
  // 注册处理
  handleRegisteClick(e) {
    const { nickname, account, password, comfirmPassword } = this.data;
    if (!nickname || !account || !password) {
        return wx.showToast({ title: '请填写完整信息', icon: 'none' })
    }
    if (password !== comfirmPassword) {
        return wx.showToast({ title: '两次输入的密码不一致，请重新输入', icon: 'none' });
    }
    // 数据库存储
    const db = wx.cloud.database();
    db.collection('users').add({
        data: {
            nickname,
            account,
            password,
            avatarUrl: defaultAvatarUrl,
            createTime: db.serverDate()
        },
        success: (res) => {
            wx.showToast({ title: '注册成功', icon: "success" });
            setTimeout(() => {
                wx.navigateTo({ url: '../index' });
            }, 1500);
        },
        fail: (res) => {
            console.log('注册失败', res)
            wx.showToast({ title: '注册失败，请重试', icon: 'none' })
        }
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})