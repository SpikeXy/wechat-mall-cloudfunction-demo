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
  const pageIndex = parseInt( event.pageIndex )  - 1
  const pageSize =  parseInt( event.pageSize )
  const pageSumCount = pageSize * pageIndex
  const orderByField = event.orderByField
  if(isUseUserId){
    factor.userId = openid
  }
  var noticeData = await db.collection(collectionName)
    .where(factor)
    .orderBy(orderByField ,'desc')
    .skip(pageSumCount)
    .limit(pageSize)
    .get()
    .then(res => {
      return res.data;
    });
   
  return noticeData

}