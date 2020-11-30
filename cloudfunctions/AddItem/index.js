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
  const item = event.item
  const isUseUserId = event.isUseUserId
  if(isUseUserId){
    item.userId = openid
  }
  const collectionName = event.collectionName
  return await db.collection(collectionName)
  .add({
    data: item
  })
  .then(res => {

    return res;
  })
  .catch(res => {

    return ""
  });

}