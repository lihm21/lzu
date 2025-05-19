// pages/home/search/index.js
const HISTORY_KEY = 'searchHistory';
const MAX_HISTORY = 12;

Page({
  data: {
    keyword: '',
    showResult: false,
    hotTopics: ['父母', '子女', '沟通', '尊重', '姐妹', '爸爸', '妈妈'],
    searchHistory: [],
    searchResults: []
  },
  onLoad(options) {
    this.loadSearchHistory();
  },
  // 加载搜索历史
  loadSearchHistory() {
    const history = wx.getStorageSync(HISTORY_KEY) || [];
    this.setData({ searchHistory: history });
  },
  // 保存搜索记录
  saveSearchHistory(keyword) {
    let history = wx.getStorageSync(HISTORY_KEY) || [];
    history = [keyword, ...history.filter(item => item !== keyword)];
    history = history.slice(0, MAX_HISTORY);
    wx.setStorageSync(HISTORY_KEY, history);
    this.setData({ searchHistory: history });
  },
  onInput(e) {
    this.setData({ keyword: e.detail.value.trim() });
  },
  clearKeyword() {
    this.setData({ keyword: '', showResult: false });
  },
  // 搜索
  async handleSearch() {
    const keyword = this.data.keyword;
    if (!keyword) return;
    this.saveSearchHistory(keyword);
    wx.showLoading({ title: '搜索中...' });
    
    try {
        const db = wx.cloud.database();
        const res = await db.collection('posts')
            .where({
                title: db.RegExp({
                    regexp: keyword,
                    options: 'i'
                })
            })
            .get();

        this.setData({
            searchResults: res.data,
            showResult: true
        });
    } catch (err) {
        console.error('搜索失败:', err);
        wx.showToast({ title: '搜索失败', icon: 'none' });
    }
    wx.hideLoading();
  },
  // 搜索历史点击
  searchHistory(e) {
    const text = e.currentTarget.dataset.text;
    this.setData({ keyword: text }, () => {
        this.handleSearch();
    });
  },
  // 热门话题点击
  searchTopic(e) {
    const text = e.currentTarget.dataset.text;
    this.setData({ keyword: text }, () => {
        this.handleSearch();
    });
  },
  // 删除单个历史
  removeHistory(e) {
    const index = e.currentTarget.dataset.index;
    const history = [...this.data.searchHistory];
    history.splice(index, 1);
    wx.setStorageSync(HISTORY_KEY, history);
    this.setData({ searchHistory: history });
  },
  // 清空历史
  clearHistory() {
    wx.removeStorageSync(HISTORY_KEY);
    this.setData({ searchHistory: [] });
  },
  // 跳转详情
  navigateToDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
        url: `/pages/community/topic/detail/index?postId=${id}`
    });
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