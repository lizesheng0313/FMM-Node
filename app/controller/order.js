/*
 * @Author: lizesheng
 * @Date: 2023-02-23 14:08:48
 * @LastEditors: lizesheng
 * @LastEditTime: 2023-05-06 10:27:54
 * @important: 重要提醒
 * @Description: 备注内容
 * @FilePath: /commerce_egg/app/controller/order.js
 */
'use strict';
const { successMsg, errorMsg } = require('../../utils/utils');
const { Controller } = require('egg');
const { ORDERSTATUS, PAYSTATUS, RETURNSTATUS } = require('../../const/index');

class OrderController extends Controller {
  // 删除订单
  async deleteGoodsInfo() {
    const { ctx } = this;
    const { id } = ctx.request.body;
    const SQL = `DELETE g, p FROM goods g LEFT JOIN goods_picture_list p ON o.id = p.goodsId WHERE o.id = ${id}`;
    const result = await this.app.mysql.query(SQL);
    if (result.affectedRows > 0) {
      ctx.body = successMsg();
    }
  }
  // 发货并更改订单状态
  async shipGoods() {
    const { ctx } = this;
    const { id, logistics_company, logistics_no, address_phone, user_id } = ctx.request.body;
    const order = await this.app.mysql.get('goods_order', { id });
    if (order.order_status === '10' && order.pay_status === '1') {
      const token = await ctx.app.mysql.get('token', { id: 1 });
      const logistic_no = await ctx.curl(`https://api.weixin.qq.com/cgi-bin/express/delivery/open_msg/trace_waybill?access_token=${token.access_token}`, {
        method: 'POST',
        headers: {
          'Content-type': 'application/json',
        },
        data: {
          openid: user_id,
          delivery_id: logistics_company,
          receiver_phone: address_phone,
          waybill_id: logistics_no,
          trans_id: order.trans_id,
          goods_info: {
            detail_list: [
              {
                goods_name: order.goods_name,
                goods_img_url: order.goods_picture
              }
            ]
          }
        }
      });
      const bufferData = Buffer.from(logistic_no?.data)
      const dataStr = bufferData.toString('utf8');
      const dataObj = JSON.parse(dataStr);
      ctx.logger.info(dataObj, '----传单')
      const rows = {
        waybill_token: dataObj?.data?.waybill_token,
        order_id: id,
        logistics_company,
        logistics_no,
        create_time: Date.now(),
      };

      const result = await this.app.mysql.insert('logistics', rows);
      await this.app.mysql.update('goods_order', { order_status: '20' }, {
        where: {
          id,
        },
      });
      if (result.affectedRows > 0) {
        ctx.body = successMsg();
      }
    } else {
      ctx.body = errorMsg('当前状态不是待发货状态', {
        order_status: order.order_status,
      });
    }
  }
  // 获取运力id列表
  async getLogList() {
    const { ctx } = this;
    const token = await ctx.app.mysql.get('token', { id: 1 });
    const result = await ctx.curl(`https://api.weixin.qq.com/cgi-bin/express/delivery/open_msg/get_delivery_list?access_token=${token.access_token}`, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
      },
      data: {}
    });
    ctx.logger.info('微信运力接口', result)
    const bufferData = Buffer.from(result?.data)
    const dataStr = bufferData.toString('utf8');
    const dataObj = JSON.parse(dataStr);
    ctx.body = successMsg(dataObj)
  }
  // 获取订单列表
  async getOrder() {
    const { ctx } = this;
    const role = ctx.user.role;
    const { pageIndex = 1, pageSize = 10, payStatus = null, orderStatus = null, orderId = null, username = null } = ctx.query;
    let whereClause = '';
    if (payStatus) {
      whereClause += ` AND pay_status = '${payStatus}'`;
    }
    if (orderStatus) {
      whereClause += ` AND order_status = '${orderStatus}'`;
    }
    if (orderId) {
      whereClause += ` AND o.id = '${orderId}'`;
    }
    if (username) {
      whereClause += ` AND p.name = '${username}'`;
    }
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
        g.name,
        g.href,
        o.order_status,
        ${role === '0' || role === '1' ? 'o.cost_price,' : ''}
        o.response_price,
        o.address_id,
        o.sku_id,
        o.goods_picture,
        p.name AS address_name,
        p.phone AS address_phone,
        p.address AS address_detail,
        p.province,
        p.city,
        p.streetName,
        (SELECT COUNT(*) FROM goods_order) AS total
      FROM
        goods_order o
        LEFT JOIN address p ON o.address_id = p.id
        INNER JOIN goods g ON o.goods_id = g.id
      WHERE
        1 = 1 ${whereClause} 
      GROUP BY
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
        g.name,
        g.href,
        o.order_status,
        o.cost_price,
        o.response_price,
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
      LIMIT
        ${parseInt(pageSize)}
      OFFSET
        ${(pageIndex - 1) * pageSize}
    `;
    const result = (await this.app.mysql.query(SQL)).map(item => ({
      ...item,
      order_status_str: ORDERSTATUS[item.order_status],
      pay_status_str: PAYSTATUS[item.pay_status],
    }));
    ctx.body = successMsg({
      list: result,
      total: result[0]?.total || 0,
      pageSize,
      pageIndex,
    });
  }
  // 获取退货订单列表
  async getReturnOrder() {
    const { ctx } = this;
    const role = ctx.user.role;
    const { pageIndex = 1, pageSize = 10, returnStatus = null, orderId = null, username = null } = ctx.query;
    let whereClause = '';
    if (returnStatus) {
      whereClause += ` AND status = '${returnStatus}'`;
    }
    if (orderId) {
      whereClause += ` AND r.order_id = '${orderId}'`;
    }
    if (username) {
      whereClause += ` AND p.name = '${username}'`;
    }
    const SQL = `
      SELECT
      r.id,
      r.status,
      r.memo,
      r.picture_list,
      r.order_id,
      r.apply_time,
      r.approve_time,
      r.return_receive_time,
      r.refund_time,
      r.reason,
      ${role === '0' || role === '1' ? 'o.cost_price,' : ''}
      o.user_id,
      o.total_price,
      o.quantity,
      o.pay_status,
      o.response_price,
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
      p.name AS address_name,
      p.phone AS address_phone,
      p.address AS address_detail,
      p.province,
      p.city,
      p.streetName,
      (SELECT COUNT(*) FROM goods_order_return) AS total
    FROM
    goods_order_return r
      INNER JOIN goods_order o ON o.id = r.order_id
      INNER JOIN goods g ON o.goods_id = g.id
      INNER JOIN address p ON o.address_id = p.id
    WHERE
      1 = 1 ${whereClause}
      GROUP BY
      r.id,
      r.status,
      r.memo,
      r.picture_list,
      r.order_id,
      r.apply_time,
      r.approve_time,
      r.return_receive_time,
      r.refund_time,
      r.reason,
      o.id,
      o.user_id,
      o.total_price,
      o.quantity,
      o.pay_status,
      o.response_price,
      o.payment_time,
      o.delivery_time,
      o.receive_time,
      o.create_time,
      o.goods_id,
      g.name,
      g.href,
      o.order_status,
      o.cost_price,
      o.address_id,
      o.sku_id,
      o.goods_picture,
      p.name,
      p.phone,
      p.address
    ORDER BY
      r.apply_time DESC,
      r.status ASC
    LIMIT
      ${parseInt(pageSize)}
    OFFSET
    ${(pageIndex - 1) * pageSize}
  `;
    const result = (await this.app.mysql.query(SQL)).map(item => ({
      ...item,
      order_status_str: ORDERSTATUS[item.order_status],
      order_return_status_start: RETURNSTATUS[item.status],
      picture_list: item.picture_list?.split(','),
    }));
    ctx.body = successMsg({
      list: result,
      total: result[0]?.total || 0,
      pageSize,
      pageIndex,
    });
  }
  // 同意退货
  async goodsAgreenOperation() {
    const { ctx, app } = this;
    const { id, return_address } = ctx.request.body;
    const agreeData = await app.mysql.get('goods_order_return', { id });
    const order = await app.mysql.get('goods_order', { id: agreeData.order_id });
    ctx.logger.info(order, '同意退货的order')

    if (!['50'].includes(order.order_status)) {
      ctx.body = errorMsg('该订单状态不在退货中');
      return;
    }
    if (agreeData.status !== '1') {
      ctx.body = errorMsg('未在审核状态');
      return;
    }
    const result = await app.mysql.update('goods_order_return', { status: 2, return_address }, {
      where: {
        id,
      },
    });
    if (result.affectedRows === 1) {
      ctx.body = successMsg();
    }
  }
  // 拒绝退货
  async goodsRefuseOperation() {
    const { ctx, app } = this;
    const { id, reason } = ctx.request.body;
    const agreeData = await app.mysql.get('goods_order_return', { id });
    const order = await app.mysql.get('goods_order', { id: agreeData.order_id });
    if (!['50'].includes(order.order_status)) {
      ctx.body = errorMsg('该订单状态不在退货中');
      return;
    }
    if (agreeData.status !== '1') {
      ctx.body = errorMsg('未在审核状态');
      return;
    }
    const result = await this.app.mysql.update('goods_order_return', { status: '3', refuse_reason: reason }, {
      where: {
        id,
      },
    });
    if (result.affectedRows === 1) {
      ctx.body = successMsg();
    }
  }
  // 已收到货
  async receivedGoods() {
    const { ctx, app } = this;
    const { id } = ctx.request.body;
    const agreeData = await app.mysql.get('goods_order_return', { id });
    const order = await app.mysql.get('goods_order', { id: agreeData.order_id });

    // 只有退货中才可以收货
    if (!['50'].includes(order.order_status)) {
      ctx.body = errorMsg('该订单不能收货');
      return;
    }
    if (agreeData.status !== '4') {
      ctx.body = errorMsg('用户还未开始退货');
      return;
    }

    // 开启事务
    const conn = await app.mysql.beginTransaction();

    try {
      await conn.update('goods_order_return', { status: '20' }, { where: { id } });
      await conn.update('goods_order', { order_status: '80' }, { where: { id: agreeData.order_id } });

      // 提交事务
      await conn.commit();

      ctx.body = successMsg();
    } catch (err) {
      // 回滚事务
      await conn.rollback();
      throw err;
    }
  }

  // 同意退款
  async approveRefund() {
    const { ctx, app } = this;
    const { id } = ctx.request.body;
    const agreeData = await app.mysql.get('goods_order_return', { id });
    const order = await app.mysql.get('goods_order', { id: agreeData.order_id });

    if (!agreeData) {
      ctx.body = errorMsg('退货记录不存在');
      return;
    }

    // 检查退货记录状态是否为待退货而且不为待退款
    if (agreeData.status !== '6' && agreeData.status !== '20') {
      ctx.body = errorMsg('还未收到货不允许退款');
      return;
    }

    if (!['80'].includes(order.order_status)) {
      ctx.body = errorMsg('该订单状态不在退款中');
      return;
    }
    // 更新退货记录状态为已退款
    await app.mysql.update('goods_order_return', { id, status: '5', refund_time: Date.now() });

    // 更新订单状态为已退款
    await app.mysql.update('goods_order', { id: agreeData.order_id, order_status: '90' });
    ctx.body = successMsg();

  }

  // 生成订单id
  async generateOrderId() {
    const ORDER_ID_LENGTH = 20; // 订单号长度

    let orderId;
    let isExist;

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
      orderId = timeString + randomString;

      // 查询数据库中是否已存在该订单号
      isExist = await this.ctx.model.GoodsOrder.findOne({
        where: { id: orderId },
      });
    } while (isExist || orderId.length !== ORDER_ID_LENGTH);

    // 返回生成的订单号
    return orderId;
  }
}


module.exports = OrderController;
