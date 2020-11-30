Page({

  /**
   * 页面的初始数据
   */
  data: {
    specs:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    wx.cloud.callFunction({
      name: 'GetCollection',
      data: {
        collectionName:"specs"
      }
    }).then(res=>{
      that.setData({
        specs: res.result
      });
    })

  },
  onShow: function () {

  },
  addClick(){
    wx.navigateTo({
      url: '/pages/specs-manage/add',
    })
  }
  
})