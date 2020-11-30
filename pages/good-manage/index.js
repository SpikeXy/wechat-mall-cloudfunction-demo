const AUTH = require('../../utils/auth')

Page({
  /**
   * 页面的初始数据
   */
  data: {
    categories: [],
    categorySelected: {
      name: '',
      id: ''
    },
    curPage: 1,
    pageSize: 20,
    currentGoods: [],
    onLoadStatus: true,
    scrolltop: 0,

    skuCurGoods: undefined
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showShareMenu({
      withShareTicket: true
    })
    this.categories();
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
        collectionName:"category"
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

      this.setData({
        currentGoods: res.result
      });
      wx.hideLoading()
    })

  },
  deleteGood(e) {
    let _id = e.currentTarget.dataset.id
    wx.showModal({
      title: '请确认',
      content: '是否删除商品',
      success(res) {
        if (res.confirm) {
          wx.cloud.callFunction({
            name: 'DeleteItemById',
            data: {
              collectionName:"good",
              _id: _id
            }
          }).then(res => {
            wx.reLaunch({
              url: '/pages/good-manage/index'
            })
          })
        }
      }
    })
  

  },
  toDetailsTap: function (e) {
    let _id =  e.currentTarget.dataset.id
    wx.navigateTo({
      url: "/pages/goods-details/index?id=" + _id
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
    AUTH.checkHasLogined().then(isLogined => {
      if (isLogined) {
        this.setData({
          wxlogin: isLogined
        })
        //TOOLS.showTabBarBadge() // 获取购物车数据，显示TabBarBadge
      }
    })
    const _categoryId = wx.getStorageSync('_categoryId')
    wx.removeStorageSync('_categoryId')
    if (_categoryId) {
      this.data.categorySelected.id = _categoryId
      this.categories();
    } else {
      this.data.categorySelected.id = null
    }
  },
  editGood(e) {
    let _id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/good-manage/edit?id=' + _id
    })
  },

  addGood() {
    wx.navigateTo({
      url: '/pages/good-manage/add'
    })
  },
})