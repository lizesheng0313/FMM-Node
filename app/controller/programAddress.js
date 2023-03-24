/*
 * @Author: lizesheng
 * @Date: 2023-02-23 14:08:48
 * @LastEditors: lizesheng
 * @LastEditTime: 2023-03-17 10:55:41
 * @important: 重要提醒
 * @Description: 备注内容
 * @FilePath: /commerce_egg/app/controller/programAddress.js
 */
'use strict';
const { successMsg } = require('../../utils/utils')
const { Controller } = require('egg');

class ProgramAddressController extends Controller {
  async add() {
    const { ctx } = this;
    const rows = {
      ...ctx.request.body,
      createTime: Date.now(),
      user_id: ctx.user.user_id,
    }
    const result = await this.app.mysql.insert('address', rows)
    if (result.affectedRows === 1) {
      ctx.body = successMsg();
    }
  }

  async update() {
    const { ctx } = this;
    const { id } = ctx.request.body
    const rows = {
      ...ctx.request.body,
      updateTime: Date.now(),
    }
    const result = await this.app.mysql.update('address', rows, {
      where: {
        id
      }
    })
    if (result.affectedRows === 1) {
      ctx.body = successMsg();
    }
  }
  async delete() {
    const { ctx } = this
    const { id } = ctx.request.body
    const address = await this.app.mysql.get('address', { id });

    // 判断是否为当前用户的地址，是则执行删除操作，否则返回错误提示
    if (ctx.user.user_id !== address.user_id) {
      ctx.status = 403;
      ctx.body = { message: 'Forbidden' };
      return;
    }
    const rows = {
      is_deleted: 1,
      updateTime: Date.now(),
    }
    const result = await this.app.mysql.update('address', rows, {
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
    const result = await this.app.mysql.get('address', { user_id: ctx.user.user_id });
    ctx.body = successMsg({
      list: result,
    });
  }

}


module.exports = ProgramAddressController;
