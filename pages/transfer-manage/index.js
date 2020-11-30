// pages/transfer-manage/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    transferEnterpriseInfo:[],
    transferEntity:{},
    show: false,
    linkman:"",
    mobile:"",
    provinceName:"",
    city:"",
    area:"",
    address:"",
    addressTemp:"",
    remark:"",
    postCode:"",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '加载中',
    })
    var _this = this
    wx.cloud.callFunction({
      name: 'GetTransferAccount',
      data: {
      }
    }).then(res=>{
      _this.setData({
        transferEnterpriseInfo: res.result.list
      })
    })
  
    wx.cloud.callFunction({
      name: 'GetCollection',
      data: {
        collectionName: "region"
      }
    }).then(res=>{
      _this.setData({
        areaList : res.result[0]
      })
      wx.cloud.callFunction({
        name: 'GetCollection',
        data: {
          collectionName: "transfer"
        }
      }).then(res=>{
        _this.setData({
          transferEntity : res.result[0],
          linkman:res.result[0].linkman,
          mobile:res.result[0].mobile,
          provinceName:res.result[0].provinceName,
          city:res.result[0].city,
          area:res.result[0].area,
          address:res.result[0].address,
          remark:res.result[0].remark,
          addressTemp:res.result[0].provinceName+res.result[0].city+res.result[0].area,
        })
        wx.hideLoading({
          success: (res) => {},
        })
      })
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})