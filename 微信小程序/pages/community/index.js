// pages/community/index.js
Page({
  data: {
    categories: [
        {
          id: 1,
          name: '亲子',
          color: '#7BC86C',
          icon: '../../assets/images/community/亲子.png'
        },
        {
          id: 2,
          name: '情侣',
          color: '#FF6B6B',
          icon: '../../assets/images/community/情侣.png'
        },
        {
          id: 3,
          name: '师生',
          color: '#4ECDC4',
          icon: '../../assets/images/community/师生.png'
        },
        {
          id: 4,
          name: '兄妹',
          color: '#FF9F40',
          icon: '../../assets/images/community/兄妹.png'
        },
        {
          id: 5,
          name: '婆媳',
          color: '#AC92EB',
          icon: '../../assets/images/community/婆媳.png'
        },
        {
          id: 6,
          name: '其他',
          color: '#5D9CEC',
          icon: '../../assets/images/community/其他.png'
        },
    ],
    identities: [
        {
            id: 1,
            sections: ['家长', '孩子']
        },
        {
            id: 2,
            sections: ['男方', '女方']
        },
        {
            id: 3,
            sections: ['学生', '老师']
        },
        {
            id: 4,
            sections: ['brother', 'sister']
        },
        {
            id: 5,
            sections: ['婆婆', '儿媳']
        }
    ]
  },
  onLoad(options) {

  },
  navigateToCategory(e) {
    const topic_id = e.currentTarget.dataset.id;
    const identity = this.data.identities.find(item => item.id === topic_id);

    if(identity) {
        wx.showActionSheet({
          itemList: identity.sections,
          success: (res) => {
              const selectedIdentity = identity.sections[res.tapIndex];
              wx.navigateTo({
                url: `./topic/index?id=${topic_id}&identity=${selectedIdentity}`,
              })
          }
        })
    }else {
        wx.navigateTo({
            url: `./topic/index?id=${topic_id}&identity=其他`,
        })
    }
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