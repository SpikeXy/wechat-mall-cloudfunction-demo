const app = getApp();
Page({
  data: {
    title:"",
    content:"",
    _id:""
  },
  onLoad: function (options) {
    var that = this;
    var _id = options.id
    this.setData({
      _id:_id
    })
    wx.cloud.callFunction({
      name: 'GetItemById',
      data: {
        collectionName:"notice",
        id:_id
      }
    }).then(res=>{
      that.setData({
        title: res.result.title,
        content: res.result.content
      });
    })

  },
  submitNotice(){
    var updateEntity = {
      title:this.data.title,
      content:this.data.content
    }
    wx.cloud.callFunction({
      name: 'EditItem',
      data: {
        _id: this.data._id,
        collectionName:"notice",
        item:updateEntity
      }
    }).then(res=>{
      wx.navigateBack({
        delta: 0,
      })
    })
  },
  textAreaChange(e){
    let that = this;
    if (e.detail.value.length >= 1) {
      that.setData({
        content: e.detail.value,
      })
    }
  },
  titleInputChange(e){
    let that = this;
    if (e.detail.value.length >= 1) {
      that.setData({
        title: e.detail.value,
      })
    }
  },
  deleteNotice(e){
    wx.cloud.callFunction({
      name: 'DeleteItemById',
      data: {
        collectionName:"notice",
        _id: this.data._id
      }
    }).then(res => {
      wx.reLaunch({
        url: '/pages/notice-manage/index'
      })
    })
  }
})