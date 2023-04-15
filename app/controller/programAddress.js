/*
 * @Author: lizesheng
 * @Date: 2023-02-23 14:08:48
 * @LastEditors: lizesheng
 * @LastEditTime: 2023-04-08 15:22:12
 * @important: 重要提醒
 * @Description: 备注内容
 * @FilePath: /commerce_egg/app/controller/programAddress.js
 */
'use strict';
const { successMsg } = require('../../utils/utils');
const { Controller } = require('egg');

class ProgramAddressController extends Controller {
  async add() {
    const { ctx } = this;
    const { is_default } = ctx.request.body;
    const user_id = ctx.user.user_id;
    const rows = {
      ...ctx.request.body,
      create_time: Date.now(),
      user_id,
    };
    if (is_default === '1') {
      await this.app.mysql.update('address', { is_default: '0' }, {
        where: {
          user_id,
          is_default: 1,
        },
      });
    }
    const result = await this.app.mysql.insert('address', rows);
    if (result.affectedRows === 1) {
      ctx.body = successMsg({
        id: result.insertId,
      });
    }
  }
  async update() {
    const { ctx } = this;
    const { id, is_default } = ctx.request.body;
    const user_id = ctx.user.user_id;
    const updateData = {
      ...ctx.request.body,
      update_time: Date.now(),
    };

    // 如果当前更新的地址是默认地址，则将之前的默认地址修改为非默认地址
    if (is_default === '1') {
      await this.app.mysql.update('address', { is_default: 0 }, {
        where: {
          user_id,
          is_default: 1,
        },
      });
    }
    const result = await this.app.mysql.update('address', updateData, {
      where: {
        id,
      },
    });

    if (result.affectedRows === 1) {
      ctx.body = successMsg();
    }
  }


  async delete() {
    const { ctx } = this;
    const { id } = ctx.request.body;
    const address = await this.app.mysql.get('address', { id });
    // 判断是否为当前用户的地址，是则执行删除操作，否则返回错误提示
    if (ctx.user.user_id !== address.user_id) {
      ctx.status = 403;
      ctx.body = { message: 'Forbidden' };
      return;
    }
    const rows = {
      is_deleted: 1,
      update_time: Date.now(),
    };
    const result = await this.app.mysql.update('address', rows, {
      where: {
        id,
      },
    });
    if (result.affectedRows === 1) {
      ctx.body = successMsg();
    }
  }
  async get() {
    const { ctx } = this;
    const sql = 'SELECT * FROM address WHERE (is_deleted IS NULL OR is_deleted <> 1) AND user_id = ? ORDER BY create_time DESC';
    const result = await this.app.mysql.query(sql, [ ctx.user.user_id ]);
    ctx.body = successMsg({
      list: result,
    });
  }
}


module.exports = ProgramAddressController;
