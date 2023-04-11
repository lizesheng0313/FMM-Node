/*
 * @Author: lizesheng
 * @Date: 2023-02-23 14:08:48
 * @LastEditors: lizesheng
 * @LastEditTime: 2023-04-11 14:52:21
 * @important: 重要提醒
 * @Description: 备注内容
 * @FilePath: /commerce_egg/app/controller/programOrder.js
 */
'use strict';

const { successMsg, errorMsg } = require('../../utils/utils')
const { Controller } = require('egg');
const crypto = require('crypto');

class ProgramOrderController extends Controller {
  // 创建订单
  async createOrder() {
    const { ctx, app } = this;
    const { goodsId, skuId, quantity, total_price, address_id, remark, goods_name, sku_string } = ctx.request.body
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
      const order_id = await generateOrderId(app)
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
        id: order_id
      }
      const result = await this.app.mysql.insert('goods_order', rows)
      if (result.affectedRows === 1) {
        await conn.commit();
        // 提交事务
        ctx.body = successMsg(
          order_id
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
        SUM(CASE WHEN pay_status = 0 AND order_status != 60 THEN 1 ELSE 0 END) as pending_payment_count,
        SUM(CASE WHEN order_status IN (10) AND pay_status = 1 THEN 1 ELSE 0 END) as pending_delivery_count,
        SUM(CASE WHEN order_status IN (20,21) AND pay_status = 1 THEN 1 ELSE 0 END) as shipped_order_count,
        SUM(CASE WHEN order_status IN (50) AND pay_status = 1 THEN 1 ELSE 0 END) as return_order_count
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
        go.goods_picture,
        go.goods_name,
        lo.logistics_company,
        lo.logistics_no,
        p.name as address_name,
        p.phone as address_phone,
        p.address as address_detail,
        p.province,
        p.city,
        p.streetName
      FROM goods_order go
      LEFT JOIN address p ON go.address_id = p.id
      LEFT JOIN logistics lo ON go.id = lo.order_id
      ${whereClause} AND ((go.is_deleted != 1 OR go.is_deleted IS NULL) AND go.user_id = '${ctx.user.user_id}' AND go.order_status != 50)
      ORDER BY go.id DESC
      LIMIT ${(pageIndex - 1) * pageSize}, ${pageSize}
    `;

    const countSql = `
      SELECT COUNT(*) as count
      FROM goods_order
      ${whereClause} AND (is_deleted != 1 OR is_deleted IS NULL)
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

  // 获取退货订单列表
  async getReturnOrder() {
    const { ctx } = this;
    const { pageIndex = 1, pageSize = 10 } = ctx.query
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
    o.quantity,
    lo.logistics_company,
    lo.logistics_no,
    p.name as address_name,
    p.phone as address_phone,
    p.address as address_detail,
    p.province,
    p.city,
    p.streetName
    (SELECT COUNT(*) FROM goods_order_return) AS total
  FROM goods_order_return r
    LEFT JOIN address p ON o.address_id = p.id
    LEFT JOIN logistics lo ON r.order_id = lo.order_id
    INNER JOIN goods_order o ON o.id = r.order_id
  WHERE
    o.user_id = '${ctx.user.user_id}'
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
    o.goods_picture
  ORDER BY
    r.refund_time DESC,
    r.status ASC
  LIMIT
    ${parseInt(pageSize)}
  OFFSET
  ${(pageIndex - 1) * pageSize}
`;
    let result = (await this.app.mysql.query(SQL)).map(item => ({
      ...item,
      picture_list: item.picture_list?.split(',')
    }));
    ctx.body = successMsg({
      list: result,
      total: result[0]?.total || 0,
      pageSize: pageSize,
      pageIndex
    });
  }
  // 获取退货详情
  async getReturnDetails() {
    const { ctx } = this;
    const { id } = ctx.query
    const SQL = `
      SELECT
      r.id,
      r.status,
      r.memo,
      r.return_address,
      r.logistics_no,
      r.logistics_company,
      r.picture_list,
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
      lo.logistics_no,
      (SELECT COUNT(*) FROM goods_order) AS total
    FROM goods_order_return r
      LEFT JOIN logistics lo ON r.order_id = lo.order_id
      INNER JOIN goods_order o ON o.id = r.order_id
      LEFT JOIN address p ON o.address_id = p.id
    WHERE
      o.user_id = '${ctx.user.user_id}' AND r.id = '${id}'
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
      o.goods_id,
      o.goods_name,
      o.goods_picture,
      p.name,
      p.phone,
      p.province,
      p.city,
      p.streetName,
      p.address
    ORDER BY
      r.refund_time DESC,
      r.status ASC
  `;
    let result = (await this.app.mysql.query(SQL)).map(item => ({
      ...item,
      picture_list: item.picture_list?.split(',')
    }));
    ctx.body = successMsg(result[0]);
  }
  // 获取订单详情
  async getOrderDetails() {
    const { ctx } = this;
    const { id } = ctx.query
    const SQL = `
      SELECT
        o.id,
        o.user_id,
        o.total_price,
        o.quantity,
        o.pay_status,
        o.payment_time,
        o.delivery_time,
        o.receive_time,
        o.create_time,
        o.goods_id,
        o.sku_string,
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
        p.address
      ORDER BY
        o.create_time DESC
    `;
    let result = (await this.app.mysql.query(SQL))
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
    ctx.body = successMsg()
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
    ctx.body = successMsg()
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
    if (!['30', '40'].includes(order.order_status)) {
      ctx.body = errorMsg('该订单不能申请退货');
      return;
    }

    await app.mysql.update('goods_order', { order_status: '50' }, {
      where: {
        id
      }
    })



    // 插入退货申请到数据库中
    await app.mysql.insert('goods_order_return', {
      user_id: ctx.user.user_id,
      order_id: id,
      memo,
      picture_list,
      reason,
      status: '1', // 初始状态为待审核
      apply_time: Date.now()
    });

    ctx.body = successMsg();
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
        id
      }
    })
    ctx.body = successMsg();
  }
  // 查看物流 
  async getLogistics() {
    const { ctx } = this;
    const { logistics_company, logistics_no } = ctx.request.body;
    if (logistics_company === 'YTO') {
      const reuslt = getYTOAddress(logistics_no)
      ctx.body = successMsg(reuslt)
    }
  }
}

module.exports = ProgramOrderController;


// 生成订单id
async function generateOrderId(app) {
  const ORDER_ID_LENGTH = 20; // 订单号长度

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
    orderId = 'AM' + timeString + randomString;
    console.log('生成的', orderId)
    // 查询数据库中是否已存在该订单号

    const sql = 'SELECT COUNT(*) as count FROM goods_order WHERE id = ?';
    result = await app.mysql.query(sql, [orderId]);
  } while (result.count > 0 || orderId.length !== ORDER_ID_LENGTH);

  // 返回生成的订单号
  return orderId;
}

// 获取圆通快递
async function getYTOAddress(logistics_no) {
  const apiUrl = 'https://openuat.yto56test.com:6443/open/track_query_adapter/v1/UQtclI/TEST'; // API接口
  const appKey = 'your_app_key';
  const appSecret = 'your_app_secret';
  const data = 'TESTtrack_query_adapterv1'
  const sign = generateSign(appKey, appSecret, data);

  const requestData = {
    sign,
    timestamp: Date.now(),
    param: {
      Number: logistics_no
    },
    format: 'JSON'
  }


  const response = await this.ctx.curl(apiUrl, {
    method: 'POST',
    dataType: 'json',
    data: requestData,
  });

  return response;
}

function generateSign(appKey, appSecret, data) {
  const content = JSON.stringify(data);
  const md5 = crypto.createHash('md5').update(content).digest('hex');
  const plainText = `${md5}${appKey}${appSecret}`;
  const sign = Buffer.from(plainText).toString('base64');
  return sign;
}

