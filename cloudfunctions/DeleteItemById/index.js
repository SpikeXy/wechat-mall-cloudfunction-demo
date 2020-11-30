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
  const openid = wxContext.OPENID
  const _id = event._id
  const collectionName = event.collectionName

  var re = await db.collection(collectionName)
    .doc(_id)
    .remove()
    .then(res => {

      return 1;
    })
    .catch(res => {

      return 0
    });
 
  return re
}
