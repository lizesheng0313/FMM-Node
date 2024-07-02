'use strict';
const { successMsg } = require('../../utils/utils');
const { Controller } = require('egg');

class ConstantController extends Controller {
  async login() {
    const { ctx, app } = this;
    const { username, password } = ctx.request.body;

    const user = await app.mysql.query('SELECT id, username, avatar, role, eid FROM user WHERE username = ? AND password = ?', [username, password]);
    if (user && user?.length > 0) {
      const token = app.jwt.sign({ username, role: user[0].role, eid: user[0].eid }, app.config.jwt.secret);
      ctx.set({ authorization: token });
      ctx.body = successMsg({
        userInfo: user[0],
      });
    } else {
      ctx.body = { code: -1, message: '用户名或密码错误' };
    }
  }
}

module.exports = ConstantController;
