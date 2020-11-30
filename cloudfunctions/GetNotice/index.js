// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'aminah-g5t4h',
})
const db = cloud.database();
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  var noticeData = await db.collection('notice')
    .get()
    .then(res => {
      return res.data;
    });
    //这里开始对noticeData进行处理
    var tempArr = noticeData
    let totalPage = tempArr.length
    let totalRow = tempArr.length
    let dataList = tempArr
    let obj = {}
    obj.dataList = dataList
    obj.totalRow = totalRow
    obj.totalPage = totalPage
  return obj

}