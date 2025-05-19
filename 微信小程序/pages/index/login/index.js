// pages/index/login/index.js
const app = getApp();

Page({
  data: {
    account: '',
    password: ''
  },
  onLoad(options) {

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
  // 登录处理
  handleLoginClick(e) {
    const { account, password } = this.data;
    if (!account || !password) {
        return wx.showToast({ title: '请填写完整账号和密码', icon: 'none' })
    }
    // 数据库查询
    const db = wx.cloud.database();
    db.collection('users').where({
        account: account
    })
    .get()
    .then(res => {
        if(res.data.length === 0) {
            throw new Error('账号不存在')
        }
        const user = res.data[0];
        if(user.password !== password) {
            throw new Error('密码错误')
        }

        // 登录成功
        wx.showToast({
          title: '登录成功',
          icon: 'success',
          success: () => {
            app.globalData.isLogin = true;
            wx.setStorageSync('userInfo', user);
            wx.switchTab({
              url: '../../home/index',
            })
          }
        })
    })
    .catch( err => {
        wx.showToast({
            title: err.message,
            icon: 'none',
            duration: 2000
        })
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