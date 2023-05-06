/*
 * @Author: lizesheng
 * @Date: 2023-02-23 14:08:48
 * @LastEditors: lizesheng
 * @LastEditTime: 2023-05-06 11:25:29
 * @important: 重要提醒
 * @Description: 备注内容
 * @FilePath: /commerce_egg/app/controller/programOrder.js
 */
'use strict';

const { successMsg, errorMsg } = require('../../utils/utils');
const { Controller } = require('egg');
const superagent = require('superagent');
const WxPay = require('wechatpay-node-v3');
const fs = require('fs');




class ProgramOrderController extends Controller {
  // 创建订单
  async createOrder() {
    const { ctx, app } = this;
    const { goodsId, skuId, quantity, total_price, address_id, remark, goods_name, sku_string, act_price } = ctx.request.body;
    // 悲观锁 控制库存
    const conn = await app.mysql.beginTransaction(); // 开启事务
    try {
      // 查询 SKU 表中的库存
      const sku = await conn.query('SELECT * FROM sku_goods WHERE skuId = ? AND goodsId = ? FOR UPDATE', [skuId, goodsId]);
      if ((sku[0].skuPrice * quantity).toFixed(2) !== total_price.toFixed(2)) {
        throw new Error('价格计算错误,请联系客服');
      }
      // 判断库存是否足够
      if (sku[0].skuStock < quantity) {
        throw new Error('库存不足');
      }
      // 减少库存
      await conn.query('UPDATE sku_goods SET skuStock = skuStock - ? WHERE skuId = ? AND goodsId = ?', [quantity, skuId, goodsId]);
      const order_id = await generateOrderId(app);
      const rows = {
        sku_string,
        goods_name,
        cost_price: sku[0].cost_price * quantity,
        goods_picture: sku[0].goods_picture,
        sku_id: skuId,
        goods_id: goodsId,
        quantity,
        remark,
        total_price,
        address_id,
        user_id: ctx.user.user_id,
        create_time: Date.now(),
        pay_status: 0,
        order_status: 10,
        id: order_id,
        freight: Number(act_price) - Number(total_price),
        act_price
      };
      const result = await this.app.mysql.insert('goods_order', rows);
      const info = await payInfo(order_id, goods_name, act_price, ctx.user.user_id, ctx)
      if (result.affectedRows === 1) {
        await conn.commit();
        // 提交事务
        ctx.body = successMsg(
          info
        );
      }
    } catch (error) {
      // 回滚事务
      await conn.rollback();
      throw error;
    }
  }
  // 获取订单数量
  async getOrderStatusCount(ctx) {
    const sql = `
      SELECT 
        SUM(CASE WHEN pay_status = 0 AND order_status != 60  THEN 1 ELSE 0 END) as pending_payment_count,
        SUM(CASE WHEN order_status IN (10) AND pay_status = 1 THEN 1 ELSE 0 END) as pending_delivery_count,
        SUM(CASE WHEN order_status IN (20,21) AND pay_status = 1 THEN 1 ELSE 0 END) as shipped_order_count,
        SUM(CASE WHEN order_status IN (50,80) AND pay_status = 1 THEN 1 ELSE 0 END) as return_order_count
      FROM goods_order
      WHERE user_id = ?
    `;
    const [rows] = await ctx.app.mysql.query(sql, [ctx.user.user_id]);
    ctx.body = successMsg(rows);
  }
  // 获取订单列表
  async getListStatus() {
    const { ctx } = this;
    let { pageIndex = 1, pageSize = 10, pay_status, order_status } = this.ctx.query;
    pageIndex = Number(pageIndex);
    pageSize = Number(pageSize);

    const conditions = [
      pay_status ? `pay_status = ${pay_status} AND order_status != 60` : null,
      order_status ? `order_status = ${order_status} AND pay_status = 1` : null,
    ].filter(Boolean);

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : 'WHERE 1=1';

    const listSql = `
      SELECT
        go.id,
        go.user_id,
        go.total_price,
        go.quantity,
        go.pay_status,
        go.goods_id,
        go.order_status,
        go.sku_id,
        go.goods_picture,
        go.goods_name,
        go.act_price,
        lo.logistics_company,
        lo.logistics_no,
        lo.waybill_token,
        p.name as address_name,
        p.phone as address_phone,
        p.address as address_detail,
        p.province,
        p.city,
        p.streetName
      FROM goods_order go
      LEFT JOIN address p ON go.address_id = p.id
      LEFT JOIN logistics lo ON go.id = lo.order_id
      ${whereClause} AND ((go.is_deleted != 1 OR go.is_deleted IS NULL) AND go.user_id = '${ctx.user.user_id}')
      ORDER BY go.id DESC
      LIMIT ${(pageIndex - 1) * pageSize}, ${pageSize}
    `;

    const countSql = `
      SELECT COUNT(*) as count
      FROM goods_order
      ${whereClause} AND ((is_deleted != 1 OR is_deleted IS NULL)  AND user_id = '${ctx.user.user_id}')
    `;

    const [list, [{ count }]] = await Promise.all([
      this.app.mysql.query(listSql),
      this.app.mysql.query(countSql),
    ]);

    ctx.body = successMsg({
      list,
      pageIndex,
      pageSize,
      total: count,
    });
  }
  // 获取订单详情
  async getOrderDetails() {
    const { ctx } = this;
    const { id } = ctx.query;
    const SQL = `
      SELECT
        o.id,
        o.user_id,
        o.total_price,
        o.quantity,
        o.pay_status,
        o.payment_time,
        o.delivery_time,
        o.freight,
        o.receive_time,
        o.create_time,
        o.goods_id,
        o.sku_string,
        o.act_price,
        g.name,
        g.href,
        o.order_status,
        o.address_id,
        o.sku_id,
        o.goods_picture,
        p.name AS address_name,
        p.phone AS address_phone,
        p.address AS address_detail,
        p.province,
        p.city,
        p.streetName,
        lo.logistics_company,
        lo.waybill_token,
        lo.logistics_no,
        (SELECT COUNT(*) FROM goods_order) AS total
      FROM
        goods_order o
        LEFT JOIN logistics lo ON o.id = lo.order_id
        LEFT JOIN address p ON o.address_id = p.id
        INNER JOIN goods g ON o.goods_id = g.id
      WHERE o.id = '${id}'
      GROUP BY
        o.id,
        o.sku_string,
        o.user_id,
        o.total_price,
        o.quantity,
        o.freight,
        o.pay_status,
        o.payment_time,
        o.delivery_time,
        o.receive_time,
        o.create_time,
        o.goods_id,
        g.name,
        g.href,
        o.order_status,
        o.address_id,
        o.sku_id,
        o.goods_picture,
        p.name,
        p.phone,
        p.province,
        p.city,
        p.streetName,
        p.address,
        lo.logistics_company,
        lo.waybill_token,
        lo.logistics_no
      ORDER BY
        o.create_time DESC
    `;
    const result = (await this.app.mysql.query(SQL));
    ctx.body = successMsg(result[0]);
  }
  // 获取退货订单列表
  async getReturnOrder() {
    const { ctx } = this;
    const { pageIndex = 1, pageSize = 10 } = ctx.query;
    const SQL = `
    SELECT
    r.id,
    r.status,
    r.picture_list,
    r.order_id,
    r.reason,
    r.refund_time,
    o.goods_name,
    o.goods_picture,
    o.user_id,
    o.total_price,
    o.address_id,
    o.quantity,
    o.order_status,
    lo.logistics_company,
    lo.logistics_no,
    lo.waybill_token,
    p.name as address_name,
    p.phone as address_phone,
    p.address as address_detail,
    p.province,
    p.city,
    p.streetName,
    (SELECT COUNT(*) FROM goods_order_return WHERE
    r.user_id = '${ctx.user.user_id}' ) AS total
  FROM goods_order_return r
    INNER JOIN goods_order o ON o.id = r.order_id
    LEFT JOIN logistics lo ON r.order_id = lo.order_id
    LEFT JOIN address p ON o.address_id = p.id
  WHERE
    r.user_id = '${ctx.user.user_id}'
    GROUP BY
    r.id,
    r.status,
    r.memo,
    r.picture_list,
    r.order_id,
    r.refund_time,
    r.reason,
    o.user_id,
    o.total_price,
    o.quantity,
    o.goods_name,
    o.address_id,
    o.order_status,
    o.goods_picture,
    lo.logistics_company,
    lo.waybill_token,
    lo.logistics_no,
    p.name,
    p.phone,
    p.province,
    p.city,
    p.streetName,
    p.address
  ORDER BY
    r.status ASC,
    r.refund_time DESC
  LIMIT
    ${parseInt(pageSize)}
  OFFSET
  ${(pageIndex - 1) * pageSize}
`;
    const result = (await this.app.mysql.query(SQL)).map(item => ({
      ...item,
      picture_list: item.picture_list?.split(','),
    }));
    ctx.body = successMsg({
      list: result,
      total: result[0]?.total || 0,
      pageSize,
      pageIndex,
    });
  }
  // 获取退货详情
  async getReturnDetails() {
    const { ctx } = this;
    const { id } = ctx.query;
    const SQL = `
      SELECT
      r.id,
      r.status,
      r.memo,
      r.return_address,
      r.rlogistics_no,
      r.rlogistics_company,
      r.picture_list,
      r.refuse_reason,
      r.order_id,
      r.reason,
      r.apply_time,
      r.approve_time,
      r.return_receive_time,
      r.refund_time,
      o.create_time,
      o.goods_name,
      o.goods_picture,
      o.goods_id,
      o.freight,
      o.act_price,
      o.sku_id,
      o.payment_time,
      o.order_status,
      o.pay_status,
      o.user_id,
      o.total_price,
      o.quantity,
      p.name as address_name,
      p.phone as address_phone,
      p.address as address_detail,
      p.province,
      p.city,
      p.streetName,
      lo.logistics_company,
      lo.waybill_token,
      lo.logistics_no,
      (SELECT COUNT(*) FROM goods_order) AS total
    FROM goods_order_return r
      INNER JOIN goods_order o ON o.id = r.order_id
      LEFT JOIN logistics lo ON r.order_id = lo.order_id
      LEFT JOIN address p ON o.address_id = p.id
    WHERE
      o.user_id = '${ctx.user.user_id}' AND r.id = '${id}'
      GROUP BY
      r.id,
      r.status,
      r.memo,
      r.refuse_reason,
      r.picture_list,
      r.order_id,
      r.refund_time,
      r.reason,
      o.user_id,
      o.total_price,
      o.quantity,
      o.sku_id,
      o.goods_id,
      o.order_status,
      o.freight,
      o.goods_name,
      o.act_price,
      o.pay_status,
      o.goods_picture,
      p.name,
      p.phone,
      p.province,
      p.city,
      p.streetName,
      p.address,
      lo.logistics_company,
      lo.waybill_token,
      lo.logistics_no
    ORDER BY
      r.refund_time DESC,
      r.status ASC
  `;
    const result = (await this.app.mysql.query(SQL)).map(item => ({
      ...item,
      picture_list: item.picture_list?.split(','),
    }));
    ctx.body = successMsg(result[0]);
  }
  // 取消订单
  async cancelOrder() {
    const { ctx } = this;
    const { id } = ctx.request.body; // 获取请求参数
    const order = await this.app.mysql.get('goods_order', { id }); // 获取订单信息
    // 判断订单是否满足取消条件
    if (!(order.pay_status === '0' && order.order_status === '10')) {
      ctx.body = errorMsg('订单不能取消');
      return;
    }
    // 更新订单状态为已取消
    const result = await this.app.mysql.update('goods_order', { id, order_status: '60', cancle_time: Date.now() });
    if (result.affectedRows !== 1) {
      ctx.body = errorMsg('订单取消失败');
      return;
    }
    ctx.body = successMsg();
  }
  // 确认收货
  async confirmReceipt() {
    const { ctx } = this;
    const { id } = ctx.request.body; // 获取请求参数
    const order = await this.app.mysql.get('goods_order', { id }); // 获取订单信息
    // 判断订单是否满足确认收货条件
    if (order.pay_status !== '1' || order.order_status !== '20') {
      ctx.body = errorMsg('订单不能确认收货');
      return;
    }
    // 更新订单状态为已收货
    const result = await this.app.mysql.update('goods_order', { id, order_status: '40', receive_time: Date.now() });
    if (result.affectedRows !== 1) {
      ctx.body = errorMsg('确认收货失败');
      return;
    }
    ctx.body = successMsg();
  }
  // 发起退货
  async returnGoods() {
    const { ctx, app } = this;
    const { id, memo, picture_list, reason } = ctx.request.body;

    // 检查订单是否存在
    const order = await app.mysql.get('goods_order', { id });
    if (!order) {
      ctx.body = errorMsg('订单不存在');
      return;
    }
    const returnOrder = await app.mysql.get('goods_order_return', { id });
    if (returnOrder) {
      ctx.body = errorMsg('该订单已经有过售后');
      return;
    }

    // 检查订单状态是否为“已完成”或“退货中”
    if (!['20', '30', '40'].includes(order.order_status)) {
      ctx.body = errorMsg('该订单状态已发生变化暂不能申请退货');
      return;
    }

    await app.mysql.update('goods_order', { order_status: '50' }, {
      where: {
        id,
      },
    });
    // 插入退货申请到数据库中
    const result = await app.mysql.insert('goods_order_return', {
      user_id: ctx.user.user_id,
      order_id: id,
      memo,
      picture_list,
      reason,
      status: '1', // 初始状态为待审核
      apply_time: Date.now(),
    });
    ctx.body = successMsg(result.insertId);
  }
  // 删除订单
  async deleteOrder() {
    const { ctx, app } = this;
    const { id } = ctx.request.body;

    // 检查订单是否存在
    const order = await app.mysql.get('goods_order', { id });
    if (!order) {
      ctx.body = errorMsg('订单不存在');
      return;
    }

    // 检查订单状态，只有未支付的订单才能被删除
    if (!(order.order_status === '40' || order.order_status === '60')) {
      ctx.body = errorMsg('订单状态不允许删除');
      return;
    }
    // 删除订单记录
    await this.app.mysql.update('goods_order', { is_deleted: 1 }, {
      where: {
        id,
      },
    });
    ctx.body = successMsg();
  }
  // 
  // 查看物流
  async getLogistics() {
    const { ctx } = this;
    const { waybill_token } = ctx.request.body;
    ctx.logger.info('waybill_token=', waybill_token)
    const token = await ctx.app.mysql.get('token', { id: 1 });
    const result = await ctx.curl(`https://api.weixin.qq.com/cgi-bin/express/delivery/open_msg/query_trace?access_token=${token.access_token}`, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
      },
      data: {
        waybill_token
      }
    });
    ctx.logger.info(result, '----查看物流返回')
    const bufferData = Buffer.from(result?.data)
    const dataStr = bufferData.toString('utf8');
    const dataObj = JSON.parse(dataStr);
    ctx.logger.info(dataObj, '----二进制返回')
    ctx.body = successMsg(dataObj)
  }
  // 发起退货物流
  async postReturnLogistic() {
    const { ctx } = this;
    const { id, rlogistics_company, rlogistics_no } = ctx.request.body;
    const result = await this.app.mysql.update('goods_order_return', { status: '4', rlogistics_company, rlogistics_no }, {
      where: {
        id,
      },
    });
    if (result.affectedRows === 1) {
      ctx.body = successMsg();
    }
  }
  // 立即支付
  async payment() {
    const { ctx } = this
    const { order_id, name, act_price } = ctx.request.body;
    const info = await payInfo(order_id, name, act_price, ctx.user.user_id, ctx)
    ctx.body = successMsg(info);
  }
  // 支付回调
  async payNotify() {
    const { ctx, app } = this
    const pay = new WxPay({
      appid: 'wx67961123d36e6395',
      mchid: '1642887044',
      publicKey: fs.readFileSync(__dirname + '/../../app/assets/pem/apiclient_cert.pem'), // 公钥
      privateKey: fs.readFileSync(__dirname + '/../../app/assets/pem/apiclient_key.pem'), // 私钥
    });
    // 申请的APIv3
    const { ciphertext, associated_data, nonce } = ctx.request.body.resource;
    ctx.logger.info('进入支付回调', ctx.request.body)
    const key = '4VB2324AXSDEWSxceroq234923423423';
    // 解密回调信息
    const result = pay.decipher_gcm(ciphertext, associated_data, nonce, key);
    // 拿到订单号
    ctx.logger.info('-------------result结果', result)
    const { out_trade_no, amount } = result;
    if (result.trade_state == 'SUCCESS') {
      // 支付成功更改状态
      await app.mysql.update('goods_order', { trans_id: result.transaction_id, pay_status: '1', payment_time: Date.now(), response_price: amount.total / 100 }, {
        where: {
          id: out_trade_no,
        },
      });
    }
  }
  // 发起退款
  async applyRefund() {
    const { ctx, app } = this;
    const { id } = ctx.request.body;

    // 检查订单是否存在
    const order = await app.mysql.get('goods_order', { id });
    if (!order) {
      ctx.body = errorMsg('订单不存在');
      return;
    }
    // 检查订单状态
    if (!['10'].includes(order.order_status)) {
      ctx.body = errorMsg('该订单状态已发货 请在已发货列表处理');
      return;
    }
    await app.mysql.update('goods_order', { order_status: '80' }, {
      where: {
        id,
      },
    });
    // 插入退货申请到数据库中
    const result = await app.mysql.insert('goods_order_return', {
      user_id: ctx.user.user_id,
      order_id: id,
      status: '20', // 初始状态为待退款
      apply_time: Date.now(),
    });
    ctx.body = successMsg(result.insertId);
  }
}

module.exports = ProgramOrderController;

async function payInfo(out_trade_no, description, act_price, userId, ctx) {
  const pay = new WxPay({
    appid: 'wx67961123d36e6395',
    mchid: '1642887044',
    publicKey: fs.readFileSync(__dirname + '/../../app/assets/pem/apiclient_cert.pem'), // 公钥
    privateKey: fs.readFileSync(__dirname + '/../../app/assets/pem/apiclient_key.pem'), // 私钥
  });
  ctx.logger.info('商品信息加密', act_price, userId)
  const params = {
    description,
    out_trade_no,
    notify_url: 'https://zjkdongao.com/qq/api/order/payNotify',
    amount: {
      total: act_price * 100, // 单位是分
    },
    payer: {
      openid: userId,
    },
    scene_info: {
      payer_client_ip: 'ip',
    },
  };
  const info = await pay.transactions_jsapi(params)
  info.order_id = out_trade_no
  return info
}

// 生成订单id
async function generateOrderId(app) {
  const ORDER_ID_LENGTH = 21; // 订单号长度
  let orderId;
  let result;
  do {
    // 生成前14位时间串
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hour = date.getHours().toString().padStart(2, '0');
    const minute = date.getMinutes().toString().padStart(2, '0');
    const second = date.getSeconds().toString().padStart(2, '0');
    const timeString = year + month + day + hour + minute + second;
    // 生成后6位随机数
    const randomString = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    // 拼接生成订单号
    orderId = 'FMM' + timeString + randomString;
    // 查询数据库中是否已存在该订单号
    const sql = 'SELECT COUNT(*) as count FROM goods_order WHERE id = ?';
    result = await app.mysql.query(sql, [orderId]);
  } while (result.count > 0 || orderId.length !== ORDER_ID_LENGTH);
  // 返回生成的订单号
  return orderId;
}

