const app = getApp();
Page({
  data: {
    name: ""
  },
  onLoad: function (options) {

  },
  submitSpecs() {
    var itemData = {
      name: this.data.name
    }
    wx.cloud.callFunction({
      name: 'AddItem',
      data: {
        collectionName: "specs",
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