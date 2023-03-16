/*
 * @Author: lizesheng
 * @Date: 2023-02-23 14:08:48
 * @LastEditors: lizesheng
 * @LastEditTime: 2023-03-12 20:47:36
 * @important: 重要提醒
 * @Description: 备注内容
 * @FilePath: /commerce_egg/app/controller/programHome.js
 */
'use strict';
const { successMsg } = require('../../utils/utils')
const { Controller } = require('egg');

class ProgrmHOmeController extends Controller {
  async getBanner() {
    const { ctx } = this;
    const result = await this.app.mysql.select('program_swiper')
    ctx.body = successMsg({
      list: result
    });
  }
  async getClassifcation() {
    const { ctx } = this;
    const { typeId, number } = ctx.query
    const result = await this.app.mysql.select('class_ification', {
      where: {
        parentId: typeId,
      },
      orders: [['order', 'ASC']],
    })
    const limitedResults = result.slice(0, number);
    ctx.body = successMsg({
      list: limitedResults
    });
  }
}

module.exports = ProgrmHOmeController;
