const CONFIG = require('config.js')
const AUTH = require('utils/auth')
App({
  onLaunch: function() {

    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        env: 'aminah-g5t4h',
        traceUser: true,
      })
    }


    const that = this;
    // 检测新版本
    const updateManager = wx.getUpdateManager()
    updateManager.onUpdateReady(function () {
      wx.showModal({
        title: '更新提示',
        content: '新版本已经准备好，是否重启应用？',
        success(res) {
          if (res.confirm) {
            // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
            updateManager.applyUpdate()
          }
        }
      })
    })
    /**
     * 初次加载判断网络情况
     * 无网络状态下根据实际情况进行调整
     */
    wx.getNetworkType({
      success(res) {
        const networkType = res.networkType
        if (networkType === 'none') {
          that.globalData.isConnected = false
          wx.showToast({
            title: '当前无网络',
            icon: 'loading',
            duration: 2000
          })
        }
      }
    });
    /**
     * 监听网络状态变化
     * 可根据业务需求进行调整
     */
    wx.onNetworkStatusChange(function(res) {
      if (!res.isConnected) {
        that.globalData.isConnected = false
        wx.showToast({
          title: '网络已断开',
          icon: 'loading',
          duration: 2000
        })
      } else {
        that.globalData.isConnected = true
        wx.hideToast()
      }
    })
  },

  onShow (e) {
    // 保存邀请人
    // if (e && e.query && e.query.inviter_id) {
    //   wx.setStorageSync('referrer', e.query.inviter_id)
    //   if (e.shareTicket) {
    //     wx.getShareInfo({
    //       shareTicket: e.shareTicket,
    //       success: res => {

    //       }
    //     })
    //   }
    // }
    // 自动登录
    AUTH.checkHasLogined().then(async isLogined => {
      if (!isLogined) {
        AUTH.login()
      } else {
        AUTH.getUserInfo().then((res) => {
          const { userInfo } = res
        })
      }
    })
  },
  globalData: {
    isConnected: true
  }
})