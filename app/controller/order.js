/*
 * @Author: lizesheng
 * @Date: 2023-02-23 14:08:48
 * @LastEditors: lizesheng
 * @LastEditTime: 2023-04-02 12:42:12
 * @important: 重要提醒
 * @Description: 备注内容
 * @FilePath: /commerce_egg/app/controller/order.js
 */
'use strict';
const { successMsg } = require('../../utils/utils')
const { Controller } = require('egg');
const { ORDERSTATUS, PAYSTATUS, RETURNSTATUS } = require('../../const/index')

class OrderController extends Controller {
  // 创建订单
  async createOrder() {
    const { ctx } = this;
    const { pictureList, sku } = ctx.request.body
    const orderId = generateOrderId()
    if (result.affectedRows === 1) {
      ctx.body = successMsg();
    }
  }
  // 删除订单
  async deleteGoodsInfo() {
    const { ctx } = this
    const { id } = ctx.request.body
    const SQL = `DELETE g, p FROM goods g LEFT JOIN goods_picture_list p ON o.id = p.goodsId WHERE o.id = ${id}`
    const result = await this.app.mysql.query(SQL)
    if (result.affectedRows > 0) {
      ctx.body = successMsg();
    }
  }
  // 发货并更改订单状态
  async shipGoods() {
    const { ctx } = this
    const { id, logistics_company, logistics_no } = ctx.request.body
    const rows = {
      order_id: id,
      logistics_company,
      logistics_no,
      create_time: Date.now()
    }
    const result = await this.app.mysql.insert('logistics', rows)
    await this.app.mysql.update('goods_order', { order_status: 1 }, {
      where: {
        id
      }
    })
    if (result.affectedRows > 0) {
      ctx.body = successMsg();
    }
  }
  // 获取订单列表
  async getOrder() {
    const { ctx } = this;
    const role = ctx.user.role
    const { pageIndex = 1, pageSize = 10, payStatus = null, orderStatus = null, orderId = null, username = null } = ctx.query
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
    let result = (await this.app.mysql.query(SQL)).map(item => ({
      ...item,
      order_status_str: ORDERSTATUS[item.order_status],
      pay_status_str: PAYSTATUS[item.pay_status],
    }));
    ctx.body = successMsg({
      list: result,
      total: result[0]?.total || 0,
      pageSize: pageSize,
      pageIndex
    });
  }
  // 获取退货订单列表
  async getReturnOrder() {
    const { ctx } = this;
    const role = ctx.user.role
    const { pageIndex = 1, pageSize = 10, returnStatus = null, orderStatus = null, orderId = null, username = null } = ctx.query
    let whereClause = '';
    if (returnStatus) {
      whereClause += ` AND status = '${returnStatus}'`;
    }
    if (orderId) {
      whereClause += ` AND o.id = '${orderId}'`;
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
      (SELECT COUNT(*) FROM goods_order) AS total
    FROM
      goods_order o
      LEFT JOIN address p ON o.address_id = p.id
      INNER JOIN goods g ON o.goods_id = g.id
      LEFT JOIN goods_order_return r ON o.id = r.order_id
    WHERE
      1 = 1 ${whereClause} AND o.order_status = 4
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
    let result = (await this.app.mysql.query(SQL)).map(item => ({
      ...item,
      order_status_str: ORDERSTATUS[item.order_status],
      order_return_status_start: RETURNSTATUS[item.status],
      picture_list: item.picture_list?.split(',')
    }));
    ctx.body = successMsg({
      list: result,
      total: result[0]?.total || 0,
      pageSize: pageSize,
      pageIndex
    });
  }
  // 同意退货
  async goodsAgreenOperation() {
    const { ctx } = this
    const { id, return_address } = ctx.request.body
    const result = await this.app.mysql.update('goods_order_return', { status: 2, return_address }, {
      where: {
        id
      }
    })
    if (result.affectedRows === 1) {
      ctx.body = successMsg();
    }
  }
  // 拒绝退货
  async goodsRefuseOperation() {
    const { ctx } = this
    const { id, reason } = ctx.request.body
    const result = await this.app.mysql.update('goods_order_return', { status: 3, reason }, {
      where: {
        id
      }
    })
    if (result.affectedRows === 1) {
      ctx.body = successMsg();
    }
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
