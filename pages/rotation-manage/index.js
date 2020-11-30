Page({

  /**
   * 页面的初始数据
   */
  data: {
    rotationList:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    wx.cloud.callFunction({
      name: 'GetCollection',
      data: {
        collectionName: 'rotation'
      }
    }).then(res=>{
      that.setData({
        rotationList: res.result
      });
    })

  },
  onShow: function () {

  },
  addClick(e){
    wx.navigateTo({
      url: '/pages/rotation-manage/add',
    })
  }
})