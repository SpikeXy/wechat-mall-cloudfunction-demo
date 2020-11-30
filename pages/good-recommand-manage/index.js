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
        categoryIcon = _curCategory.icon,
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
  onShow() {},
  onChangeRecommandStatus(e) {
    let _id = e.currentTarget.dataset.id
    let updateTime = new Date()
    let recommandCheckVar = true
    //修改下面两个字段
    this.data.currentGoods.forEach(element => {
      if (element._id == _id) {
        //轮播图是否展示
        if (element.recommandChecked!=undefined && element.recommandChecked!=null) {
          let temp =  !element.recommandChecked
          element.recommandChecked = temp
          recommandCheckVar = temp
          //轮播图修改时间，轮播图排序用
          element.recommandCheckedUpdateDate = updateTime
        } else {
          element.recommandChecked = true
          recommandCheckVar = true
          //轮播图修改时间，轮播图排序用
          element.recommandCheckedUpdateDate = updateTime
        }
      }
    })
    var updateEntity = {
      recommandChecked: recommandCheckVar,
      recommandCheckedUpdateDate: updateTime
    }
    wx.cloud.callFunction({
      name: 'EditItem',
      data: {
        _id: _id,
        collectionName: "good",
        item: updateEntity
      }
    }).then(res => {
      this.setData({
        currentGoods: this.data.currentGoods
      })
    })
 
  }
})