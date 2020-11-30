Page({

  /**
   * 页面的初始数据
   */
  data: {
    listType: 1, // 1为1个商品一行，2为2个商品一行    
    name: '', // 搜索关键词
    curPage: 1,
    goods: [],
    specs: [],
    carCount: 0,
    buyCount: 1,
    storeCount: 0,
    curGoodId: ""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    this.setData({
      name: options.name,
    })
    this.search();
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

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },
  async search() {
    // 搜索商品
    let _this = this
    wx.showLoading({
      title: '加载中',
    })
    wx.cloud.callFunction({
      name: "GetSearchGoods",
      data: {
        name: this.data.name,
        pageIndex: this.data.curPage,
        pageSize: 20
      }
    }).then(res => {
      _this.setData({
        goods: res.result
      })
      wx.hideLoading()
    })
  },
  onReachBottom: function () {
    this.setData({
      curPage: this.data.curPage + 1
    });

    this.search()
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
    const curGood = _this.data.goods.find(ele => {
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
      // wx.hideTabBar()
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
        // wx.showTabBar()
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
    // wx.showTabBar()
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
      // wx.showTabBar()
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

  /**
   * 页面上拉触底事件的处理函数
   */
 
  changeShowType() {
    if (this.data.listType == 1) {
      this.setData({
        listType: 2
      })
    } else {
      this.setData({
        listType: 1
      })
    }
  },
  bindinput(e) {
    this.setData({
      name: e.detail.value
    })
  },
  bindconfirm(e) {
    this.setData({
      name: e.detail.value
    })
    this.search()
  },

})