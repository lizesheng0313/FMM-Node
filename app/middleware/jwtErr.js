/*
 * @Author: lizesheng
 * @Date: 2023-03-04 18:34:47
 * @LastEditors: lizesheng
 * @LastEditTime: 2023-04-11 14:35:10
 * @important: 重要提醒
 * @Description: 备注内容
 * @FilePath: /commerce_egg/app/middleware/jwtErr.js
 */

'use strict';
module.exports = options => {
  return async function jwtErr(ctx, next) {
    // 判断是否需要验证 token
    const token = ctx.request.header.authorization;
    if (token) {
      try {
        // 解码token
        ctx.user = await ctx.app.jwt.verify(token, options.secret);
        await next();
      } catch (error) {
        if (error.message === 'jwt expired' || error.message === 'jwt malformed') {
          ctx.body = {
            code: 403,
            message: '未登录,请重新登录',
          };
          return;
        }
        ctx.logger.error('jwt_error', err);
        ctx.body = {
          code: 401,
          message: error.message,
        };
        return;
      }
    } else {
      ctx.body = {
        code: 2007,
        message: '用户登录已过期,请重新登录',
      };
      return;
    }
  };
};
