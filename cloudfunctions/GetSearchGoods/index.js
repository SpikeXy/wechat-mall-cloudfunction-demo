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
  const name = event.name
  const pageIndex = parseInt(event.pageIndex) - 1
  const pageSize = parseInt(event.pageSize)
  const pageSumCount = pageIndex * pageSize
  // 数据库正则对象
  let data = await db.collection('good')
    .where({
      name: db.RegExp({
        regexp: name,
        options: 'i',
      })
    })
    .skip(pageSumCount)
    .limit(pageSize)
    .get()
    .then(res => {
      return res.data
    })
  return data

}