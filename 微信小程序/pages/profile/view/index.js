// pages/profile/like/index.js
Page({
    data: {
      posts: [],
      loading: true,
      page: 1,
      pageSize: 10,
      hasMore: true
    },
    onLoad(options) {
      this.loadPosts();
    },
    async loadPosts() {
      const db = wx.cloud.database();
      const userId = wx.getStorageSync('userInfo')._id;
      
      const res = await db.collection('viewRecords').where({ 
          authorId : userId }).get();
      if(res.data.length > 0) {
          const promises = await res.data.map(async (item) => {
              const user = await db.collection('users').where({ _id : item.authorId }).get();
              const post = await db.collection('posts').where({_id : item.postId}).get();
              return Object.assign(item, { user: user.data[0] }, {post: post.data[0]} );
          });
          const posts = await Promise.all(promises);
          this.setData({
              posts: posts
          })
      }
    },
    onReachBottom() {
      if (this.data.hasMore) {
          this.setData({ page: this.data.page + 1 }, () => {
              this.loadPosts();
          });
      }
    },
    // 点击帖子跳转
    async handlePostItemClick(e) {
      // 浏览量+1
      const index = e.currentTarget.dataset.index;
      const postId = this.data.posts[index].post._id;
      console.log(postId);
      const db = wx.cloud.database();
      await db.collection('posts').doc(postId)
          .update({
              data: {
                  viewCount: this.data.posts[index].post.viewCount + 1
              }
          })
      const newPostList = await this.data.posts.map((item, i) => {
          if(index === i) {
              const newPost = this.data.posts[index].post;
              newPost.viewCount++;
              return {
                  ...item,
                  post: newPost
              }
          }
          return item;
      });
      this.setData({posts: newPostList});
  
      wx.navigateTo({
        url: `../../community/topic/detail/index?postId=${postId}`,
      })
    },
    // 点赞
    async handleLikeBtnClick(e) {
      const index = e.currentTarget.dataset.index;
      const postId = this.data.posts[index].post._id;
      const authorId = this.data.posts[index].user._id;
      const db = wx.cloud.database();
      const res = await db.collection('viewRecords')
        .where({postId: postId, authorId: wx.getStorageSync('userInfo')._id})
        .get();
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
                        const newPosts = await this.data.posts.map((item, i) => {
                            if(i === index ) {
                                const newPost = item.post.likeCount + 1;
                                return {
                                    ...item,
                                    post: newPost,
                                    isLiked: true,
                                    isDisLiked: false
                                }
                            }
                            return item;
                        });
                        this.setData({
                            posts: newPosts
                        })
                    }
                })
        }else{
            // 修改本地数据
            const viewRecord = res.data[0];
            const newPosts = await this.data.posts.map((item, i) => {
                if( i === index ){ 
                    const newPost = item.post;
                    newPost.likeCount += (viewRecord.isLiked ? -1 : 1);
                    newPost.dislikeCount += (viewRecord.isDisLiked ? -1 : 0);
                    return {
                        ...item,
                        post: newPost,
                    }
                }
                return item;
            });
            this.setData({ posts: newPosts });
            const targetPost = this.data.posts[index].post;
            await db.collection('viewRecords')
            .where({
                postId: postId, authorId: wx.getStorageSync('userInfo')._id
            }).update({
                data: {
                    isLiked : !viewRecord.isLiked,
                    isDisLiked: false,
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
    // 拉踩
    async handleDislikeBtnClick(e) {
      const index = e.currentTarget.dataset.index;
      const postId = this.data.posts[index].post._id;
      const authorId = this.data.posts[index].user._id;
      const db = wx.cloud.database();
      const res = await db.collection('viewRecords')
        .where({postId: postId, authorId: authorId})
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
                    const newPosts = await this.data.posts.map((item, i) => {
                        if(i === index ) {
                            const newPost = item.post.dislikeCount + 1;
                            return {
                                ...item,
                                post: newPost,
                                isLiked: false,
                                isDisLiked: true
                            }
                        }
                        return item;
                    });
                    this.setData({
                        posts: newPosts
                    })
                }
            })
    }else{
        // 修改本地数据
        const viewRecord = res.data[0];
        console.log(viewRecord);
        const newPosts = await this.data.posts.map((item, i) => {
            if( i === index ){ 
                const newPost = item.post;
                newPost.likeCount += (viewRecord.isLiked ? -1 : 0);
                newPost.dislikeCount +=  (viewRecord.isDisLiked ? -1 : 1);
                return {
                    ...item,
                    post: newPost,
                }
            }
            return item;
        });
        await this.setData({ posts: newPosts });
        const targetPost = this.data.posts[index].post;
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
});