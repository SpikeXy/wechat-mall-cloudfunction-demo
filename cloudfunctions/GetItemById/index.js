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
  var _id = event.id
  const collectionName = event.collectionName
  var noticeData = await db.collection(collectionName)
    .doc(_id)
    .get()
    .then(res => {
      return res.data;
    });
   
  return noticeData

}