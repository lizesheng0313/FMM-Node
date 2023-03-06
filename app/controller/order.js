/*
 * @Author: lizesheng
 * @Date: 2023-02-23 14:08:48
 * @LastEditors: lizesheng
 * @LastEditTime: 2023-03-05 20:36:14
 * @important: 重要提醒
 * @Description: 备注内容
 * @FilePath: /commerce_egg/app/controller/order.js
 */
'use strict';
const { successMsg } = require('../../utils/utils')
const { Controller } = require('egg');

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
    const SQL = `DELETE g, p FROM goods g LEFT JOIN goods_picture_list p ON g.id = p.goodsId WHERE g.id = ${id}`
    const result = await this.app.mysql.query(SQL)
    if (result.affectedRows > 0) {
      ctx.body = successMsg();
    }
  }
  // 订单列表
  async getOrder() {
    const { ctx } = this;
    const { pageIndex = 1, pageSize = 10 } = ctx.query
    const SQL = `select g.id, g.name, g.picture, g.price, g.number, g.volume, g.createTime, g.updateTime, g.classiFication, g.online,g.latest, g.quantity, g.recommend, g.order, GROUP_CONCAT(p.url) as pictureList from goods g left join goods_picture_list p on g.id = p.goodsId  WHERE g.isDelete = 1 GROUP BY g.id ORDER BY g.createTime desc limit ${parseInt(pageSize)} offset ${(pageIndex - 1) * pageSize}`
    const totalResult = await this.app.mysql.query(`SELECT COUNT(*) AS total FROM goods WHERE isDelete = 1`)
    const result = await this.app.mysql.query(SQL)
    result.forEach((item) => {
      if (item.pictureList) {
        item.pictureList = item.pictureList.split(",")
      }
    });
    ctx.body = successMsg({
      list: result,
      total: totalResult[0].total,
      pageSize: pageSize,
      pageIndex
    });
  }
}


module.exports = OrderController;
