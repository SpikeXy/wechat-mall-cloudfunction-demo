const app = getApp()

Page({
  data: {
    goodsList: [],
    goodIds: [],
    totalPrice: 0,
    specs: [],
    remark: '',
    isSelectAddress: false,
    curAddressData: {},
  },
  async onShow(e) {
    //立即购买下单
    //获取购物车的数据
    var thatOne = this
    //获取规格参数
    let specs = []
    await wx.cloud.callFunction({
      name: 'GetCollection',
      data: {
        collectionName: "specs"
      }
    }).then(res => {
      specs = res.result
    })
    //获取子规格参数
    let subSpecs = []
    await wx.cloud.callFunction({
      name: 'GetCollection',
      data: {
        collectionName: "specsModel"
      }
    }).then(res => {
      subSpecs = res.result
    })
    if (specs != [] && specs != undefined && specs.length > 0) {
      specs.forEach(element => {
        if (element.subSpecs == undefined || element.subSpecs == null || element.subSpecs == NaN) {
          element.subSpecs = []
        }
        var parentId = element._id
        subSpecs.forEach(ele2 => {
          if (parentId == ele2.parentId) {
            ele2.active = false;
            element.subSpecs.push(ele2);
          }
        })
      })
    }
    this.setData({
      specs: specs
    })
    var factor = {}
    wx.cloud.callFunction({
      name: 'GetItemByFactor',
      data: {
        collectionName: "cart",
        factor: factor,
        isUseUserId: true
      }
    }).then(res => {
      var _this = thatOne
      var cartGoodsTemp = res.result
      let goodIds = []
      if (cartGoodsTemp != [] && cartGoodsTemp.length > 0) {
        cartGoodsTemp.forEach(element => {
          goodIds.push(element.goodId)
        })
      }
      wx.cloud.callFunction({
        name: 'GetGoodsByIds',
        data: {
          goodIds: goodIds
        }
      }).then(goodRes => {
        let curGoods = []
        let goodArr = goodRes.result
        let _specs = _this.data.specs
        //整理数据，渲染页面
        cartGoodsTemp.forEach(cartLEle => {
          let newGoodEle = goodArr.find((ele)=>{
            return ele._id == cartLEle.goodId
          })
            newGoodEle.count = cartLEle.count
            newGoodEle.cartId = cartLEle._id
          let specsModelId = cartLEle.specsModelId[0]
          let spescArr = []
          _specs.forEach(specsEle => {
            let specsItem = specsEle
            specsItem.cartSpecsModels = []
            specsEle.subSpecs.forEach(modelEle => {
              if (modelEle._id == specsModelId) {
                specsItem.cartSpecsModels.push(modelEle)
              }
            })
            spescArr.push(specsItem)
          })
          newGoodEle.specs = spescArr
          curGoods.push(newGoodEle)
        })
        //核算总价
        let tprice = 0
        let goodIdsTemp = []
        curGoods.forEach(ele => {
          goodIdsTemp.push(ele._id)
          let minPrice = parseFloat(ele.minPrice)
          let count = ele.count
          tprice += minPrice * count
        })
        goodIds
        _this.setData({
          totalPrice: tprice,
          goodsList: curGoods,
          goodIds: goodIdsTemp
        })
      })
    })
  },

  async onLoad(e) {

  },
  remarkChange(e) {
    this.data.remark = e.detail.value
  },
  async createOrder(e) {
    wx.showLoading({
      title: '执行中',
    })
    var that = this;
    if (this.data.curAddressData == {} || this.data.isSelectAddress == false) {
      wx.showToast({
        title: '请设置收货地址',
        icon: 'none'
      })
      wx.hideLoading({
        success: (res) => {},
      })
      return
    } else {

      let postData = {
        goods: that.data.goodList,
        remark: that.data.remark,
        linkMan: that.data.curAddressData.linkMan,
        mobile: that.data.curAddressData.mobile,
        //省份
        provinceName: that.data.curAddressData.provinceName,
        //城市
        city: that.data.curAddressData.city,
        //区县
        area: that.data.curAddressData.area,
        //详细地址
        address: that.data.curAddressData.address,
        //邮编
        postCode: that.data.curAddressData.nationalCode,
        address: that.data.curAddressData.address,
        totalPrice: that.data.totalPrice,
        buyCount: that.data.buyCount,
        status: "待支付",
        goodsList: that.data.goodsList,
        dateAdd: Date.parse(new Date()),
        dateUpdate: Date.parse(new Date())
      };
      //先创建订单数据
      let orderCreateResult = await wx.cloud.callFunction({
        name: 'AddItem',
        data: {
          collectionName: "order",
          item: postData,
          isUseUserId: true
        }
      })
      //微信支付金额
      if (orderCreateResult.result._id != '') {
        //创建订单成功，删除购物车数据
        let cartRe = await wx.cloud.callFunction({
          name: 'DeleteCartGoods',
          data: {
            goodIds: that.data.goodIds
          }
        })
        //开始进行微信支付
        //调用支付测试
        let payResult = await wx.cloud.callFunction({
          name: 'wxPay',
          data: {
            body: "body",
            attach: "attach",
            totalPrice: that.data.totalPrice * 100
          }
        })
        if (!payResult.result.appId) {
          //创建支付密钥失败，跳转到订单页面
          that.navToOrderList()
        } else {
          //创建支付密钥成功，开始支付
          wx.requestPayment({
            ...payResult.result,
            success: res => {
              wx.showToast({
                title: '支付成功',
              })
              //修改订单状态
              var updateEntity = {
                status: "待发货",
                dateUpdate: Date.parse(new Date())
              }
              wx.cloud.callFunction({
                name: 'EditItem',
                data: {
                  _id: orderCreateResult.result._id,
                  collectionName: "order",
                  item: updateEntity
                }
              }).then(res => {
                //跳转到订单页面
                that.navToOrderList()
              })
            },
            fail: function (res) {
              wx.showToast({
                title: "支付失败，请稍后重试",
              })
              //跳转到订单页面
              that.navToOrderList()
            }
          })
        }
      }
    }
  },
  navToOrderList() {
    wx.redirectTo({
      url: "/pages/order-list/index"
    });
  },
  selectAddress: function () {
    var _this = this
    wx.chooseAddress({
      success(res) {
        let addr = {}
        addr.linkMan = res.userName
        addr.mobile = res.telNumber
        //省份
        addr.provinceName = res.provinceName
        //城市
        addr.city = res.cityName
        //区县
        addr.area = res.countyName
        //详细地址
        addr.address = res.detailInfo
        //邮编
        addr.postCode = res.nationalCode
        addr.addressDetail = res.provinceName + res.cityName + res.countyName + res.detailInfo + "  邮编" + res.nationalCode
        _this.setData({
          isSelectAddress: true,
          curAddressData: addr
        })

      }
    })


  },
  delAddress(e) {
    this.setData({
      curAddressData: {},
      isSelectAddress: false
    })
  }
})