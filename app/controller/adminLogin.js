/*
 * @Author: lizesheng
 * @Date: 2023-02-23 14:08:48
 * @LastEditors: lizesheng
 * @LastEditTime: 2023-03-04 22:28:10
 * @important: 重要提醒
 * @Description: 备注内容
 * @FilePath: /commerce_egg/app/controller/adminLogin.js
 */
'use strict';
const { successMsg } = require('../../utils/utils')
const { Controller } = require('egg');

class ConstantController extends Controller {
  async login() {
    const { ctx, app } = this;
    const { username, password } = ctx.request.body

    const user = await app.mysql.query('SELECT id, username,avatar,role FROM user WHERE username = ? AND password = ?', [username, password]);
    if (user && user?.length > 0) {
      const token = app.jwt.sign({ username }, app.config.jwt.secret,
        // {
        //   expiresIn: 3600, // 1小时过期
        // }
      )
      ctx.set({ authorization: token });
      ctx.body = successMsg({
        userInfo: user[0]
      });
    } else {
      ctx.body = { code: -1, message: '用户名或密码错误' };
    }
  }
}

module.exports = ConstantController;
