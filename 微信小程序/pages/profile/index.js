// pages/profile/index.js
const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'
const app = getApp();

Page({
  data: {
    userInfo: {
        avatarUrl: defaultAvatarUrl,
        nickName: '未设置昵称'
    },
  },
  async onLoad(options) {
    await this.loadUserInfo();
  },
  async loadUserInfo() {
    if(!app.globalData.isLogin) {
        wx.showToast({ title: '请先登录', icon: 'none' });
        return;
    }
    const db = wx.cloud.database();
    const res = await db.collection('users').where({account : wx.getStorageSync('userInfo').account}).get();
    this.setData({
        'userInfo.avatarUrl' : res.data[0].avatarUrl,
        'userInfo.nickName' : res.data[0].nickname
    })
  },
  // 点击
  handleLikeClick(e) {
    wx.navigateTo({
      url: './like/index',
    })
  },
  handleDislikeClick(e) {
    wx.navigateTo({
      url: './dislike/index',
    })
  },
  handleViewClick(e) {
    wx.navigateTo({
      url: './view/index',
    })
  },
  async changeAvatar() {
    if(!app.globalData.isLogin) {
        wx.showToast({ title: '请先登录', icon: 'none' });
        return;
    }
    wx.chooseMedia({
        count: 1,
        mediaType: ['image'],
        sourceType: ['album', 'camera'],
        success: async (res) => {
            const tempFilePath = res.tempFiles[0].tempFilePath;
            
            wx.showLoading({ 
                title: '上传中...',
                mask: true
            });

            try {
                const cloudPath = `user-avatar/${Date.now()}-${Math.random().toString(36).substr(2, 6)}.jpg`;
                const uploadRes = await wx.cloud.uploadFile({
                    cloudPath,
                    filePath: tempFilePath
                });
                this.setData({
                    'userInfo.avatarUrl': uploadRes.fileID
                });
                const db = wx.cloud.database();
                await db.collection('users').where({ _id : wx.getStorageSync('userInfo')._id }).update({
                    data: {
                        avatarUrl: uploadRes.fileID
                    }
                });
                wx.showToast({
                    title: '头像更新成功',
                    icon: 'success'
                });
            } catch (err) {
                console.error('头像更新失败:', err);
                wx.showToast({
                    title: '更新失败，请重试',
                    icon: 'none'
                });
            } finally {
                wx.hideLoading();
            }
        },
        fail : (err) => {
            console.error('选择图片失败:', err);
            wx.showToast({
                title: '选择图片失败',
                icon: 'none'
            });
        }
    })
  },
  changeNickname() {
    if(!app.globalData.isLogin) {
        wx.showToast({ title: '请先登录', icon: 'none' });
        return;
    }
    wx.showModal({
        title: '修改昵称',
        content: '请输入新昵称',
        editable: true,
        success: res => {
            if (res.confirm && res.content) {
                this.setData({
                    'userInfo.nickName': res.content
                });
                this.saveUserInfo();
            }
        }
    })
  },
  // 保存用户信息
  async saveUserInfo() {
    const db = wx.cloud.database();
    console.log(wx.getStorageSync('userInfo').account);
    const res = await db.collection('users')
        .where({_id : wx.getStorageSync('userInfo')._id})
        .update({
            data : {
                nickname : this.data.userInfo.nickName
            }
        })
    wx.showToast({
        title: '保存成功',
        icon: 'success'
    });
  },
  // 退出登录确认
  showLogoutConfirm() {
    wx.showModal({
        title: '确认退出',
        content: '确定要退出当前账号吗？',
        success: res => {
            if (res.confirm) {
                wx.removeStorageSync('userInfo');
                wx.reLaunch({
                    url: '/pages/index/index'
                });
            }
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