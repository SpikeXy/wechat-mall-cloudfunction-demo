Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    wx.cloud.callFunction({
      name: 'GetNotice',
      data: {}
    }).then(res=>{
      that.setData({
        noticeList: res.result.dataList
      });
    })

  },
  onShow: function () {

  },
})