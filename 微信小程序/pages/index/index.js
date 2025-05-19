// index.js
const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'

const app = getApp();

Page({
  data: {
    
  },
  onLoad: function (options) {
    const userInfo = wx.getStorageSync('userInfo');
    if(userInfo._id) {
        app.globalData.isLogin = true;
        wx.switchTab({
            url: '../home/index',
        })
    }
  },
  // 注册
  handleRegisteClick(e) {
      // 跳转注册
      wx.navigateTo({
        url: './registe/index',
      })
  },
  // 登录
  handleLoginClick(e) {
    wx.navigateTo({
      url: './login/index',
    })
  },
  // 游客登录
  handleNoIdClick(e) {
    wx.removeStorageSync('userInfo');
    wx.switchTab({
      url: '../home/index',
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    
  }
})