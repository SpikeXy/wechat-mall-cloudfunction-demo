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
  console.log(openid)
  var userInfoEntity =await db.collection('user')
  .where({
    userId:  openid
  })
  .limit(1)
  .get()
  .then(res=>{
    return res.data;
  });

  return userInfoEntity
}