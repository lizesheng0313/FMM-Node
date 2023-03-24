/*
 * @Author: lizesheng
 * @Date: 2023-02-23 14:08:48
 * @LastEditors: lizesheng
 * @LastEditTime: 2023-03-22 13:38:30
 * @important: 重要提醒
 * @Description: 备注内容
 * @FilePath: /commerce_egg/app/controller/programOrder.js
 */
'use strict';
const { successMsg, errorMsg } = require('../../utils/utils')
const { Controller } = require('egg');

class ProgramOrderController extends Controller {
  // 创建订单
  async createOrder() {
    const { ctx } = this;
    const { goodsId, skuId, quantity } = ctx.request.body
    try {
      // 悲观锁 控制库存
      await buyGoods(goodsId, quantity, skuId)
      const rows = {
        ...ctx.request.body,
        user_id: ctx.user.user_id,
        create_time: Date.now(),
        pay_status: 0,
        id: generateOrderId()
      }
      const result = await this.app.mysql.insert('goods_order', rows)
      if (result.affectedRows === 1) {
        ctx.body = successMsg();
      }
    } catch (error) {
      ctx.body = errorMsg(error?.message);
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
  async buyGoods(goodsId, quantity, skuId) {
    const conn = await this.app.mysql.beginTransaction(); // 开启事务
    try {
      // 查询 SKU 表中的库存
      const sku = await conn.query('SELECT * FROM sku_goods WHERE skuId = ? AND goodsId = ? FOR UPDATE', [skuId, goodsId]);

      // 判断库存是否足够
      if (sku.skuStock < quantity) {
        throw new Error('库存不足');
      }

      // 减少库存
      await conn.query('UPDATE sku_goods SET skuStock = skuStock - ? WHERE skuId = ? AND goodsId = ?', [quantity, skuId, goodsId]);

      // 提交事务
      await conn.commit();

      return '购买成功';
    } catch (error) {
      // 回滚事务
      await conn.rollback();
      throw error;
    } finally {
      // 释放连接
      conn.release();
    }
  }
  // 获取订单数量
  async getOrderStatusCount(ctx) {
    const { userId } = ctx.user.user_id;
    const sql = `
      SELECT 
        SUM(CASE WHEN pay_status = 0 THEN 1 ELSE 0 END) as pending_payment_count,
        SUM(CASE WHEN order_status IN (0) THEN 1 ELSE 0 END) as pending_delivery_count,
        SUM(CASE WHEN order_status IN (1) THEN 1 ELSE 0 END) as shipped_order_count
        SUM(CASE WHEN order_status IN (4) THEN 1 ELSE 0 END) as return_order_count
      FROM goods_order
      WHERE user_id = ?
    `;
    const [rows] = await ctx.app.mysql.query(sql, [userId]);
    ctx.body = successMsg(rows[0]);
  }
  // 获取订单列表
  async getListStatus() {
    let { pageIndex = 1, pageSize = 10, pay_status, order_status } = this.ctx.query;
    pageIndex = Number(pageIndex);
    pageSize = Number(pageSize);

    const conditions = [
      pay_status !== undefined ? `pay_status = ${pay_status}` : null,
      order_status !== undefined ? `order_status = ${order_status}` : null,
    ].filter(Boolean);

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const sql = `
      SELECT SQL_CALC_FOUND_ROWS *
      FROM orders
      ${whereClause}
      ORDER BY id DESC
      LIMIT ${(pageIndex - 1) * pageSize}, ${pageSize};
      SELECT FOUND_ROWS() as count;
    `;

    const [[list], [{ count }]] = await this.app.mysql.query(sql);
    ctx.body = successMsg({
      list,
      pageIndex,
      pageSize,
      total: count,
    });
  }
}

module.exports = ProgramOrderController;
