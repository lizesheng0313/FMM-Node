/*
 * @Author: lizesheng
 * @Date: 2023-02-23 14:08:48
 * @LastEditors: lizesheng
 * @LastEditTime: 2023-02-26 21:38:01
 * @important: 重要提醒
 * @Description: 备注内容
 * @FilePath: /commerce_egg/app/controller/goods.js
 */
'use strict';
const { successMsg, getCurrentDate } = require('../../utils/utils')
const { Controller } = require('egg');

class GoodsController extends Controller {
  async add() {
    const { ctx } = this;
    console.log(ctx.request.body, '---ctx.request.body')
    const rows = {
      ...ctx.request.body,
      createTime: getCurrentDate(),
      isDelete: 1,
      latest: false,
      online: false,
      recommend: false,
    }
    const result = await this.app.mysql.insert('goods', rows)
    if (result.affectedRows === 1) {
      ctx.body = successMsg();
    }
  }
  async update() {
    const { ctx } = this;
    const { id } = ctx.request.body
    const rows = {
      ...ctx.request.body,
      updateTime: getCurrentDate(),
    }
    const result = await this.app.mysql.update('goods', rows, {
      where: {
        id
      }
    })
    if (result.affectedRows === 1) {
      ctx.body = successMsg();
    }
  }
  async get() {
    const { ctx } = this;
    const { pageIndex = 1, pageSize = 10 } = ctx.query
    const result = await this.app.mysql.select('goods', {
      where: { isDelete: '1' }, // WHERE 条件
      columns: ['id', 'name', 'picture', 'price', 'number', 'volume', 'createTime', 'updateTime',], // 要查询的表字段
      orders: [['createTime', 'desc']], // 排序方式
      limit: pageSize, // 返回数据量
      offset: (pageIndex - 1) * pageSize, // 数据偏移量
    })
    ctx.body = successMsg({
      list: result,
      total: result?.length,
      pageSize: pageSize,
      pageIndex
    });
  }
}

module.exports = GoodsController;
