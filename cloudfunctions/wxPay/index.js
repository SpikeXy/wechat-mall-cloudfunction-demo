const key = "xxxxx" //换成你的商户key，32位,支付配置
const mch_id = "xxxxxx" //换成你的商户号,支付配置

//以下全部照抄即可
const cloud = require('wx-server-sdk')
const rp = require('request-promise')
const crypto = require('crypto')
cloud.init()

function getSign(args) {
  let sa = []
  for (let k in args) sa.push(k + '=' + args[k])
  sa.push('key=' + key)
  return crypto.createHash('md5').update(sa.join('&'), 'utf8').digest('hex').toUpperCase()
}

function getXml(args) {
  let sa = []
  for (let k in args) sa.push('<' + k + '>' + args[k] + '</' + k + '>')
  sa.push('<sign>' + getSign(args) + '</sign>')
  return '<xml>' + sa.join('') + '</xml>'
}

exports.main = async(event, context) => {
  const wxContext = cloud.getWXContext()
  const appId = appid = wxContext.APPID
  const openid = wxContext.OPENID
  const total_fee =  event.totalPrice 

  const attach = 'attach'
  const body = 'body'
  const notify_url = "https://mysite.com/notify"
  const spbill_create_ip = "118.89.40.200"
  const nonceStr = nonce_str = Math.random().toString(36).substr(2, 15)
  const timeStamp = parseInt(Date.now() / 1000) + ''
  const out_trade_no = "otn" + nonce_str + timeStamp
  const trade_type = "JSAPI"
  const xmlArgs = {
    appid,
    attach,
    body,
    mch_id,
    nonce_str,
    notify_url,
    openid,
    out_trade_no,
    spbill_create_ip,
    total_fee,
    trade_type
  }
  let xmlArgsStr = getXml(xmlArgs)
  let xml = (await rp({
    url: "https://api.mch.weixin.qq.com/pay/unifiedorder",
    method: 'POST',
    body: xmlArgsStr
  })).toString("utf-8")
  if (xml.indexOf('prepay_id') < 0) return xml
  let startIndex = xml.indexOf('prepay_id') + ("prepay_id".length+10)
  let endIndex = xml.lastIndexOf('prepay_id') - 5
  let prepay_id = xml.slice(startIndex,endIndex)
  let payArgs = {
    appId,
    nonceStr,
    package: ('prepay_id=' + prepay_id),
    signType: 'MD5',
    timeStamp
  }
  return { 
    ...payArgs,
    paySign: getSign(payArgs)
  }
}