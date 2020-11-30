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
  const goodIds = event.goodIds
  const openid = wxContext.OPENID
  try {
    return await db.collection('cart')
    .where({
      userId: openid,
      goodId : _.in(goodIds)
    })
    .remove()
    .then(res => {
      return 1;
    });
  }catch(e){
    return 0;
  }

}