const app = getApp();
const SelectSizePrefix = "选择："
import Poster from 'wxa-plugin-canvas/poster/poster'

Page({
  data: {
    specs: undefined,
    goodsDetail: {},
    goodId: "",
    hasMoreSelect: false,
    selectSize: SelectSizePrefix,
    selectSizePrice: 0,
    selectSizeOPrice: 0,
    shopNum: 0,
    hideShopPopup: true,
    buyCount: 1,
    buyNumMin: 1,
    storeCount: 0,
    contentHeight: '',
    canSubmit: false, //  选中规格尺寸时候是否允许加入购物车,
    buyByCart: true
  },
  async onLoad(e) {
    //这里存在扫码进页面的逻辑，分享二维码进页面有一些其他的逻辑
    let goodId = e.id
    const that = this
    wx.cloud.callFunction({
      name: 'GetItemById',
      data: {
        collectionName: "good",
        id: goodId
      }
    }).then(res => {
      var _that = that
      if (res.result.content != null && res.result.content != undefined && res.result.content.length > 0) {
        // console.log(res.result.content[0])
        wx.getImageInfo({
          src: res.result.content[0],
          success(res) {
            let widthTemp = res.width
            let heigthTemp = res.height
            _that.setData({
              contentHeight: 'height:' + heigthTemp + 'rpx;width:'+widthTemp+'rpx'
            })
          }
        })
      }
      that.setData({
        selectSizePrice: res.result.minPrice,
        storeCount: res.result.stores,
        selectSizeOPrice: res.result.originalPrice,
        goodsDetail: res.result,
        goodId: goodId
      });


    })

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


    //获取买家秀
    this.reputation(goodId)
    //获取用户的购物车信息
    this.shippingCartInfo()
  },
  //设置购物车角标
  shippingCartInfo() {
    var _this = this
    var factor = {}
    wx.cloud.callFunction({
      name: 'GetItemByFactor',
      data: {
        collectionName: "cart",
        factor: factor,
        isUseUserId: true
      }
    }).then(res => {
      let cartLength = res.result.length

      if (cartLength > 0) {
        _this.setData({
          shopNum: cartLength
        })
      } else {
        _this.setData({
          shopNum: 0
        })
      }
    })
  },
  onShow() {
    //检查是否登录，登录了就查询收藏数据
    var _this = this
    wx.checkSession({
      success() {
        _this.goodsFavCheck()
      },
      fail() {
        //不做任何处理
      }
    })
  },
  //刷新收藏
  async goodsFavCheck() {
    var factor = {
      goodId: this.data.goodId,
    }
    var _this = this
    wx.cloud.callFunction({
      name: 'GetItemByFactor',
      data: {
        collectionName: "favorite",
        factor: factor,
        isUseUserId: true
      }
    }).then(res => {
      if (res.result != undefined && res.result != null && res.result.length > 0) {
        _this.setData({
          faved: true
        })
      } else {
        _this.setData({
          faved: false
        })
      }

    })

  },
  //点击收藏
  async clickFav() {
    if (this.data.faved) {
      wx.showLoading({
        title: '取消收藏',
      })
    } else {
      wx.showLoading({
        title: '添加收藏',
      })
    }

    let favItem = this.data.faved
    let _this = this
    let goodIdTemp = this.data.goodId
    wx.checkSession({
      success() {
        //修改数据库中的值
        let newFavItem = !favItem
        if (newFavItem) {
          //新增收藏
          var itemData = {
            goodId: goodIdTemp,
            dateAdd: Date.parse(new Date())
          }
          wx.cloud.callFunction({
            name: 'AddItem',
            data: {
              collectionName: "favorite",
              item: itemData,
              isUseUserId: true
            }
          }).then(res => {
            _this.goodsFavCheck()
            wx.hideLoading({
              success: (res) => {},
            })
          })
        } else {
          //删除收藏
          wx.cloud.callFunction({
            name: 'DeleteItemByFactor',
            data: {
              collectionName: "favorite",
              isUseUserId: true,
              factor: {
                goodId: goodIdTemp
              }
            }
          }).then(res => {
            _this.goodsFavCheck()
            wx.hideLoading({
              success: (res) => {},
            })
          })
        }

      },
      fail() {
        //不做任何处理
      }
    })
  },
  goShopCar: function () {
    wx.reLaunch({
      url: "/pages/shop-cart/index"
    });
  },

  buyBySpecs: function () {
    this.setData({
      shopType: "tobuy"
    });
    this.bindGuiGeTap();
  },

  /**
   * 规格选择弹出框
   */
  bindSpecsTap: function () {

  },
  /**
   * 规格选择弹出框隐藏
   */
  closePopupTap: function () {
    this.setData({
      hideShopPopup: true
    })
  },
  numJianTap: function () {
    var _this = this
    if (_this.data.buyCount < _this.data.storeCount) {
      _this.data.buyCount--
      this.setData({
        buyCount: _this.data.buyCount
      })
    }
  },
  numJiaTap: function () {
    var _this = this
    if (_this.data.buyCount < _this.data.storeCount) {
      _this.data.buyCount++
      this.setData({
        buyCount: _this.data.buyCount
      })
    }
  },
  /**
   * 选择商品规格
   */
  skuSelect(e) {
    const parentId = e.currentTarget.dataset.parentid
    const _id = e.currentTarget.dataset.id
    var specsTemp = JSON.parse(JSON.stringify(this.data.specs))
    // 处理选中
    specsTemp.forEach(ele => {
      if (ele._id == parentId) {
        ele.subSpecs.forEach(element => {
          if (element._id == _id) {
            element.active = !element.active
          }
        })
      }
    })
    //同一种规格只能选择一种 判断
    let isMultiSelect = false
    specsTemp.forEach(ele => {
      if (ele._id == parentId) {
        let specCount = 0
        ele.subSpecs.forEach(element => {
          if (element.active) {
            specCount++
            if (specCount > 1) {
              wx.showToast({
                title: '同一种规格只能选择一种',
                icon: 'none'
              })
              isMultiSelect = true
            } else {
              isMultiSelect = false
            }
          }
        })
      }
    })
    if (isMultiSelect) {
      return
    } else {
      this.setData({
        specs: specsTemp
      })
    }
  },
  /**
   * 通过规格选择添加进购物车
   */
  addCartPop() {
    this.setData({
      hideShopPopup: false,
      buyByCart: true
    })
  },
  buyNowPop() {
    this.setData({
      hideShopPopup: false,
      buyByCart: false
    })
  },
  addCart() {
    wx.showLoading({
      title: '加入购物车',
    })
    var _this = this
    const specsTemp = this.data.specs
    const specsModelsTemp = []

    specsTemp.forEach(p => {
      p.subSpecs.forEach(ele => {
        if (ele.active) {
          specsModelsTemp.push(ele._id)
        }
      })
    })
    if (specsModelsTemp.length != this.data.specs.length) {
      wx.showToast({
        title: '请选择规格',
        icon: 'none'
      })
      return
    }
    //在购物车集合中添加数据
    let itemData = {
      goodId: _this.data.goodId,
      specsModelId: specsModelsTemp,
      count: _this.data.buyCount,
    }
    wx.cloud.callFunction({
      name: 'AddItem',
      data: {
        collectionName: "cart",
        item: itemData,
        isUseUserId: true
      }
    }).then(res => {
      wx.hideLoading({
        success: (res) => {
          wx.showToast({
            title: '加入成功',
            icon: 'success',
            success: function () {
              //购物车显示角标
              _this.setData({
                hideShopPopup: true
              })
              _this.shippingCartInfo()
            }
          })
        },
      })
    })

  },
  /**
   * 立即购买
   */
  buyNow: function (e) {

    var _this = this
    const specsTemp = this.data.specs
    const specsModelsTemp = []

    specsTemp.forEach(p => {
      p.subSpecs.forEach(ele => {
        if (ele.active) {
          specsModelsTemp.push(ele._id)
        }
      })
    })
    if (specsModelsTemp.length != this.data.specs.length) {
      wx.showToast({
        title: '请选择规格',
        icon: 'none'
      })
      return
    }
    //在购物车集合中添加数据
    let itemData = {
      goodId: _this.data.goodId,
      specsModelId: specsModelsTemp,
      count: _this.data.buyCount,
    }
    //直接跳转到订单提交页面
    wx.navigateTo({
      url: "/pages/direct-pay-order/index?goodId=" + itemData.goodId + '&specsModelId=' + itemData.specsModelId + '&buyCount=' + itemData.count
    })
  },

  onShareAppMessage() {
    let _data = {
      title: this.data.goodsDetail.basicInfo.name,
      path: '/pages/goods-details/index?id=' + this.data.goodsDetail.basicInfo.id + '&inviter_id=' + wx.getStorageSync('uid'),
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }

    return _data
  },
  //获取商品的评价
  reputation: function (goodsId) {

  },

  goIndex() {
    wx.switchTab({
      url: '/pages/index/index',
    });
  },
  cancelLogin() {
    this.setData({
      wxlogin: true
    })
  },

  closePop() {
    this.setData({
      posterShow: false
    })
  },
  previewImage(e) {
    const url = e.currentTarget.dataset.url
    wx.previewImage({
      current: url, // 当前显示图片的http链接
      urls: [url] // 需要预览的图片http链接列表
    })
  },
  //绘制分享二维码
  // async drawSharePic() {
  //   const _this = this
  //   const qrcode = qrcodeRes.data
  //   const pic = _this.data.goodsDetail.basicInfo.pic
  //   wx.getImageInfo({
  //     src: pic,
  //     success(res) {
  //       const height = 490 * res.height / res.width
  //       _this.drawSharePicDone(height, qrcode)
  //     },
  //     fail(e) {
  //       console.error(e)
  //     }
  //   })
  // },
  drawSharePicDone(picHeight, qrcode) {
    const _this = this
    const _baseHeight = 74 + (picHeight + 120)
    this.setData({
      posterConfig: {
        width: 750,
        height: picHeight + 660,
        backgroundColor: '#fff',
        debug: false,
        blocks: [{
          x: 76,
          y: 74,
          width: 604,
          height: picHeight + 120,
          borderWidth: 2,
          borderColor: '#c2aa85',
          borderRadius: 8
        }],
        images: [{
            x: 133,
            y: 133,
            url: _this.data.goodsDetail.basicInfo.pic, // 商品图片
            width: 490,
            height: picHeight
          },
          {
            x: 76,
            y: _baseHeight + 199,
            url: qrcode, // 二维码
            width: 222,
            height: 222
          }
        ],
        texts: [{
            x: 375,
            y: _baseHeight + 80,
            width: 650,
            lineNum: 2,
            text: _this.data.goodsDetail.basicInfo.name,
            textAlign: 'center',
            fontSize: 40,
            color: '#333'
          },
          {
            x: 375,
            y: _baseHeight + 180,
            text: '￥' + _this.data.goodsDetail.basicInfo.minPrice,
            textAlign: 'center',
            fontSize: 50,
            color: '#e64340'
          },
          {
            x: 352,
            y: _baseHeight + 320,
            text: '长按识别小程序码',
            fontSize: 28,
            color: '#999'
          }
        ],
      }
    }, () => {
      Poster.create();
    });
  },
  onPosterSuccess(e) {
    this.setData({
      posterImg: e.detail,
      showposterImg: true
    })
  },
  onPosterFail(e) {
    console.error('fail:', e)
  },
  savePosterPic() {
    const _this = this
    wx.saveImageToPhotosAlbum({
      filePath: this.data.posterImg,
      success: (res) => {
        wx.showModal({
          content: '已保存到手机相册',
          showCancel: false,
          confirmText: '知道了',
          confirmColor: '#333'
        })
      },
      complete: () => {
        _this.setData({
          showposterImg: false
        })
      },
      fail: (res) => {
        wx.showToast({
          title: res.errMsg,
          icon: 'none',
          duration: 2000
        })
      }
    })
  },
})