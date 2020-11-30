const cloud = require('wx-server-sdk')
cloud.init()
exports.main = async (event, context) => {
  let item = event.item

  try {
    const result = await cloud.openapi.logistics.addOrder(item)
    return result
  } catch (err) {
    return err
  }
}