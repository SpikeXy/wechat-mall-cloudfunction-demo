const app = getApp();
Page({
  data: {
    name: "",
    _id:""
  },
  onLoad: function (options) {
    var _id=options.id
    this.setData({
      parentId : _id
    })
  },
  submitSpecs() {
    var itemData = {
      name: this.data.name,
      parentId:this.data.parentId
    }
    wx.cloud.callFunction({
      name: 'AddItem',
      data: {
        collectionName: "specsModel",
        item: itemData
      }
    }).then(res => {
      wx.reLaunch({
        url: '/pages/specs-manage/index'
      })
    })
  },

  nameInputChange(e) {
    let that = this;
    if (e.detail.value.length >= 1) {
      that.setData({
        name: e.detail.value,
      })
    }
  }
})