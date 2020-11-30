const cloud = require('wx-server-sdk')
cloud.init()

exports.main = async (event, context) => {
  try {
    const result = await cloud.openapi.logistics.getAllAccount({})
    return result
  } catch (err) {
    return err
  }
}