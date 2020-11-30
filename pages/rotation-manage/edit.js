const app = getApp();
Page({
  data: {
    title:"",
    _id:"",
    fileList:[]
  },
  onLoad: function (options) {
    var _this = this;
    var _id = options.id
    this.setData({
      _id:_id
    })
    wx.cloud.callFunction({
      name: 'GetItemById',
      data: {
        collectionName:"rotation",
        id:_id
      }
    }).then(res=>{
      const path = res.result.picUrl;
      const fileNameTemp = path.substr(String(path).lastIndexOf('/') + 1)
      const fileSuffix = fileNameTemp.substr(fileNameTemp.lastIndexOf('.'))
      const dateTimeFileName = "good-image/" + (new Date().getFullYear()) + (new Date().getMonth()) + (new Date().getDay()) + String(parseInt(Math.random() * 1000000000)) + fileSuffix
      let imageFileTemp= {}
      imageFileTemp.name = dateTimeFileName
      imageFileTemp.isImage = true
      imageFileTemp.deletable = true
      imageFileTemp.url = res.result.picUrl
      _this.data.fileList.push(imageFileTemp);
      _this.setData({
        title: res.result.title,
        fileList : _this.data.fileList
      });
    })

  },
  deleteContent(e){
    wx.cloud.callFunction({
      name: 'DeleteItemById',
      data: {
        collectionName:"rotation",
        _id: this.data._id
      }
    }).then(res => {
      wx.reLaunch({
        url: '/pages/rotation-manage/index'
      })
    })
  },
  submitContent(){
    let picUrlTemp = this.data.fileList[0]
    var updateEntity = {
      title:this.data.title,
      picUrl:picUrlTemp
    }
    wx.cloud.callFunction({
      name: 'EditItem',
      data: {
        _id: this.data._id,
        collectionName:"rotation",
        item:updateEntity
      }
    }).then(res=>{
      wx.reLaunch({
        url: '/pages/rotation-manage/index',
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
        collectionName:"rotation",
        _id: this.data._id
      }
    }).then(res => {
      wx.reLaunch({
        url: '/pages/rotation-manage/index'
      })
    })
  }
})