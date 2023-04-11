/*
 * @Author: lizesheng
 * @Date: 2023-02-23 15:19:42
 * @LastEditors: lizesheng
 * @LastEditTime: 2023-04-11 14:38:25
 * @important: 重要提醒
 * @Description: 备注内容
 * @FilePath: /commerce_egg/app/middleware/error_handler.js
 */
'use strict';

module.exports = () => {
  return async function errorHandler(ctx, next) {
    try {
      await next();
    } catch (err) {
      const status = err?.status || 500;
      const error = status === 500 && ctx.app.config.env === 'prod'
        ? 'Internal Server Error'
        : err.message;
      // 所有的异常都在 app 上触发一个 error 事件，框架会记录一条错误日志
      ctx.logger.error('发生错误中间件', error);
      // 生产环境时 500 错误的详细错误内容不返回给客户端，因为可能包含敏感信息

      // 从 error 对象上读出各个属性，设置到响应中
      ctx.body = {
        code: 500,
        msg: error,
      };
    }
  };
};
