/*
 * @Author: lizesheng
 * @Date: 2023-02-23 14:08:48
 * @LastEditors: lizesheng
 * @LastEditTime: 2023-02-23 15:02:19
 * @important: 重要提醒
 * @Description: 备注内容
 * @FilePath: /commerce_egg/app/controller/home.js
 */
'use strict';

const { Controller } = require('egg');

class HomeController extends Controller {
  async index() {
    const { ctx } = this;
    const user = await this.app.mysql.get('menu', { id: '1' })
    console.log(user, '----user')
    ctx.body = 'hi, egg222';
  }
}

module.exports = HomeController;
