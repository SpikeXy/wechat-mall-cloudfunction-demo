const app = getApp();
Page({
  data: {
    name: "",
    _id: "",
    parentId: ""
  },
  onLoad: function (options) {
    var that = this;
    var _id = options.id
    this.setData({
      _id: _id
    })
    wx.cloud.callFunction({
      name: 'GetItemById',
      data: {
        collectionName: "specsModel",
        _id: _id
      }
    }).then(res => {
      that.setData({
        name: res.result.name,
        parentId: res.result.parentId
      });
    })

  },
  submitSpecs() {
    var _this = this
    var updateEntity = {
      name: this.data.name
    }
    wx.cloud.callFunction({
      name: 'EditItem',
      data: {
        _id: this.data._id,
        item: updateEntity,
        collectionName: "specsModel"
      }
    }).then(res => {
      wx.reLaunch({
        url: '/pages/specs-manage/edit?id=' + _this.data.parentId,
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
  },
  deleteSpecs(e) {
    var _this = this
    wx.cloud.callFunction({
      name: 'DeleteItemById',
      data: {
        _id: this.data._id,
        collectionName: "specsModel"
      }
    }).then(res => {
      wx.reLaunch({
        url: '/pages/specs-manage/edit?id=' + _this.data.parentId,
      })
    })
  }
})