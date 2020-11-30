// 云函数入口文件
const cloud = require('wx-server-sdk')
let appid = ""
let appsecert = ""
cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  var phoneData = event.phoneData
  return phoneData
}