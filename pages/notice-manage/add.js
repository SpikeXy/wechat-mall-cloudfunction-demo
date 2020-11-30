const app = getApp();
Page({
  data: {
    title: "",
    content: "",
  },
  onLoad: function (options) {

  },
  submitNotice() {
    var itemData = {
      title: this.data.title,
      content: this.data.content
    }
    wx.cloud.callFunction({
      name: 'AddItem',
      data: {
        collectionName: "notice",
        item: itemData
      }
    }).then(res => {
      wx.reLaunch({
        url: '/pages/notice-manage/index'
      })
    })
  },
  textAreaChange(e) {
    let that = this;
    if (e.detail.value.length >= 1) {
      that.setData({
        content: e.detail.value,
      })
    }
  },
  titleInputChange(e) {
    let that = this;
    if (e.detail.value.length >= 1) {
      that.setData({
        title: e.detail.value,
      })
    }
  }
})