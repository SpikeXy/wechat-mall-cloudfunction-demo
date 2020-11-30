
Page({
  data: {
    orderList: [],
    curPage:1,
    statusType: [{
        status: 9999,
        label: '全部'
      },
      {
        status: 0,
        label: '待付款'
      },
      {
        status: 1,
        label: '待发货'
      },
      {
        status: 2,
        label: '待收货'
      },
      {
        status: 3,
        label: '待评价'
      },
    ],
    status: 9999,
    label:'全部',
    badges: [0, 0, 0, 0, 0]
  },
  statusTap: function (e) {
    const status = e.currentTarget.dataset.status;
    const label = e.currentTarget.dataset.label;
    this.setData({
      status: status,
      label:label,
      curPage: 1
    });
    this.getOrderListByStatus(this.data.label, this.data.curPage)
  },
  onReachBottom: function () {
    this.setData({
      curPage: this.data.curPage + 1
    });

    this.getOrderListByStatus(this.data.label,this.data.curPage)
  },
  //取消订单
  cancelOrderTap: function (e) {
    const that = this;
    const orderId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '确定要取消该订单吗？',
      content: '',
      success: function (res) {
        if (res.confirm) {
          wx.showLoading({
            title: '取消中',
          })
          //进行取消订单的操作
          wx.cloud.callFunction({
            name: 'DeleteItemById',
            data: {
              collectionName:"order",
              _id: orderId
            }
          }).then(res => {
            wx.reLaunch({
              url: '/pages/order-list/index'
            })
          })
        }
      }
    })
  },
  refundApply(e) {
    // 申请售后
    const orderId = e.currentTarget.dataset.id;
    const amount = e.currentTarget.dataset.amount;
    wx.navigateTo({
      url: "/pages/order/refundApply?id=" + orderId + "&amount=" + amount
    })
  },
  //马上付款
  toPayTap(e) {
    const that = this;
    const orderId = e.currentTarget.dataset.id;
    let totalPrice = parseFloat(e.currentTarget.dataset.totalprice)
    //调用支付测试
    wx.cloud.callFunction({
      name: 'wxPay',
      data: {
        body: "body",
        attach: "attach",
        totalPrice: totalPrice * 100
      }
    }).then(res => {
      if (!res.result.appId) {
        wx.showToast({
          title: "支付失败，请稍后重试",
          duration: 5000,
          success: function (e) {
            wx.reLaunch({
              url: '/pages/order-list/index',
            })
          }
        })
      } else {
        //创建支付密钥成功，开始支付
        wx.requestPayment({
          ...res.result,
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
                _id: orderId,
                collectionName: "order",
                item: updateEntity
              }
            }).then(res => {
              //刷新订单页面
              wx.reLaunch({
                url: '/pages/order-list/index',
              })
            })
          },
          fail: function (res) {
            //不修改任何页面
          }
        })
      }
    })

  },
  //根据状态获取订单列表
  getOrderListByStatus(e,curPage){
    const statusTemp = e
    // 获取订单列表
    var that = this;
    var factor = {
    }
    if(e==undefined || e== NaN || e== null || e== '全部'){
    
    }else{
      factor.status = statusTemp
    }
    wx.cloud.callFunction({
      name: 'GetItemByFactorWithDesc',
      data: {
        collectionName: "order",
        factor: factor,
        pageIndex:curPage,
        pageSize: 20,
        orderByField: 'dateAdd',
        isUseUserId: true
      }
    }).then(res => {
      res.result.forEach(ele => {
        ele.orderId = ele._id.substring(0, 8)
        ele.dateTime = that.GetBeijingTime(ele.dateAdd)
      })
      let temp = that.data.orderList
      res.result.forEach(ele=>{
        temp.push(ele)
      })
      that.setData({
        orderList: temp
      });
    })
  },
  GetBeijingTime(e){
    let timeTemp = new Date(e)
    let year = timeTemp.getFullYear()
    let month = timeTemp.getMonth()+1<10?'0'+(timeTemp.getMonth()+1):(date.getMonth()+1)
    let day = timeTemp.getDate()
    let h = timeTemp.getHours()
    let m = timeTemp.getMinutes()
    return year +'-'+ month +'-'+day+'   '+h+'-'+m
  },
  onLoad: function (e) {
    const status = e.status;
    const label = e.label;
    console.log(status)
    console.log(label)
    this.setData({
      status: status,
      label:label,
    });
    if(label){
      this.getOrderListByStatus(label,this.data.curPage)
    }else{
      this.getOrderListByStatus('全部',this.data.curPage)
    }
 
    this.getOrderStatistics();
  },

  //获取角标
  getOrderStatistics() {

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
      let badgesTemp = [];
      badgesTemp[1] = _this.handleOrderCount(count_id_no_pay)
      badgesTemp[2] = _this.handleOrderCount(count_id_no_transfer)
      badgesTemp[3] = _this.handleOrderCount(count_id_no_confirm)
      badgesTemp[4] = _this.handleOrderCount(count_id_no_reputation)
      this.setData({
        badges: badgesTemp
      })
    })



  },
  handleOrderCount: function (count) {
    return count > 99 ? '99+' : count;
  }
})