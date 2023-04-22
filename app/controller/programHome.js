/*
 * @Author: lizesheng
 * @Date: 2023-03-11 16:41:51
 * @LastEditors: lizesheng
 * @LastEditTime: 2023-04-22 10:57:27
 * @important: 重要提醒
 * @Description: 备注内容
 * @FilePath: /commerce_egg/app/controller/programHome.js
 */

'use strict';
const { successMsg } = require('../../utils/utils');
const { Controller } = require('egg');

class ProgrmHomeController extends Controller {
  // 获取banner
  async getBanner() {
    const { ctx } = this;
    const result = await this.app.mysql.select('program_swiper');
    ctx.body = successMsg({
      list: result,
    });
  }
  // 获取分类
  async getClassifcation() {
    const { ctx } = this;
    const { typeId, is_show_home } = ctx.query;
    const where = { type_value: typeId };
    if (is_show_home !== undefined) {
      where.is_show_home = is_show_home;
    }
    const result = await this.app.mysql.select('class_ification', {
      where,
      orders: [['order', 'ASC']],
    });
    ctx.body = successMsg({
      list: result,
    });
  }

  // 获取推荐
  async getHomeGoods() {
    const { ctx } = this;
    const { recommend, latest } = ctx.query;
    const SQL = `
      SELECT g.id, g.name, g.online, g.volume,
      (SELECT sku_goods.skuPrice
       FROM sku_goods
       WHERE sku_goods.goodsId = (SELECT sku_goods.goodsId FROM sku_goods WHERE sku_goods.goodsId = g.id LIMIT 1)
       LIMIT 1) AS skuPrice, 
      (SELECT p.url
       FROM goods_picture_list p
       WHERE p.goodsId = g.id
       LIMIT 1) AS pictureUrl
      FROM goods g
      WHERE g.is_deleted != 1 AND g.online = 1 ${latest ? 'AND g.latest = 1 ' : ''}${recommend ? 'AND g.recommend = 1 ' : ''}
      ORDER BY g.createTime DESC;
    `;
    const result = await this.app.mysql.query(SQL);
    ctx.body = successMsg({
      list: result,
    });
  }

  // 获取某一个分类下的商品
  async getClassGoods() {
    const { ctx } = this;
    const { classification, pageIndex = 1, pageSize = 10 } = ctx.query;
    const limit = parseInt(pageSize);
    const offset = (pageIndex - 1) * pageSize;

    // 查询商品列表
    const result = await ctx.app.mysql.query(
      `SELECT g.id, g.name, g.online, g.volume, g.classification,
    (SELECT url FROM goods_picture_list WHERE goodsId = g.id LIMIT 1) AS pictureUrl,
    (SELECT skuPrice FROM sku_goods WHERE goodsId = g.id LIMIT 1) AS price
    FROM goods g
    WHERE g.is_deleted != ? AND JSON_CONTAINS(classification, ?) AND g.online = 1
    ORDER BY g.createTime DESC
    LIMIT ?, ?`,
      [1, classification, offset, limit]
    );

    // 查询商品总数
    const totalResult = await ctx.app.mysql.query(
      `SELECT COUNT(*) as total FROM goods WHERE is_deleted != 1 AND JSON_CONTAINS(classification, ?) AND online = 1`,
      [classification]
    );
    const total = totalResult[0].total;

    ctx.body = successMsg({
      list: result,
      total,
    });
  }



  // 搜索接口
  async searchGoods() {
    const { ctx } = this;
    const { keyword, pageIndex = 1, pageSize = 10 } = ctx.query;
    const limit = parseInt(pageSize);
    const offset = (pageIndex - 1) * pageSize;
    const [result, totalCount] = await Promise.all([
      ctx.app.mysql.query(
        `SELECT DISTINCT g.id, g.name, g.introduction, g.online, g.createTime, g.volume,
          (SELECT url FROM goods_picture_list WHERE goodsId = g.id LIMIT 1) AS pictureUrl, 
          (SELECT skuPrice FROM sku_goods WHERE goodsId = g.id LIMIT 1) AS price 
        FROM goods g 
        LEFT JOIN class_ification c ON g.classification LIKE CONCAT('%', c.value, '%')
        WHERE g.is_deleted != ? AND (
          g.name LIKE ? OR g.introduction LIKE ? OR c.label LIKE ?
        ) AND g.online = 1 
        ORDER BY g.createTime DESC
        LIMIT ?, ?`,
        [1, `%${keyword}%`, `%${keyword}%`, `%${keyword}%`, offset, limit]
      ),
      ctx.app.mysql.query(
        `SELECT COUNT(DISTINCT g.id) AS totalCount FROM goods g
        LEFT JOIN class_ification c ON g.classification LIKE CONCAT('%', c.value, '%')
        WHERE g.is_deleted != ? AND (
          g.name LIKE ? OR g.introduction LIKE ? OR c.label LIKE ?
        ) AND g.online = 1`,
        [1, `%${keyword}%`, `%${keyword}%`, `%${keyword}%`]
      ),
    ]);
    ctx.body = successMsg({
      list: result,
      total: totalCount[0].totalCount,
      pageIndex,
      pageSize,
    });
  }
}

module.exports = ProgrmHomeController;
