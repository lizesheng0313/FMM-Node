/*
 * @Author: lizesheng
 * @Date: 2023-02-23 14:08:48
 * @LastEditors: lizesheng
 * @LastEditTime: 2023-03-22 13:15:52
 * @important: 重要提醒
 * @Description: 备注内容
 * @FilePath: /commerce_egg/app/controller/programHome.js
 */
'use strict';
const { successMsg } = require('../../utils/utils')
const { Controller } = require('egg');

class ProgrmHomeController extends Controller {
  // 获取banner
  async getBanner() {
    const { ctx } = this;
    const result = await this.app.mysql.select('program_swiper')
    ctx.body = successMsg({
      list: result
    });
  }
  // 获取分类
  async getClassifcation() {
    const { ctx } = this;
    const { typeId } = ctx.query
    const result = await this.app.mysql.select('class_ification', {
      where: {
        type_value: typeId,
        is_show_home: 0
      },
      orders: [['order', 'ASC']],
    })
    ctx.body = successMsg({
      list: result
    });
  }
  // 获取推荐
  async getHomeGoods() {
    const { ctx } = this;
    const { recommed, latest } = ctx.query
    let SQL = `SELECT g.id, g.name, g.online, p.url AS pictureUrl
    FROM goods g 
    LEFT JOIN goods_picture_list p ON g.id = p.goodsId 
    WHERE g.is_deleted != 1 `;
    if (latest) SQL += `AND g.latest = 1 `;
    if (recommed) SQL += `AND g.recommed = 1 `;
    SQL += `GROUP BY g.id ORDER BY g.createTime DESC`;
    const result = await this.app.mysql.query(SQL);
    ctx.body = successMsg({
      list: result
    });
  }
  // 获取某一个分类下的商品
  async getClassGoods() {
    const { ctx } = this;
    const { classification } = ctx.query
    const result = await app.mysql.query(
      'SELECT g.id, g.name, g.online, p.url AS pictureUrl ' +
      'FROM goods g ' +
      'LEFT JOIN goods_picture_list p ON g.id = p.goodsId ' +
      'WHERE g.is_deleted != ? AND classiFication = ? ' +
      'GROUP BY g.id ' +
      'ORDER BY g.createTime DESC',
      [1, classification]
    );
    ctx.body = successMsg({
      list: result
    });
  }
  // 搜索接口
}

module.exports = ProgrmHomeController;
