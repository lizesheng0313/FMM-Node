// 引入依赖库
// const { Payment } = require('wechatpay-node-v3');
// const md5 = require('md5');
// const xml2js = require('xml2js');
// const path = require('path');

// // 配置项
// const config = {
//   mchid: '商户号',
//   partnerKey: 'API 密钥',
//   publicKeyPath: path.resolve(__dirname, '../public.pem'),
//   privateKeyPath: path.resolve(__dirname, '../private.pem'),
// };

// // 初始化支付实例
// const payment = new Payment(config);

// // 支付接口
// async function pay(ctx) {
//   const { openid, totalFee } = ctx.request.body;

//   // 构建订单参数
//   const order = {
//     appid: '公众号 appid',
//     mchid: config.mchid,
//     description: '商品描述',
//     out_trade_no: '商户订单号',
//     notify_url: '支付结果通知地址',
//     amount: {
//       total: totalFee,
//       currency: 'CNY',
//     },
//     payer: {
//       openid,
//     },
//   };

//   // 调用微信支付 API
//   const { prepay_id } = await payment.v3.payTransactionsNative(order);

//   // 生成支付签名
//   const timeStamp = String(Date.now());
//   const nonceStr = String(Math.random());
//   const packageStr = `prepay_id=${prepay_id}`;
//   const signType = 'MD5';
//   const paySign = md5(`appId=${order.appid}&nonceStr=${nonceStr}&package=${packageStr}&signType=${signType}&timeStamp=${timeStamp}&key=${config.partnerKey}`).toUpperCase();

//   // 返回支付参数
//   ctx.body = {
//     timeStamp,
//     nonceStr,
//     package: packageStr,
//     signType,
//     paySign,
//     prepayId: prepay_id,
//   };
// }

// // 微信支付结果通知接口
// async function notify(ctx) {
//   // 将请求体解析为 XML
//   const xml = await new Promise((resolve, reject) => {
//     let buffer = '';
//     ctx.req.setEncoding('utf8');
//     ctx.req.on('data', (chunk) => {
//       buffer += chunk;
//     });
//     ctx.req.on('end', () => {
//       resolve(buffer);
//     });
//   });

//   // 将 XML 解析为 JSON
//   const parser = new xml2js.Parser({ explicitArray: false });
//   const result = await new Promise((resolve, reject) => {
//     parser.parseString(xml, (err, result) => {
//       if (err) reject(err);
//       resolve(result);
//     });
//   });

//   // 校验签名
//   const isSignValid = payment.v3.validateSign(result);

//   if (isSignValid) {
//     // 处理支付结果
//     const { resource } = result;
//     console.log('支付结果', resource);
//   }

//   // 返回响应
//   ctx.status = 200;
//   ctx.body = {
//     code: 'SUCCESS',
//     message: '成功',
//   };
// }

// module.exports = {
//   pay,
//   notify,
// };
