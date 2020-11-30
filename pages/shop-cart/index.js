const app = getApp()

Page({
  data: {
    wxlogin: true,
    isShowGoodList: false,
    saveHidden: true,
    allSelect: true,
    noSelect: false,
    delBtnWidth: 120, //删除按钮宽度单位（rpx）
    carGoods: [],
    specs: [],
    totalPrice: 0

  },

  //获取元素自适应后的实际宽度
  getEleWidth: function (w) {
    var real = 0;
    try {
      var res = wx.getSystemInfoSync().windowWidth
      var scale = (750 / 2) / (w / 2)
      real = Math.floor(res / scale);
      return real;
    } catch (e) {
      return false;
      // Do something when catch error
    }
  },
  initEleWidth: function () {
    var delBtnWidth = this.getEleWidth(this.data.delBtnWidth);
    this.setData({
      delBtnWidth: delBtnWidth
    });
  },
  async onLoad(e) {
    this.initEleWidth();
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
  },
  onShow: function () {
    var that = this
    wx.checkSession({
      success: () => {
        //获取购物车的数据
        var thatOne = that
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
            let isShow = false
            if (curGoods.length > 0) {
              isShow = true
            }
            _this.setData({
              isShowGoodList: isShow,
              carGoods: curGoods
            })
            _this.calculateTotalPrice()
            if (curGoods.length > 0) {
              //设置导航栏购物车的角标
              wx.setTabBarBadge({
                index: 2,
                text: curGoods.length.toString()
              });
            } else {
              //设置导航栏购物车的角标
              wx.removeTabBarBadge({
                index: 2
              });
            }

          })
        })
      },
      fail: () => {
        //请重新登录
        wx.showToast({
          title: '请重新登录',
          icon: 'success',
          duration: 2000,
          complete: function () {
            wx.navigateTo({
              url: '/pages/my/index',
            })
          }
        })
      }
    })

  },
  //去首页
  toIndexPage: function () {
    wx.switchTab({
      url: "/pages/index/index"
    });
  },
  //核算总价
  calculateTotalPrice: function () {
    var curGoods = this.data.carGoods
    let tprice = 0
    curGoods.forEach(ele => {
      let minPrice = parseFloat(ele.minPrice)
      let count = ele.count
      tprice += minPrice * count
    })
    //保留两位小数
    this.setData({
      totalPrice:   Math.round(tprice*100)/100
    })
  },
  //删除购物车中的内容
  async delItem(e) {
    const cartId = e.currentTarget.dataset.cartid
    const _id= e.currentTarget.dataset.id
    // 弹出删除确认
    wx.showModal({
      content: '确定要删除该商品吗？',
      success: (res) => {
        if (res.confirm) {
          wx.cloud.callFunction({
            name: 'DeleteItemByFactor',
            data: {
              collectionName: "cart",
              isUseUserId: false,
              factor: {
                _id: cartId
              }
            }
          }).then(res => {

            //更新页面数据
            var curGoods = this.data.carGoods
            let removeIndex = undefined
            curGoods.forEach((element,index) => {
              if (element._id == _id) {
                removeIndex = index
                return
              }
            })
            curGoods.splice(removeIndex,1)
            //重新计算合计金额
            this.calculateTotalPrice()
            if(curGoods.length == 0 ){
              this.setData({
                isShowGoodList:false
              })
            }
            this.setData({
              carGoods: curGoods
            })
            //在这里重新计算角标
            if (curGoods.length > 0) {
              //设置导航栏购物车的角标
              wx.setTabBarBadge({
                index: 2,
                text: curGoods.length.toString()
              });
            } else {
              //设置导航栏购物车的角标
              wx.removeTabBarBadge({
                index: 2
              });
            }
          })
        }
      }
    })
  },

  jiaBtnTap(e) {
    const _id = e.currentTarget.dataset.id;
    const cartId = e.currentTarget.dataset.cartid;
    const count = e.currentTarget.dataset.count + 1;
    var curGoods = this.data.carGoods
    curGoods.forEach(element => {
      if (element._id == _id) {
        if (count > element.stores) {
          element.count = element.stores
        } else {
          element.count = count
        }
      }
    })
    this.setData({
      carGoods: curGoods
    })
    //修改购物车中的数据  
    var updateEntity = {
      count: count
    }
    wx.cloud.callFunction({
      name: 'EditItem',
      data: {
        _id: cartId,
        item: updateEntity,
        collectionName: "cart"
      }
    })
  },
  jianBtnTap(e) {
    const _id = e.currentTarget.dataset.id;
    const cartId = e.currentTarget.dataset.cartid;
    const count = e.currentTarget.dataset.count - 1;
    var curGoods = this.data.carGoods
    curGoods.forEach(element => {
      if (element._id == _id) {
        if (count < 0) {
          element.count = 0
        } else {
          element.count = count
        }
      }
    })
    this.setData({
      carGoods: curGoods
    })
    //修改购物车中的数据  
    var updateEntity = {
      count: count
    }
    wx.cloud.callFunction({
      name: 'EditItem',
      data: {
        _id: cartId,
        item: updateEntity,
        collectionName: "cart"
      }
    })
  },

  changeCarNumber(e) {
    const _id = e.currentTarget.dataset.id
    const cartId = e.currentTarget.dataset.cartid;
    const num = parseInt(e.detail.value)
    var curGoods = this.data.carGoods
    curGoods.forEach(element => {
      if (element._id == _id) {
        if (num > element.stores) {
          element.count = element.stores
        } else {
          element.count = num
        }

      }
    })
    this.setData({
      carGoods: curGoods
    })
    //修改购物车中的数据  
    var updateEntity = {
      count: num
    }
    wx.cloud.callFunction({
      name: 'EditItem',
      data: {
        _id: cartId,
        item: updateEntity,
        collectionName: "cart"
      }
    })
  }


})