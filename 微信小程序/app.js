// app.js
App({
  globalData : {
    isLogin: false,
  },
  onLaunch() {
      wx.cloud.init({
        env: "zuo-lun-8guuneu9f5e754bf"
      })
  }
})
