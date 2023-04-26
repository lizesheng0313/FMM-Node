/*
 * @Author: lizesheng
 * @Date: 2023-02-23 14:08:48
 * @LastEditors: lizesheng
 * @LastEditTime: 2023-04-26 17:22:16
 * @important: 重要提醒
 * @Description: 备注内容
 * @FilePath: /commerce_egg/app/controller/programTrack.js
 */
'use strict';
const { successMsg } = require('../../utils/utils');
const { Controller } = require('egg');

class ProgramTrackController extends Controller {
  async add() {
    const { ctx } = this;
    const user_id = ctx.user?.user_id;
    const rows = {
      ...ctx.request.body,
      create_time: Date.now(),
      user_id: user_id || '',
    };
    const result = await this.app.mysql.insert('tracking_data', rows);
    if (result.affectedRows === 1) {
      ctx.body = successMsg()
    }
  }
}


module.exports = ProgramTrackController;
