const app = getApp();
import wxbarcode from 'wxbarcode'

Page({
  data: {
    orderId: '',
    orderDetail: undefined,
    goodsList: [],
    //图片文件列表
    fileList: [],
  },
  onLoad: function (e) {
    var orderId = e.id;
    this.setData({
      orderId: orderId,
    });
    var that = this
    var factor = {
      _id: orderId
    }
    wx.cloud.callFunction({
      name: 'GetItemById',
      data: {
        collectionName: "order",
        id: orderId
      }
    }).then(res => {
      let orderTemp = res.result
      orderTemp.orderId = orderTemp._id.substring(0, 8)
      orderTemp.dateTime = that.GetBeijingTime(orderTemp.dateAdd)
      that.setData({
        goodsList: orderTemp.goodsList,
        orderDetail: orderTemp
      });
    })
  },
  GetBeijingTime(e){
    let timeTemp = new Date(e)
    let year = timeTemp.getFullYear()
    let month = timeTemp.getMonth()+1<10?'0'+(timeTemp.getMonth()+1):(date.getMonth()+1)
    let day = timeTemp.getDate()
    let h = timeTemp.getHours()
    let m = timeTemp.getMinutes()
    return year +'-'+ month +'-'+day+'   '+h+'-'+m
  },
  onShow: function () {
    var that = this;
    // wx.showModal({
    //   title: '错误',
    //   content: res.msg,
    //   showCancel: false
    // })

  },

  //确认收货
  confirmBtnTap: function (e) {
    let that = this;
    let orderId = this.data.orderId;
    wx.showModal({
      title: '确认您已收到商品？',
      content: '',
      success: function (res) {

        if (res.confirm) {
          wx.showLoading({
            title: '确认收货中',
          })
          //修改订单状态
          var updateEntity = {
            status: "待评价",
            dateUpdate: Date.parse(new Date())
          }
          wx.cloud.callFunction({
            name: 'EditItem',
            data: {
              _id: orderId,
              collectionName: "order",
              item: updateEntity
            }
          }).then(res => {
            //跳转到订单页面
            wx.hideLoading({
              success: (res) => {
                wx.reLaunch({
                  url: '/pages/order-details/index?id=' + that.data.orderId,
                })
              }
            })
          })
        }
      }
    })
  },
  submitReputation: function (e) {
    let that = this;
    let reputation = '好评';
    let i = 0;
    let goodReputation = e.detail.value["goodReputation"];
    if (goodReputation == 2) {
      reputation = '好评';
    } else if (goodReputation == 1) {
      reputation = '中评';
    } else {
      reputation = '差评';
    }
    let goodReputationRemark = e.detail.value["goodReputationRemark"];
    //修改订单状态
    let imageUrl = []
    this.data.fileList.forEach(ele=>{
      imageUrl.push(ele.url)
    })
    var updateEntity = {
      status:"评价完成",
      reputation: reputation,
      reputationRemark: goodReputationRemark,
      reputationImages: imageUrl
    }
    wx.cloud.callFunction({
      name: 'EditItem',
      data: {
        _id: that.data.orderId,
        collectionName: "order",
        item: updateEntity
      }
    }).then(res => {
      //跳转到订单页面
      wx.hideLoading({
        success: (res) => {
          wx.reLaunch({
            url: '/pages/order-details/index?id=' + that.data.orderId,
          })
        }
      })
    })
  },
  afterRead(event) {
    const {
      file
    } = event.detail;
    // 当设置 mutiple 为 true 时, file 为数组格式，否则为对象格式
    const path = file.path;
    const fileNameTemp = path.substr(String(path).lastIndexOf('/') + 1)
    const fileSuffix = fileNameTemp.substr(fileNameTemp.lastIndexOf('.'))
    const dateTimeFileName = "reputation-image/" + (new Date().getFullYear()) + (new Date().getMonth()) + (new Date().getDay()) + String(parseInt(Math.random() * 1000000000)) + fileSuffix

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