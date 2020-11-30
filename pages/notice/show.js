const app = getApp();
Page({
  data: {
  
  },
  onLoad: function (options) {
    var that = this;
    var _id = options.id
    wx.cloud.callFunction({
      name: 'GetItemById',
      data: {
        collectionName:"notice",
        id:_id
      }
    }).then(res=>{
      that.setData({
        notice: res.result
      });
    })

  },
  onShareAppMessage() {
  },
})