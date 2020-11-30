// pages/transfer-manage/editAddress.js


Page({

  /**
   * 页面的初始数据
   */
  data: {
    areaList : [],
    transferEntity:{},
    show: false,
    linkman:"",
    mobile:"",
    provinceName:"",
    city:"",
    area:"",
    address:"",
    addressTemp:"",
    postCode:"",
    company:"",
    remark:""
  },
  showPopup() {
    this.setData({ show: true });
  },
  confirmSelectArea(e){
    let _this = this
    if(e.detail!=undefined && e.detail.values!=undefined && e.detail.values.length>0){
      let areaValues = e.detail.values
      let addressTemp = areaValues[0].name + areaValues[1].name+areaValues[2].name
      _this.setData({
        provinceName:areaValues[0].name,
        city:areaValues[1].name,
        area:areaValues[2].name,
        postCode: areaValues[2].code,
        addressTemp:addressTemp
      })
      _this.setData({ show: false });
    }

  },
  onClose() {
    this.setData({ show: false });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '加载中',
    })
    let _this = this
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
          addressTemp:res.result[0].provinceName+res.result[0].city+res.result[0].area,
        })
        wx.hideLoading({
          success: (res) => {},
        })
      })
    })
  },
  linkManInputChange(e){
    let that = this;
    if (e.detail.value.length >= 1) {
      that.setData({
        linkman: e.detail.value,
      })
    }
  },
  companyInputChange(e){
    let that = this;
    if (e.detail.value.length >= 1) {
      that.setData({
        company: e.detail.value,
      })
    }
  },
  addressInputChange(e){
    let that = this;
    if (e.detail.value.length >= 1) {
      that.setData({
        address: e.detail.value,
      })
    }
  },
  mobileInputChange(e){
    let that = this;
    if (e.detail.value.length >= 1) {
      that.setData({
        mobile: e.detail.value,
      })
    }
  },
  remarkInputChange(e){
    let that = this;
    if (e.detail.value.length >= 1) {
      that.setData({
        remark: e.detail.value,
      })
    }
  },
  bindSubmit(e){

    let entity = {
      linkman:this.data.linkman,
      mobile:this.data.mobile,
      provinceName:this.data.provinceName,
      city:this.data.city,
      area:this.data.area,
      address:this.data.address,
      postCode:this.data.postCode,
      company:this.data.company,
    }
    wx.cloud.callFunction({
      name: 'EditItem',
      data: {
        collectionName: "transfer",
        _id: this.data.transferEntity._id,
        item: entity
      }
    }).then(res => {
      wx.showToast({
        title: '更新成功',
        icon: 'success',
        success:function(){
          wx.reLaunch({
            url: '/pages/transfer-manage/editAddress',
          })
        }
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