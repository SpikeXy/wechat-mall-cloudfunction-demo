const app = getApp()

Page({
  data: {
    _id: "",
    isClickGetUserInfo: false,
    isNeedLogin: true,
    wxlogin: true,
    balance: 0.00,
    freeze: 0,
    score: 0,
    growth: 0,
    score_sign_continuous: 0,
    rechargeOpen: false, // 是否开启充值[预存]功能
    phoneNumber: "",
    // 用户订单统计数据
    count_id_no_confirm: 0,
    count_id_no_pay: 0,
    count_id_no_reputation: 0,
    count_id_no_transfer: 0,
  },
  onLoad() {
    const _this = this
    //检查用户是否已经存在
    wx.cloud.callFunction({
      name: 'GetUser',
      data: {}
    }).then((res) => {
      //显示用户页面
      if (res.result != null && res.result != undefined && res.result.length > 0) {
        var reEntity = res.result[0]
        _this.setData({
          isNeedLogin: false,
          userName: reEntity.nickName,
          avatarLink: reEntity.avatarUrl,
          gender: reEntity.gender,
          _id: reEntity._id,
          phoneNumber:reEntity.phoneNumber
        })
        //获取各种订单的数据
        _this.orderStatistics();
        // 获取购物车数据，显示TabBarBadge
        //TOOLS.showTabBarBadge();
      } else {
        _this.setData({
          isNeedLogin: true
        })
      }

    })

  },
  onShow() {



  },
  
  getPhoneNumber: function (e) {
    wx.showLoading({
      title: '绑定中',
    })
    let tempId = this.data._id
    wx.cloud.callFunction({
      name: "GetPhoneNumber",
      data: {
        phoneData: wx.cloud.CloudID(e.detail.cloudID)
      }
    }).then(res => {
      let phoneData = res.result.data
      let updateEntity = {
        phoneNumber :phoneData.phoneNumber,
        countryCode : phoneData.countryCode,
      }
      wx.cloud.callFunction({
        name: "EditItem",
        data: {
          _id: tempId,
          collectionName: "user",
          item: updateEntity
        }
      }).then(res=>{
        wx.showToast({
          title: '绑定成功',
          success:function(){
            wx.reLaunch({
              url: '/pages/my/index',
            })
          }
        })
      })
    })

  },
  bindGetUserInfo: function (e) {

    this.setData({
      isClickGetUserInfo: true
    })
    wx.showLoading({
      title: '等待..',
    })

    if (e.detail.userInfo) {

      const userInfoEntity = e.detail.userInfo
      //新增用户数据到集合
      wx.cloud.callFunction({
        name: 'AddUser',
        data: {
          userInfoEntity: userInfoEntity
        }
      }).then(res3 => {
        wx.hideLoading()
        //重新进入my的界面，这样就会加载数据了
        wx.reLaunch({
          url: '/pages/my/index',
        })

      })
    } else {
      wx.hideLoading()
      this.setData({
        wxlogin: true
      })
    }
  },
  handleOrderCount: function (count) {
    return count > 99 ? '99+' : count;
  },

  orderStatistics: function () {
    //获取待付款，待发货等数据
    var _this = this
    wx.cloud.callFunction({
      name: 'GetUserPayInfo',
      data: {}
    }).then(res => {
      const {
        count_id_no_pay, //未付款
        count_id_no_transfer, //待发货
        count_id_no_confirm, //待收货
        count_id_no_reputation, // 待评价
      } = res.result || {}
      _this.setData({
        count_id_no_confirm: this.handleOrderCount(count_id_no_confirm),
        count_id_no_pay: this.handleOrderCount(count_id_no_pay),
        count_id_no_reputation: this.handleOrderCount(count_id_no_reputation),
        count_id_no_transfer: this.handleOrderCount(count_id_no_transfer),
      })
    })
  },
  goAsset: function () {
    wx.navigateTo({
      url: "/pages/asset/index"
    })
  },
  goScore: function () {
    wx.navigateTo({
      url: "/pages/score/index"
    })
  },
  // goRefund(){
  //   wx.navigateTo({
  //     url: "/pages/order/refundApply"
  //   })
  // },
  goOrder: function (e) {
    wx.navigateTo({
      url: "/pages/order-list/index?status=" + e.currentTarget.dataset.status+'&label='+e.currentTarget.dataset.label
    })
  },
  cancelLogin() {
    this.setData({
      wxlogin: true
    })
  },
  goLogin() {
    this.setData({
      wxlogin: false
    })

  },
 
  scanOrderCode() {
    wx.scanCode({
      onlyFromCamera: true,
      success(res) {
        wx.navigateTo({
          url: '/pages/order-details/scan-result?hxNumber=' + res.result,
        })
      },
      fail(err) {
        console.error(err)
        wx.showToast({
          title: err.errMsg,
          icon: 'none'
        })
      }
    })
  }
})