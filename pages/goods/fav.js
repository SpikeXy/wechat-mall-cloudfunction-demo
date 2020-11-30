Page({
  data: {
    goods: [],
    curPage:1
  },
  onLoad: function (options) {},
  onShow: function () {
    this.goodsFavList(this.data.curPage)
  },
  //获取收藏列表
  async goodsFavList(index) {
    let _this = this
    let teGoods =  this.data.goods
    let factor = {}
    wx.cloud.callFunction({
      name: "GetItemByFactorWithDesc",
      data: {
        collectionName: "favorite",
        factor: factor,
        pageIndex: index,
        pageSize: 20,
        orderByField: 'dateAdd',
        isUseUserId: true
      }
    }).then(res => {
      //根据goodIds查找到相关的goods并赋值
      let goodIdsTemp = []
      if (res.result != [] && res.result.length > 0) {
        res.result.forEach(ele => {
          goodIdsTemp.push(ele.goodId)
        })
      }
      if (goodIdsTemp.length > 0) {
        wx.cloud.callFunction({
          name: "GetGoodsByIds",
          data: {
            goodIds: goodIdsTemp
          }
        }).then(res => {
          res.result.forEach(ele=>{
            teGoods.push(ele)
          })
          _this.setData({
            goods: teGoods
          })
        })
      }

    })

  },
  //取消收藏
  async removeFav(e) {
    wx.showLoading({
      title: '取消收藏',
    })
    let _this = this
    const goodIdTemp = e.currentTarget.dataset.id
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
      let tempGoods = _this.data.goods
      wx.hideLoading({
        success: (res) => {
          //删除数组中的数据
          let tempIndex = -1
          tempGoods.forEach((ele,index)=>{
            if(ele._id == goodIdTemp){
              tempIndex = index
            }
          })
          tempGoods.splice(tempIndex,1)
          _this.setData({
            goods:tempGoods
          })
          wx.showToast({
            title: '取消收藏',
            icon: 'success'
          })
        },
      })
 
    })

  },
  onReachBottom(){
    this.setData({
      curPage: this.data.curPage + 1
    });
    this.getGoodsList(this.data.curPage)
  }
})