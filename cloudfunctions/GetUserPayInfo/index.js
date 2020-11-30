// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'aminah-g5t4h',
})
// 1. 获取数据库引用
const db = cloud.database();
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  var openid = wxContext.OPENID
  //openId 用户的唯一标识

  //待支付
  var count_id_no_pay = await db.collection('order')
    .where({
      userId: openid,
      status: '待支付'
    }).count()
    .then(res => {
      return res.total
    })

  //待发货
  var count_id_no_transfer = await db.collection('order')
    .where({
      userId: openid,
      status: '待发货'
    }).count()
    .then(res => {
      return res.total
    })
  //待收货
  var count_id_no_confirm = await db.collection('order')
    .where({
      userId: openid,
      status: '待收货'
    }).count()
    .then(res => {
      return res.total
    })
  //待评价
  var count_id_no_reputation = await db.collection('order')
    .where({
      userId: openid,
      status: '待评价'
    }).count()
    .then(res => {
      return res.total
    })

  var data = {}
  data.count_id_no_pay = count_id_no_pay
  data.count_id_no_transfer = count_id_no_transfer
  data.count_id_no_confirm = count_id_no_confirm
  data.count_id_no_reputation = count_id_no_reputation
  return data
}