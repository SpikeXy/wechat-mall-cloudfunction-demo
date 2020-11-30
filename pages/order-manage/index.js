
Page({
  data: {
    orderList: [],
    transferEntity: {},
    orderId: "",
    curPage:1,
    label:"全部",
    //绑定的快递方列表
    transferEnterpriseInfo: [],
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
    badges: [0, 0, 0, 0, 0]
  },
  statusTap: function (e) {
    const status = e.currentTarget.dataset.status;
    const label = e.currentTarget.dataset.label;
    this.setData({
      status: status,
      label:label
    });
    this.getOrderListByStatus(label,this.data.curPage)
  },
  //发货，弹出选择快递菜单
  toTransferGood(e) {
    const orderId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url:'/pages/wuliu/index?id='+orderId,
    })
  },
  //关闭弹出菜单
  onClose() {
    this.setData({
      show: false
    });
  },
  onReachBottom: function () {
    this.setData({
      curPage: this.data.curPage + 1
    });

    this.getOrderListByStatus(this.data.label,this.data.curPage)
  },
  //根据状态获取订单列表
  getOrderListByStatus(e,curPage) {
    const statusTemp = e
    // 获取订单列表
    var that = this;
    var factor = {}
    if (e == undefined || e == NaN || e == null || e == '全部') {

    } else {
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
        ele.dateTime = that.GetBeijingTime( ele.dateAdd)
      })
      let tempList = that.data.orderList
      res.result.forEach(ele=>{
        tempList.push(ele)
      })
      that.setData({
        orderList: tempList
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
  onLoad: function () {

    this.getOrderListByStatus('全部',this.data.curPage);
    this.getOrderStatistics();
    //this.getTransferAccount();
    this.getDefaultSenderAddress();
  },
  //获取默认发货地址
  getDefaultSenderAddress(e) {
    let _this = this
    wx.cloud.callFunction({
      name: 'GetCollection',
      data: {
        collectionName: "transfer"
      }
    }).then(res => {
      _this.setData({
        transferEntity: res.result[0],
      })
    })
  },
  //获取绑定的快递合作商
  getTransferAccount(e) {
    var _this = this
    wx.cloud.callFunction({
      name: 'GetTransferAccount',
      data: {}
    }).then(res => {
      let tempArr = res.result.list
      tempArr.forEach((ele, index) => {
        if (index == 0) {
          ele.active = true
        } else {
          ele.active = false
        }
        if (ele.deliveryId == 'YUNDA') {
          ele.name = "韵达快递"
        }
        if (ele.deliveryId == 'YTO') {
          ele.name = "圆通速递"
        }
        if (ele.deliveryId == 'ZTO') {
          ele.name = "中通快递"
        }
        if (ele.deliveryId == 'BEST') {
          ele.name = "百世快递"
        }
        if (ele.deliveryId == 'SF') {
          ele.name = "顺丰速运"
        }
        if (ele.deliveryId == 'EMS') {
          ele.name = "中国邮政速递物流"
        }
        if (ele.deliveryId == 'PJ') {
          ele.name = "品骏快递"
        }
        if (ele.deliveryId == 'DB') {
          ele.name = "德邦快递"
        }
        if (ele.deliveryId == 'STO') {
          ele.name = "申通快递"
        }
        if (ele.deliveryId == 'ANE') {
          ele.name = "安能物流"
        }
        if (ele.deliveryId == 'UCE') {
          ele.name = "优速快递"
        }
        if (ele.deliveryId == 'JDL') {
          ele.name = "京东物流"
        }
      })
      _this.setData({
        transferEnterpriseInfo: tempArr
      })
    })
  },

  //点击快递
  clickDeliveryId(e) {
    let deliveryid = e.currentTarget.dataset.deliveryid
    //切换快递的为选中状态
    let tempArr = this.data.transferEnterpriseInfo
    tempArr.forEach(ele => {
      if (ele.deliveryId == deliveryid) {
        ele.active = true
      } else {
        ele.active = false
      }
    })
    this.setData({
      transferEnterpriseInfo: tempArr
    })
  },
  //确认生成运单
  submitTransferDelivery(e) {
    let _this = this
    let selectDelivery = {}
    let tempArr = this.data.transferEnterpriseInfo

    tempArr.forEach(ele => {
      if (ele.active) {
        selectDelivery = ele
      }
    })
    //开始生成运单了
    wx.showLoading({
      title: '开始生成订单',
    })
    wx.cloud.callFunction({
      name: 'GetItemById',
      data: {
        collectionName: "order",
        id: this.data.orderId
      }
    }).then(res => {
      let that = _this
      let orderEntityTemp = res.result
      let goodsList = orderEntityTemp.goodsList
      let weightTotal = 0
      let spaceXTotal = 0
      let spaceYTotal = 0
      let spaceZTotal = 0
      let detailListTemp = []
      goodsList.forEach(ele => {
        weightTotal += (ele.weight == NaN || ele.weight == undefined) ? 1 : ele.weight
        spaceXTotal += (ele.spaceX == NaN || ele.spaceX == undefined) ? 50.1 : ele.spaceX
        spaceYTotal += (ele.spaceY == NaN || ele.spaceY == undefined) ? 50.1 : ele.spaceY
        spaceZTotal += (ele.spaceZ == NaN || ele.spaceZ == undefined) ? 50.1 : ele.spaceZ
        detailListTemp.push({
          name: ele.name,
          count: ele.count
        })
      })
      let trEntity = _this.data.transferEntity
      let orderEntity = {
        openid: orderEntityTemp.userId,
        sender: {
          name: trEntity.linkman,
          tel: '010-2223333',
          mobile: trEntity.mobile,
          company: "XXX公司",
          country: trEntity.country,
          province: trEntity.provinceName,
          city: trEntity.city,
          area: trEntity.area,
          address: trEntity.address,
          postCode: trEntity.postCode,
        },
        receiver: {
          name: orderEntityTemp.linkMan,
          tel: '010-2223333',
          mobile: orderEntityTemp.mobile,
          company: 'xxx公司',
          country: '中国',
          province: orderEntityTemp.provinceName,
          city: orderEntityTemp.city,
          area: orderEntityTemp.area,
          address: orderEntityTemp.address,
          postCode: '',
        },
        shop: {
          wxaPath: '/pages/order-details/index?id=' + orderEntityTemp._id,
          imgUrl: orderEntityTemp.goodsList[0].pic[0],
          goodsName: orderEntityTemp.goodsList[0].name,
          goodsCount: orderEntityTemp.goodsList.length
        },
        cargo: {
          count: orderEntityTemp.goodsList.length,
          weight: weightTotal,
          spaceX: spaceXTotal,
          spaceY: spaceYTotal,
          spaceZ: spaceZTotal,
          detailList: detailListTemp
        },
        insured: {
          useInsured: 0,
          insuredValue: 0
        },
        service: {
          serviceType: selectDelivery.serviceType[0].serviceType,
          serviceName: selectDelivery.serviceType[0].serviceName,
        },
        addSource: 0,
        orderId: '01234567890',
        deliveryId: selectDelivery.deliveryId,
        bizId: selectDelivery.bizId,
        customRemark: trEntity.remark
      }

      wx.cloud.callFunction({
        name: 'AddTransferOrder',
        data: {
          item: orderEntity
        }
      }).then(res => {
        let backOrderEntity = res.result
        if (backOrderEntity.errCode) {
          wx.hideLoading({
            success: (res) => {
              wx.showModal({
                title: '出错了 ' + backOrderEntity.errCode,
                content: backOrderEntity.errMsg,
                success: function () {

                }
              })
            }

          })

        } else {
          let _id = backOrderEntity.orderId
          wx.showToast({
            title: '生成运单成功',
          })
          //更新订单状态
          let updateEntity = {
            waybillId: backOrderEntity.waybillId,
            waybillData: backOrderEntity.waybillData,
            transferErrMsg: backOrderEntity.errMsg,
            transferErrCodde: backOrderEntity.errCode,
            status: '待收货'
          }
          wx.cloud.callFunction({
            name: "EditItem",
            data: {
              _id: _id,
              collectionName: "order",
              item: updateEntity
            }
          }).then(res => {
            //更新订单状态
            wx.reLaunch({
              url: '/pages/order-manage/index',
            })
          })
        }

      })
    })

    this.setData({
      show: false
    });
  },
  //确认生成运单
  submitTransferDeliveryOnlyWithNumber(e) {
    let _this = this
    let selectDelivery = {}
    let tempArr = this.data.transferEnterpriseInfo

    tempArr.forEach(ele => {
      if (ele.active) {
        selectDelivery = ele
      }
    })
    //开始生成运单了
    wx.showLoading({
      title: '开始生成订单',
    })
    wx.cloud.callFunction({
      name: 'GetItemById',
      data: {
        collectionName: "order",
        id: this.data.orderId
      }
    }).then(res => {
      let that = _this
      let orderEntityTemp = res.result
      let goodsList = orderEntityTemp.goodsList
      let weightTotal = 0
      let spaceXTotal = 0
      let spaceYTotal = 0
      let spaceZTotal = 0
      let detailListTemp = []
      goodsList.forEach(ele => {
        weightTotal += (ele.weight == NaN || ele.weight == undefined) ? 1 : ele.weight
        spaceXTotal += (ele.spaceX == NaN || ele.spaceX == undefined) ? 50.1 : ele.spaceX
        spaceYTotal += (ele.spaceY == NaN || ele.spaceY == undefined) ? 50.1 : ele.spaceY
        spaceZTotal += (ele.spaceZ == NaN || ele.spaceZ == undefined) ? 50.1 : ele.spaceZ
        detailListTemp.push({
          name: ele.name,
          count: ele.count
        })
      })
      let trEntity = _this.data.transferEntity
      let orderEntity = {
        openid: orderEntityTemp.userId,
        sender: {
          name: trEntity.linkman,
          tel: '010-2223333',
          mobile: trEntity.mobile,
          company: "XXX公司",
          country: trEntity.country,
          province: trEntity.provinceName,
          city: trEntity.city,
          area: trEntity.area,
          address: trEntity.address,
          postCode: trEntity.postCode,
        },
        receiver: {
          name: orderEntityTemp.linkMan,
          tel: '010-2223333',
          mobile: orderEntityTemp.mobile,
          company: 'xxx公司',
          country: '中国',
          province: orderEntityTemp.provinceName,
          city: orderEntityTemp.city,
          area: orderEntityTemp.area,
          address: orderEntityTemp.address,
          postCode: '',
        },
        shop: {
          wxaPath: '/pages/order-details/index?id=' + orderEntityTemp._id,
          imgUrl: orderEntityTemp.goodsList[0].pic[0],
          goodsName: orderEntityTemp.goodsList[0].name,
          goodsCount: orderEntityTemp.goodsList.length
        },
        cargo: {
          count: orderEntityTemp.goodsList.length,
          weight: weightTotal,
          spaceX: spaceXTotal,
          spaceY: spaceYTotal,
          spaceZ: spaceZTotal,
          detailList: detailListTemp
        },
        insured: {
          useInsured: 0,
          insuredValue: 0
        },
        service: {
          serviceType: selectDelivery.serviceType[0].serviceType,
          serviceName: selectDelivery.serviceType[0].serviceName,
        },
        addSource: 0,
        orderId: '01234567890',
        deliveryId: selectDelivery.deliveryId,
        bizId: selectDelivery.bizId,
        customRemark: trEntity.remark
      }

      wx.cloud.callFunction({
        name: 'AddTransferOrder',
        data: {
          item: orderEntity
        }
      }).then(res => {
        let backOrderEntity = res.result
        if (backOrderEntity.errCode) {
          wx.hideLoading({
            success: (res) => {
              wx.showModal({
                title: '出错了 ' + backOrderEntity.errCode,
                content: backOrderEntity.errMsg,
                success: function () {

                }
              })
            }

          })

        } else {
          let _id = backOrderEntity.orderId
          wx.showToast({
            title: '生成运单成功',
          })
          //更新订单状态
          let updateEntity = {
            waybillId: backOrderEntity.waybillId,
            waybillData: backOrderEntity.waybillData,
            transferErrMsg: backOrderEntity.errMsg,
            transferErrCodde: backOrderEntity.errCode,
            status: '待收货'
          }
          wx.cloud.callFunction({
            name: "EditItem",
            data: {
              _id: _id,
              collectionName: "order",
              item: updateEntity
            }
          }).then(res => {
            //更新订单状态
            wx.reLaunch({
              url: '/pages/order-manage/index',
            })
          })
        }

      })
    })

    this.setData({
      show: false
    });
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