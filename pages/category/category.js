Page({
  /**
   * 页面的初始数据
   */
  data: {
    categories: [],
    categorySelected: {
      name: '',
      id: '',
      icon: ''
    },
    currentGoods: [],
    onLoadStatus: true,
    scrolltop: 0,
    curPage: 1,
    pageSize: 20,
    specs: undefined,
    isShowCart: false,
    carCount: 0,
    buyCount: 1,
    storeCount: 0,
    curGoodId: ""
  },
  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    let _this = this
    this.categories();


    wx.showShareMenu({
      withShareTicket: true
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
  },

  async categories() {
    wx.showLoading({
      title: '加载中',
    })
    wx.hideLoading()
    let categories = [];
    let categoryName = '';
    let categoryId = '';
    var that = this
    wx.cloud.callFunction({
      name: 'GetCollection',
      data: {
        collectionName: "category"
      }
    }).then(res => {
      const _categories = res.result.filter(ele => {
        return ele.level == 1
      })
      categories = categories.concat(_categories);
      if (that.data.categorySelected.id) {
        const _curCategory = categories.find(ele => {
          return ele.id == that.data.categorySelected.id
        })
        // categoryIcon = _curCategory.icon,
        categoryName = _curCategory.name;
        categoryId = _curCategory.id;
      }
      for (let i = 0; i < categories.length; i++) {
        let item = categories[i];
        if (i == 0 && !that.data.categorySelected.id) {
          categoryName = item.name;
          categoryId = item.id;
        }
      }
      that.setData({
        categories: categories,
        categorySelected: {
          name: categoryName,
          id: categoryId
        }
      });
      that.getGoodsList();
    })
  },
  async getGoodsList() {
    wx.showLoading({
      title: '加载中',
    })
    var _this = this
    wx.cloud.callFunction({
      name: 'GetGoodsByCategory',
      data: {
        categoryId: _this.data.categorySelected.id,
        pageIndex: _this.data.curPage,
        pageSize: _this.data.pageSize
      }
    }).then(res => {
      _this.setData({
        currentGoods: res.result
      });
      wx.hideLoading()
    })

  },
  setCartBadge() {
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
      this.setData({
        carCount: cartLength
      })
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
  toDetailsTap: function (e) {
    wx.navigateTo({
      url: "/pages/goods-details/index?id=" + e.currentTarget.dataset.id
    })
  },
  onCategoryClick: function (e) {
    var that = this;
    var id = e.target.dataset.id;
    if (id === that.data.categorySelected.id) {
      that.setData({
        scrolltop: 0,
      })
    } else {
      var categoryName = '';
      for (var i = 0; i < that.data.categories.length; i++) {
        let item = that.data.categories[i];
        if (item.id == id) {
          categoryName = item.name;
          break;
        }
      }
      that.setData({
        categorySelected: {
          name: categoryName,
          id: id
        },
        scrolltop: 0
      });
      that.getGoodsList();
    }
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
  onShareAppMessage() {
    return {
      title: '"' + "Aminah女装" + '" ' + wx.getStorageSync('share_profile'),
      path: '/pages/index/index?inviter_id=' + wx.getStorageSync('uid')
    }
  },
  onShow() {
    // 获取购物车数据，显示TabBarBadge
    this.setCartBadge()
    let _this = this
    wx.getStorage({
      key: 'categoryId',
      success(res) {
        wx.removeStorage({key:'categoryId'})
        let tempCategoryId = res.data.id
        let tempCategoryName = res.data.name
        _this.setData({
          categorySelected: {
            name: tempCategoryName,
            id: tempCategoryId
          },
          scrolltop: 0
        });
        _this.getGoodsList();
      }
    })
  },
  //点击加入购物车的按钮
  async addShopCar(e) {
    var _this = this
    //检查是否登录了
    wx.checkSession({
      fail() {
        wx.showModal({
          title: '请登录',
          content: '登录后才可以购买',
          success(res) {
            if (res.confirm) {
              wx.navigateTo({
                url: '/pages/my/index',
              })
            }
          }
        })
      }
    })
    const curGood = _this.data.currentGoods.find(ele => {
      return ele._id == e.currentTarget.dataset.id
    })
    this.setData({
      storeCount: curGood.stores,
      curGoodId: curGood._id
    })
    if (curGood.stores < 1) {
      wx.showToast({
        title: '已售罄~',
        icon: 'none'
      })
      return
    }

    // 处理加入购物车的业务逻辑
    if (curGood.specsModels != [] && curGood.specsModels != undefined && curGood.specsModels != null) {
      //如果存在规格数据
      wx.hideTabBar()
      _this.setData({
        isShowCart: true
      })

    } else {
      //如果不存在规格数据
      //直接在购物车集合中添加数据
      let itemData = {
        goodId: curGood._id,
        specsModelId: [],
        count: 1,
        isUseUserId: true
      }
      wx.cloud.callFunction({
        name: 'AddItem',
        data: {
          collectionName: "cart",
          item: itemData
        }
      }).then(res => {
        wx.showToast({
          title: '加入成功',
          icon: 'success'
        })
        wx.showTabBar()
        //购物车显示角标
        _this.data.carCount++
        _this.setData({
          carCount: _this.data.carCount
        })
        wx.setTabBarBadge({
          index: 2,
          text: _this.data.carCount.toString()
        });
      })

    }

  },
  storesJia() {
    var _this = this
    if (_this.data.buyCount < _this.data.storeCount) {
      _this.data.buyCount++
      this.setData({
        buyCount: _this.data.buyCount
      })
    }
  },
  storesJian() {
    var _this = this
    if (_this.data.buyCount < _this.data.storeCount) {
      _this.data.buyCount--
      this.setData({
        buyCount: _this.data.buyCount
      })
    }
  },
  closeSku() {
    this.setData({
      isShowCart: false
    })
    wx.showTabBar()
  },
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
  addCarSku() {
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
      goodId: _this.data.curGoodId,
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
      wx.showToast({
        title: '加入成功',
        icon: 'success'
      })
      wx.showTabBar()
      //购物车显示角标
      _this.data.carCount++
      _this.setData({
        carCount: _this.data.carCount,
        isShowCart: false,
        specs: [],
        buyCount: 1
      })
      wx.setTabBarBadge({
        index: 2,
        text: _this.data.carCount.toString()
      });
    })
  },
})