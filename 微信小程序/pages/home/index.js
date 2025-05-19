// pages/home/index.js
const app = getApp();
Page({
  data: {
    banners: [
        {
            id: 1,
            imageUrl: '../../assets/images/home/b1.png',
            link: '/pages/detail/banner1'
        },
        {
            id: 2,
            imageUrl: '../../assets/images/home/b2.png',
            link: '/pages/detail/banner2'
        },
        {
            id: 3,
            imageUrl: '../../assets/images/home/b3.png',
            link: '/pages/detail/banner3'
        },
        {
            id: 4,
            imageUrl: '../../assets/images/home/b4.png',
            link: '/pages/detail/banner4'
        },
    ],
    hotPostsList: [

    ]
  },
  async onLoad(options) {
      console.log("登录", app.globalData.isLogin);
    const db = wx.cloud.database();
    const res = await db.collection('posts').orderBy('viewCount', 'desc')
    .limit(6).get();
    const promises = await res.data.map(async (item) => {
        const user = await db.collection('users').where({_id : item.authorId}).get();
        return Object.assign(item, {
            avatarUrl : user.data[0].avatarUrl,
            nickname: user.data[0].nickname
        })
    })
    const hotPostsList = await Promise.all(promises);
    this.setData({
        hotPostsList: hotPostsList
    })
  },
  goSearch(e) {
    wx.navigateTo({
      url: './search/index',
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