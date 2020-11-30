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
  const collectionName = event.collectionName
  const factor = event.factor
  const openid = wxContext.OPENID
  const isUseUserId = event.isUseUserId
  if(isUseUserId){
    factor.userId = openid
  }
  try {
    return await db.collection(collectionName)
    .where(factor)
    .remove()
    .then(res => {
      return 1;
    });
  }catch(e){
    return 0;
  }

}