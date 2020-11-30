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
  var categoryId = event.categoryId
  var pageSize = parseInt(event.pageSize)
  var pageIndex = parseInt(event.pageIndex) - 1
  var pageSumCount = pageSize * pageIndex

  var goodData = await db.collection('good')
    .where({
      categoryId: categoryId
    })
    .skip(pageSumCount)
    .limit(pageSize)
    .get()
    .then(res => {
      return res.data;
    });
  return goodData

}