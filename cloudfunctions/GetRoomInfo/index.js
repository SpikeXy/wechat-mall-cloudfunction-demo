// 云函数入口文件

const appid = ''
const appsecert = ''

const cloud = require('wx-server-sdk')

cloud.init()

const rp = require('request-promise')

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const token = event.accessToken

  const requestUrlHead = 'https://api.weixin.qq.com/wxa/business/getliveinfo?access_token='+token

let content = (await rp({
    url: requestUrlHead,
    method: 'POST',
    body: {
      "start": 0,
      "limit": 10 
    },
    json:true
  }))
  return content
}