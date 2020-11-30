const APP = getApp()
// fixed首次打开不显示标题的bug
APP.configLoadOK = () => {
  wx.setNavigationBarTitle({
    title: "Aminah女装"
  })
}

Page({
  data: {
    inputVal: "", // 搜索框内容
    goodsRecommend: [], // 推荐商品
    loadingHidden: false, // loading
    selectCurrent: 0,
    categories: [],
    activeCategoryId: 0,
    goods: [],
    scrollTop: 0,
    loadingMoreHidden: true,
    coupons: [],
    curPage: 1,
    pageSize: 20,
    cateScrollTop: 0,
    roomid: 0
  },

  tabClick: function (e) {
    let id = e.currentTarget.dataset.id
    let name = e.currentTarget.dataset.name
    wx.setStorage({
      key: "categoryId",
      data: {
        id: id,
        name: name
      }
    })
    wx.switchTab({
      url: '/pages/category/category',
    })
  },
  toDetailsTap: function (e) {
    wx.navigateTo({
      url: "/pages/goods-details/index?id=" + e.currentTarget.dataset.id
    })
  },
  // 点击轮播图
  // tapBanner: function (e) {
  //   const _id = e.currentTarget.dataset.id
  //   wx.navigateTo({
  //     url: "/pages/goods-details/index?id=" + _id
  //   })
  // },
  adClick: function (e) {
    const url = e.currentTarget.dataset.url
    if (url) {
      wx.navigateTo({
        url
      })
    }
  },
  bindTypeTap: function (e) {
    this.setData({
      selectCurrent: e.index
    })
  },
  onLoad: function (e) {
    wx.showShareMenu({
      withShareTicket: true
    })
    const that = this
    if (e && e.scene) {
      const scene = decodeURIComponent(e.scene)
      if (scene) {
        wx.setStorageSync('referrer', scene.substring(11))
      }
    }
    wx.setNavigationBarTitle({
      title: "Aminah女装"
    })
    this.initBanners()
    this.categories()
    //推荐商品，最多20个
    wx.cloud.callFunction({
      name: 'GetItemByFactor',
      data: {
        collectionName: 'good',
        isUseUserId: false,
        factor: {
          "recommandChecked": true
        }
      }
    }).then(res => {
      that.setData({
        goodsRecommend: res.result
      })
    })

    that.getCoupons()
    that.getNotice()

  },


  async initBanners() {
    // 读取头部轮播图
    var that = this
    var factor = {
      rotationChecked: true
    }

    wx.cloud.callFunction({
      name: 'GetCollection',
      data: {
        collectionName: "rotation",
      }
    }).then(res => {
      var bannerArray = res.result
      //按照 rotationCheckedUpdateDate 降序排序
      that.setData({
        banners: bannerArray
      })
    })
  },

  async onShow(e) {
    let _this = this
    // 获取购物车数据，显示TabBarBadge
    this.setCartBadge()
    //获取直播信息
    wx.cloud.callFunction({
      name: "GetToken",
      data: {}
    }).then(res => {
      let access_token = res.result.access_token
      wx.cloud.callFunction({
        name: "GetRoomInfo",
        data: {
          accessToken: access_token
        }
      }).then(res2 => {
        let roomInfo = res2.result
        if (roomInfo.errmsg == "ok") {
          //现在只有一个直播
          let roomEntity = roomInfo.room_info[0]
          let roomId = roomEntity.roomid
          _this.setData({
            roomid: roomId
          })
        } else {
          return
        }


      })
    })
  },
  //点击横幅跳转到直播
  clickBanner() {

    // let customParams = encodeURIComponent(JSON.stringify({
    //   path: 'pages/index/index',
    //   pid: 1
    // })) 
    wx.navigateTo({
      url: 'plugin-private://wx2b03c6e691cd7370/pages/live-player-plugin?room_id='+this.data.roomid
    })
  },
  setCartBadge() {
    var factor = {}
    //购物车中的内容不超过20个，所以这里不设计分页
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
        //设置导航栏购物车的角标
        wx.setTabBarBadge({
          index: 2,
          text: cartLength.toString()
        });
      } else {
        //设置导航栏购物车的角标
        wx.removeTabBarBadge({
          index: 2
        });
      }
    })
  },
  async categories() {
    wx.cloud.callFunction({
      name: 'GetCollection',
      data: {
        collectionName: "category"
      }
    }).then(res => {
      const _categories = res.result.filter(ele => {
        return ele.level == 1
      })
      let categories = [];
      categories = categories.concat(_categories);
      this.setData({
        categories: categories,
        activeCategoryId: 0,
        curPage: 1
      });
    })
    this.getGoodsList(0);
  },
  onPageScroll(e) {
    let scrollTop = this.data.scrollTop
    this.setData({
      scrollTop: e.scrollTop
    })
  },
  async getGoodsList(categoryId, append) {
    if (categoryId == 0) {
      categoryId = 1;
    }
    wx.showLoading({
      "mask": true
    })
    var _this = this
    wx.cloud.callFunction({
      name: 'GetGoodsByCategory',
      data: {
        categoryId: categoryId,
        pageIndex: _this.data.curPage,
        pageSize: _this.data.pageSize
      }
    }).then(res => {
      wx.hideLoading()
      if (append) {
        if (res.result == [] || res.result.length == 0) {
          _this.setData({
            loadingMoreHidden: true
          });
        } else {
          let goods = [];
          goods = _this.data.goods
          for (var i = 0; i < res.result.length; i++) {
            goods.push(res.result[i]);
          }
          _this.setData({
            loadingMoreHidden: true,
            goods: goods,
          });
        }
      } else {
        if (res.result == [] || res.result.length == 0) {
          _this.setData({
            loadingMoreHidden: false,
            goods: [],
          });
          return
        } else {
          _this.setData({
            loadingMoreHidden: true,
            goods: res.result
          });
        }
      }
    })
  },
  getCoupons: function () {
    var that = this;

  },
  onShareAppMessage: function () {
    return {
      title: '"' + "Aminah女装" + '" ' + wx.getStorageSync('share_profile'),
      path: '/pages/index/index?inviter_id=' + wx.getStorageSync('uid')
    }
  },
  getNotice: function () {
    var that = this;
    wx.cloud.callFunction({
      name: 'GetNotice',
      data: {}
    }).then(res => {

      that.setData({
        noticeList: res.result
      });
    })
  },
  onReachBottom: function () {
    this.setData({
      curPage: this.data.curPage + 1
    });

    this.getGoodsList(this.data.activeCategoryId, true)
  },
  onPullDownRefresh: function () {
    this.setData({
      curPage: 1
    });

    this.getGoodsList(this.data.activeCategoryId)
    wx.stopPullDownRefresh()
  },
  bindinput(e) {
    this.setData({
      inputVal: e.detail.value
    })
  },
  bindconfirm(e) {
    this.setData({
      inputVal: e.detail.value
    })
    wx.navigateTo({
      url: '/pages/goods/list?name=' + this.data.inputVal,
    })
  },
  goSearch() {
    wx.navigateTo({
      url: '/pages/goods/list?name=' + this.data.inputVal,
    })
  }
})