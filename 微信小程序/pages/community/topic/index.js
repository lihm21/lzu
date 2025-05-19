// pages/community/topic/index.js
const app = getApp();
Page({
  data: {
    topic_id: '',
    identity: '',
    isEditing: false,
    form: {
        title: '',
        content: '',
        image: '',
    },
    postList: []
  },
  async onLoad(options) {
    const topic_id = options.id;
    const identity = options.identity;
    this.setData({
        topic_id: topic_id,
        identity: identity
    });
    await this.refreshPostList();
  },
  // 添加
  handleAddPostBtnClick(e) {
    if(!app.globalData.isLogin) {
        wx.showToast({ title: '请先登录', icon: 'none' });
        return;
    }
    this.setData({
        isEditing: true
    })
  },
  // 取消
  handleCancelEdit() {
    this.setData({ 
      isEditing: false,
      form: {
        title: '',
        content: '',
        images: []
      }
    })
  },
  // 添加图片
  handleAddImage() {
    wx.chooseMedia({
      count: 1, 
      mediaType: ['image'],
      success: res => {
        this.setData({
          'form.image': res.tempFiles[0].tempFilePath 
        })
      }
    })
  },
  //删除 图片
  handleDeleteImage(e) {
    this.setData({
        'form.image': ''
    })
  },
  handleInputTitle(e) {
    this.setData({
      'form.title': e.detail.value
    })
  },
  handleInputContent(e) {
    this.setData({
      'form.content': e.detail.value
    })
  },
  // 发布
  handleSubmit(e) {
    const { title, content, image } = this.data.form;
    if (!title.trim()) return wx.showToast({ title: '请输入标题', icon: 'none' })
    if (!content.trim()) return wx.showToast({ title: '请输入内容', icon: 'none' })
    if (!image.trim()) return wx.showToast({ title: '请添加图片', icon: 'none' });

    wx.showLoading({ title: '发布中...' })
    
    this.uploadImage(image)
    .then(cloudPath => this.createPost(title, content, cloudPath))
    .then(() => {
        wx.hideLoading();
        wx.showToast({ title: '发布成功' });
        this.handleCancelEdit();
        this.refreshPostList();
    })
    .catch(err => {
        console.error('发布失败:', err)
        wx.hideLoading()
        wx.showToast({ title: '发布失败，请重试', icon: 'none' })
    })
  },
  async uploadImage(tempFilePath) {
    if (!tempFilePath) return Promise.resolve('')
    
    const cloudPath = `posts/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.jpg`
    
    return wx.cloud.uploadFile({
      cloudPath,
      filePath: tempFilePath
    }).then(res => res.fileID)
  },
  async createPost(title, content, imageUrl) {    
    const user = wx.getStorageSync('userInfo') || {}
    if( !user ) {
      wx.showToast({ title: '发布失败，请重试', icon: 'none' });
      return ;
    }
    const db = wx.cloud.database();
    return db.collection('posts').add({
      data: {
        topic_id: this.data.topic_id,
        title,
        content,
        image: imageUrl ? [imageUrl] : [],
        authorId: user._id,
        viewCount: 0,
        likeCount: 0,
        dislikeCount: 0,
        createTime: db.serverDate()
      }
    })
  },
  async refreshPostList() {
    const db = wx.cloud.database();
    const _ = db.command;

    const res = await db.collection('posts')
      .where({topic_id: this.data.topic_id})
      .orderBy('createTime', 'desc')
      .get();
    const promises = await res.data.map( async(item) =>{
        const user = await db.collection('users')
        .where({ _id: item.authorId })
        .get()
        return Object.assign(item, { 
            nickname : user.data[0].nickname,
            avatarUrl : user.data[0].avatarUrl})
    });
    const data = await Promise.all(promises);
    this.setData({
      postList: data
    })
  },
  // 点赞
  async handleLikeBtnClick(e) {
    if(!app.globalData.isLogin) {
        wx.showToast({ title: '请先登录', icon: 'none' });
        return;
    }
    const index = e.currentTarget.dataset.index;
    const postId = this.data.postList[index]._id;
    const authorId = this.data.postList[index].authorId;
    const db = wx.cloud.database();
    // 查询
    const res = await db.collection('viewRecords')
        .where({postId: postId, authorId: wx.getStorageSync('userInfo')._id})
        .get()
    if(res.data <= 0){
        await db.collection('viewRecords')
            .add({
                data: {
                    postId,
                    authorId: wx.getStorageSync('userInfo')._id,
                    isLiked: true,
                    isDisLiked: false,
                },
                success: async (res) => {
                    await db.collection('posts').doc(postId).update({
                        data: {
                            likeCount: db.command.inc(1),
                        }
                    })
                    // 修改数据
                    const newPostList = await this.data.postList.map((item, i) => {
                        if(i === index ) {
                            const newCount = item.likeCount + 1;
                            return {
                                ...item,
                                likeCount: newCount,
                                isLiked: true,
                                isDisLiked: false
                            }
                        }
                        return item;
                    });
                    console.log(newPostList);
                    this.setData({
                        postList: newPostList
                    })
                }
            })
    }else{
        // 修改本地数据
        const viewRecord = res.data[0];
        const newPostList = await this.data.postList.map((item, i) => {
            if( i === index ){ 
                const newLikeCount = item.likeCount + (viewRecord.isLiked ? -1 : 1);
                const newDisLikeCount = item.dislikeCount + (viewRecord.isDisLiked ? -1 : 0);
                return {
                    ...item,
                    likeCount: newLikeCount,
                    dislikeCount: newDisLikeCount
                }
            }
            return item;
        });
        await this.setData({ postList: newPostList });
        const targetPost = this.data.postList[index];
        await db.collection('viewRecords')
        .where({
            postId: postId, authorId: wx.getStorageSync('userInfo')._id
        }).update({
            data: {
                isLiked : !viewRecord.isLiked,
                isDisLiked: false,
            }
        });
        try {
            const res3 = await db.collection('posts').doc(postId).update({
                data: {
                    likeCount: targetPost.likeCount,
                    dislikeCount: targetPost.dislikeCount
                },
                success(res) {
                    console.log(res);
                },
                fail(res) {
                    console.log(res);
                }
            });
            console.log(res3);
        } catch(err) {
            console.log(err);
        }
    }
  },
  // 拉踩
  async handleDislikeBtnClick(e) {
    if(!app.globalData.isLogin) {
        wx.showToast({ title: '请先登录', icon: 'none' });
        return;
    }
    const index = e.currentTarget.dataset.index;
    const postId = this.data.postList[index]._id;
    const authorId = this.data.postList[index].authorId;
    const db = wx.cloud.database();
    // 查询
    const res = await db.collection('viewRecords')
        .where({postId: postId, authorId: wx.getStorageSync('userInfo')._id})
        .get()
    if(res.data <= 0){
        await db.collection('viewRecords')
            .add({
                data: {
                    postId,
                    authorId: wx.getStorageSync('userInfo')._id,
                    isLiked: false,
                    isDisLiked: true,
                },
                success: async (res) => {
                    await db.collection('posts').doc(postId).update({
                        data: {
                            dislikeCount: db.command.inc(1),
                        }
                    })
                    // 修改数据
                    const newPostList = await this.data.postList.map((item, i) => {
                        if(i === index ) {
                            const newCount = item.likeCount + 1;
                            return {
                                ...item,
                                dislikeCount: newCount,
                                isLiked: false,
                                isDisLiked: true
                            }
                        }
                        return item;
                    });
                    this.setData({
                        postList: newPostList
                    })
                }
            })
    }else{
        // 修改本地数据
        const viewRecord = res.data[0];
        const newPostList = await this.data.postList.map((item, i) => {
            if( i === index ){ 
                const newLikeCount = item.likeCount + (viewRecord.isLiked ? -1 : 0);
                const newDisLikeCount = item.dislikeCount + (viewRecord.isDisLiked ? -1 : 1);
                return {
                    ...item,
                    likeCount: newLikeCount,
                    dislikeCount: newDisLikeCount
                }
            }
            return item;
        });
        await this.setData({ postList: newPostList });
        const targetPost = this.data.postList[index];
        await db.collection('viewRecords')
        .where({
            postId: postId, authorId: wx.getStorageSync('userInfo')._id
        }).update({
            data: {
                isLiked : false,
                isDisLiked: !viewRecord.isDisLiked,
            }
        });
        await db.collection('posts').doc(postId)
            .update({
                data: {
                    likeCount: targetPost.likeCount,
                    dislikeCount: targetPost.dislikeCount
                }
            });
    }
  },
  // 点击帖子跳转
  async handlePostItemClick(e) {
    // 浏览量+1
    const index = e.currentTarget.dataset.index;
    const postId = this.data.postList[index]._id;
    const db = wx.cloud.database();
    await db.collection('posts').doc(postId)
        .update({
            data: {
                viewCount: this.data.postList[index].viewCount + 1
            }
        })
    const newPostList = await this.data.postList.map((item, i) => {
        if( index === i) {
            return {
                ...item,
                viewCount: this.data.postList[index].viewCount + 1
            }
        }
        return item;
    })
    this.setData({postList: newPostList})

    wx.navigateTo({
      url: `./detail/index?postId=${postId}`,
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