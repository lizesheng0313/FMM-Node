/*
 * @Author: lizesheng
 * @Date: 2023-02-23 14:08:48
 * @LastEditors: lizesheng
 * @LastEditTime: 2023-03-06 15:01:23
 * @important: 重要提醒
 * @Description: 备注内容
 * @FilePath: /commerce_egg/app/controller/order.js
 */
'use strict';
const { successMsg } = require('../../utils/utils')
const { Controller } = require('egg');
const { ORDERSTATUS, PAYSTATUS } = require('../../const/index')

class OrderController extends Controller {
  async createOrder() {
    const { ctx } = this;
    const { pictureList, sku } = ctx.request.body
    if (result.affectedRows === 1) {
      ctx.body = successMsg();
    }
  }

  async getDetails() {
    const { ctx } = this;
    const { id } = ctx.query;

    // 获取商品信息
    const goodsSQL = `SELECT * FROM goods WHERE id = ${id} AND isDelete = 1`;
    const goodsResult = await this.app.mysql.query(goodsSQL);
    const goods = goodsResult[0];

    // 获取商品图片列表
    const pictureSQL = `SELECT url FROM goods_picture_list WHERE goodsId = ${id}`;
    const pictureResult = await this.app.mysql.query(pictureSQL);
    const pictureList = pictureResult.map(item => item.url);

    // 获取SKU信息
    const skuSQL = `SELECT * FROM sku_goods WHERE goodsId = ${id}`;
    const skuResult = await this.app.mysql.query(skuSQL);
    const sku = skuResult.map(item => {
      const skuIdArr = item.skuId.split(',');
      const skuObj = { skuStock: item.skuStock, skuPrice: item.skuPrice };
      skuIdArr.forEach((name, index) => {
        skuObj[`name${index}`] = name;
      });
      return skuObj;
    });

    // 组装数据
    const data = {
      ...goods,
      pictureList,
      sku,
    };

    ctx.body = successMsg(data);
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
  // 订单列表
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
        o.totao_quantity,
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
        p.name AS address_name,
        p.phone AS address_phone,
        p.address AS address_detail,
        s.skuId,
        s.goods_picture,
        (SELECT COUNT(*) FROM goods_order) AS total
      FROM
        goods_order o
        LEFT JOIN address p ON o.address_id = p.id
        INNER JOIN goods g ON o.goods_id = g.id
        INNER JOIN sku_goods s ON o.sku_id = s.id
      WHERE
        1 = 1 ${whereClause}
      GROUP BY
        o.id,
        o.user_id,
        o.total_price,
        o.totao_quantity,
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
        p.name,
        p.phone,
        p.address,
        s.skuId,
        s.goods_picture
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
}


module.exports = OrderController;
