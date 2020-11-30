const app = getApp();
Page({
  data: {
    title: "",
    fileList:[]
  },
  onLoad: function (options) {

  },
  submitNotice() {
    wx.showLoading({
      title: '开始新增',
    })
    let fileUrlList = []
    if(this.data.fileList.length>0){
      this.data.fileList.forEach(ele=>{
        fileUrlList.push(ele.url)
      })
    }
    var itemData = {
      title: this.data.title,
      picUrl: fileUrlList[0]
    }
    wx.cloud.callFunction({
      name: 'AddItem',
      data: {
        collectionName: "rotation",
        item: itemData
      }
    }).then(res => {
      wx.hideLoading({
        success: (res) => {
          wx.reLaunch({
            url: '/pages/rotation-manage/index'
          })
        },
      })

    })
  },
  titleInputChange(e) {
    let that = this;
    if (e.detail.value.length >= 1) {
      that.setData({
        title: e.detail.value,
      })
    }
  },
  afterRead(event) {
    const {
      file
    } = event.detail;
    // 当设置 mutiple 为 true 时, file 为数组格式，否则为对象格式
    const path = file.path;
    const fileNameTemp = path.substr(String(path).lastIndexOf('/') + 1)
    const fileSuffix = fileNameTemp.substr(fileNameTemp.lastIndexOf('.'))
    const dateTimeFileName = "global-image/gallery/" + (new Date().getFullYear()) + (new Date().getMonth()) + (new Date().getDay()) + String(parseInt(Math.random() * 1000000000)) + fileSuffix

    var _this = this
    wx.cloud.uploadFile({
      cloudPath: dateTimeFileName,
      filePath: file.path, // 文件路径
    }).then(res => {
      var imageFileTemp = {}
      imageFileTemp.url = res.fileID
      imageFileTemp.name = dateTimeFileName
      imageFileTemp.isImage = true
      imageFileTemp.deletable = true
      _this.data.fileList.push(imageFileTemp);
      // 上传完成需要更新 fileList
      _this.setData({
        fileList: _this.data.fileList
      });

    }).catch(error => {
      // handle error
    })

  },

  delete(e){
    var fileId = e.detail.file.url
    wx.cloud.deleteFile({
      fileList: [fileId]
    })
    //删除云存储中的文件
    var index = e.detail.index
    //删除页面中的数据
    let fileArray = this.data.fileList
    fileArray.splice(index,1)
    this.setData({
      fileList:fileArray
    })
  },
})