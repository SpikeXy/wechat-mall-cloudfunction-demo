const app = getApp()
Page({
  data: {
    transferName: "",
    orderId:"",
    orderDetail:{},
    transferEnterpriseInfo:[],
    transferEntity:{},
    transferCompanyName:0
  },
  onLoad: function (e) {
    var that = this
    var orderId = e.id;
    this.data.orderId = orderId;
    wx.cloud.callFunction({
      name: 'GetItemById',
      data: {
        collectionName: "order",
        id: orderId
      }
    }).then(res => {
      let orderTemp = res.result
      that.setData({
        orderDetail: orderTemp
      });
    })
    wx.cloud.callFunction({
      name: 'GetCollection',
      data: {
        collectionName: "transfer"
      }
    }).then(res=>{
      that.setData({
        transferEntity : res.result[0],
      })
      wx.hideLoading({
        success: (res) => {},
      })
    })
    this.initTransferCompany()
  },

  //初始化快递公司名字
  initTransferCompany() {
    let temp = [{
        name: "韵达快递",
        deliveryId: "YUNDA",
        active: true
      },
      {
        name: "圆通速递",
        deliveryId: "YTO",
        active: false
      },
      {
        name: "中通快递",
        deliveryId: "ZTO",
        active: false
      },
      {
        name: "百世快递",
        deliveryId: "BEST",
        active: false
      },
      {
        name: "顺丰速运",
        deliveryId: "SF",
        active: false
      },
      {
        name: "中国邮政速递物流",
        deliveryId: "EMS",
        active: false
      },
      {
        name: "品骏快递",
        deliveryId: "PJ",
        active: false
      },
      {
        name: "德邦快递",
        deliveryId: "DB",
        active: false
      },
      {
        name: "申通快递",
        deliveryId: "STO",
        active: false
      },
      {
        name: "安能物流",
        deliveryId: "ANE",
        active: false
      },
      {
        name: "优速快递",
        deliveryId: "UCE",
        active: false
      },
      {
        name: "京东物流",
        deliveryId: "JDL",
        active: false
      },
    ]
    let tempArr = [{
        text: "韵达快递",
        value: 0,
        checked:true
      },
      {
        text: "圆通速递",
        value: 1,
        checked:false
      },
      {
        text: "中通快递",
        value: 2,
        checked:false
      },
      {
        text: "百世快递",
        value: 3,
        checked:false
      },
      {
        text: "顺丰速运",
        value: 4,
        checked:false
      },
      {
        text: "中国邮政速递物流",
        value: 5,
        checked:false
      },
      {
        text: "品骏快递",
        value: 6,
        checked:false
      },
      {
        text: "德邦快递",
        value: 7,
        checked:false
      },
      {
        text: "申通快递",
        value: 8,
        checked:false
      },
      {
        text: "安能物流",
        value: 9,
        checked:false
      },
      {
        text: "优速快递",
        value: 10,
        checked:false
      },
      {
        text: "京东物流",
        value: 11,
        checked:false
      },
    ]
    this.setData({
      transferEnterpriseInfo: tempArr
    })
  },
  
  onShow: function () {
  },
  transferNumberInputChange(e){
      let that = this;
      if (e.detail.value.length >= 1) {
        that.setData({
          transferNumber: e.detail.value,
        })
      }
  },
  copySenderAddress(e){
    let temp = this.data.transferEntity
    let address = temp.linkman + '  ' + temp.mobile +' ' +temp.provinceName + ' '+ temp.city + ' ' + temp.area + ' ' + temp.address 
    wx.setClipboardData({
      data: address,
      success (res) {
       
      }
    })
  },
  copyReciverAddress(e){
    let temp = this.data.orderDetail
    let address = temp.linkman + '  ' + temp.mobile +' ' +temp.provinceName + ' '+ temp.city + ' ' + temp.area + ' ' + temp.address 
    wx.setClipboardData({
      data: address,
      success (res) {
       
      }
    })
  },
  //提交运单数据
  submitTransfer(e){
    wx.showLoading({
      title: '稍等',
    })
    let _this = this
    let trName = ""
    let transferEnterpriseInfoArray = this.data.transferEnterpriseInfo
    transferEnterpriseInfoArray.forEach(ele=>{
      if(ele.value == this.data.transferCompanyName){
        trName = ele.text
      }
    })
    var updateEntity = {
      transferCompanyName: trName,
      transferNumber: this.data.transferNumber,
      status:"待收货"
    }
    wx.cloud.callFunction({
      name: 'EditItem',
      data: {
        _id: this.data.orderId,
        collectionName: "order",
        item: updateEntity
      }
    }).then(res => {
      _this.setData({
        currentGoods: this.data.currentGoods
      })
      wx.showToast({
        title: '设置成功',
        duration:2000,
        success:function(){
          wx.reLaunch({
            url: '/pages/order-manage/index',
          })
        }
      })
    })
  }

})
