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


  const userInfoEntity = event.userInfoEntity

  var re = await db.collection('user')
    .add({
      data: {
        userId: openid,
        createdDate: Date.parse(new Date()),
        nickName: userInfoEntity.nickName,
        avatarUrl: userInfoEntity.avatarUrl,
        gender: userInfoEntity.gender
      }
    })
    .then(res => {

      return 1;
    })
    .catch(res => {

      return 0
    });
 
  return re
}
