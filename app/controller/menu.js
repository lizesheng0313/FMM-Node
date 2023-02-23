/*
 * @Author: lizesheng
 * @Date: 2023-02-23 14:08:48
 * @LastEditors: lizesheng
 * @LastEditTime: 2023-02-23 15:48:54
 * @important: 重要提醒
 * @Description: 备注内容
 * @FilePath: /commerce_egg/app/controller/menu.js
 */
'use strict';
const { successMsg } = require('../../utils/utils')
const { Controller } = require('egg');

class MenuController extends Controller {
  async add() {
    const { ctx } = this;
    const { title, order, icon, display, menuUrl, funCode, parentId } = ctx.request.body
    const user = await this.app.mysql.insert('menu', title, order, icon, display, menuUrl, funCode, parentId)
    if (result.affectedRows === 1) {
      ctx.body = successMsg();
    }
  }
  async update() {
    const { ctx } = this;
    const { title, order, icon, display, menuUrl, funCode, parentId, id } = ctx.request.body
    const result = await this.app.mysql.update('menu', { title, order, icon, display, menuUrl, funCode, parentId }, {
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
    const menuList = await this.app.mysql.select('menu')
    console.log(menu)
    ctx.body = successMsg();
  }
}

module.exports = MenuController;
