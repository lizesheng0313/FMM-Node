/*
 * @Author: lizesheng
 * @Date: 2023-02-23 14:08:48
 * @LastEditors: lizesheng
 * @LastEditTime: 2023-04-12 09:35:22
 * @important: 重要提醒
 * @Description: 备注内容
 * @FilePath: /commerce_egg/app/controller/programUser.js
 */
'use strict';
const { successMsg } = require('../../utils/utils');
const { Controller } = require('egg');

class ProgrmUserController extends Controller {
  async login() {
    const { ctx, app } = this;
    const { appid } = ctx.query;
    const appObj = await this.app.mysql.get('program_secret', { appid });
    // 配置化参数
    const data = {
      appid,
      secret: appObj.secret,
      js_code: ctx.query.code,
      grant_type: 'authorizastion_code',
    };
    // 换openid
    const wxResponse = await ctx.curl('https://api.weixin.qq.com/sns/jscode2session', {
      data,
      dataType: 'json',
    });
    if (wxResponse.data.errmsg) {
      ctx.body = {
        code: 101,
        message: wxResponse.data.errmsg,
      };
    } else {
      // 登录token
      const token = app.jwt.sign({ user_id: wxResponse.data.openid, appid }, app.config.jwt.secret);
      const result = await this.app.mysql.get('program_user', { user_id: wxResponse.data.openid });
      // 注册用户
      if (!result) {
        await this.app.mysql.insert('program_user', { user_id: wxResponse.data.openid, ch: ctx.query?.ch, unionid: wxResponse.data?.unionid });
      }
      const userInfo = await this.app.mysql.select('program_user', {
        where: { user_id: wxResponse.data.openid },
      });
      if (userInfo[0]) {
        userInfo[0].nick_name = decodeURI(userInfo[0]?.nick_name);
      }
      ctx.set({ authorization: token });
      ctx.body = {
        code: 0,
        message: '',
        data: userInfo[0],
      };
    }
  }
  // 更新用户信息
  async update() {
    const { ctx } = this;
    const row = {
      ...ctx.request.body,
      nick_name: encodeURI(ctx.request.body.nick_name),
    };
    const options = {
      where: {
        user_id: ctx.user.user_id,
      },
    };
    const result = await this.app.mysql.update('program_user', row, options);
    if (result.affectedRows === 1) {
      ctx.body = successMsg();
    }
  }
  // 获取用户信息
  async get() {
    const { ctx } = this;
    const result = await this.app.mysql.select('program_user', {
      where: { user_id: ctx.user.user_id },
    });
    ctx.body = successMsg(result[0]);
  }
  async getToken() {
    const { ctx } = this;
    const result = await this.app.mysql.select('token');
    ctx.body = successMsg(result[0]);
  }
}

module.exports = ProgrmUserController;
