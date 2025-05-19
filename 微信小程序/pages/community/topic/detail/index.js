// pages/community/topic/detail/index.js
const app = getApp();
Page({
  data: {
    postDetail: { },
    inputValue: '',
  },
  async onLoad(options) {
    const postId = options.postId
    const db = wx.cloud.database();
    const res = await db.collection('posts').where({_id : postId}).get();
    const user = await db.collection('users').where({ _id : res.data[0].authorId }).get()

    const viewsList = await db.collection('views').where({ postId : postId }).get();
    this.setData({
        postDetail : Object.assign(res.data[0], {
            avatarUrl : user.data[0].avatarUrl,
            nickname: user.data[0].nickname,
        })
    })
    if(viewsList.data[0]) {
        this.setData({
            viewsList: viewsList.data[0].viewsList
        })
    }
    // 存入数据
    if(app.globalData.isLogin) {
        const isExist = await db.collection('viewRecords').where({ postId: postId, authorId : wx.getStorageSync('userInfo')._id }).get();
        if(isExist.data.length <= 0) {
            console.log("存储", postId, wx.getStorageSync('userInfo')._id);
            db.collection('viewRecords').add({
                data : {
                    authorId: wx.getStorageSync('userInfo')._id,
                    postId: postId,
                    isDisliked: false,
                    isLiked: false
                }
            })
        }
    }
  },
  async handleCommitClick(e) {
    if(!app.globalData.isLogin) {
        wx.showToast({ title: '请先登录', icon: 'none' });
        return;
    }
    // 优先判断情感
    const justify_res = await this.justifySentiment() 
    if(justify_res.data.sentiment === -1) {
        wx.showToast({
          title: '注意言论得当，禁止负面评论',
          icon: 'none'
        })
        return ;
    }

    const db = wx.cloud.database();
    const isExist = await db.collection('views').where({postId : this.data.postDetail._id}).get();
    const user = wx.getStorageSync('userInfo') || {}; 
    const newComment = {
        avatarUrl: user.avatarUrl,
        nickname: user.nickname,
        content: this.data.inputValue
    };
    if(isExist.data.length <= 0) {
        db.collection('views').add({
            data : {
                postId : this.data.postDetail._id,
                viewsList: [newComment]
            },
            success: (res) => {
                wx.showToast({ title: '评论成功', icon: 'success' });
                this.setData({
                    viewsList: [newComment],
                    inputValue: ''
                });
            }
        })
    }else{ 
        const viewRecordId = isExist.data[0]._id;
        const newViewsList = [...this.data.viewsList, newComment];
        await db.collection('views').doc(viewRecordId).update({
          data: {
            viewsList: newViewsList
          }
        });
        wx.showToast({ title: '评论成功', icon: 'success' });
        this.setData({
          viewsList: newViewsList,
          inputValue: ''
        });
    }
  },
  async justifySentiment() {
    return new Promise((resolve, reject) => {
        wx.request({
            url: 'http://localhost:5000/analyze',
            method: 'GET',
            data: {
                text: this.data.inputValue
            },
            success: (res) => {
                resolve(res);
            },
            fail: (res) => {
                reject(res);
            }
          })
    })
  },
  handleInputTitle(e) {
    this.setData({
        inputValue: e.detail.value
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