/*
 * @Author: lizesheng
 * @Date: 2023-04-08 19:44:24
 * @LastEditors: lizesheng
 * @LastEditTime: 2023-04-14 15:20:45
 * @important: 重要提醒
 * @Description: 备注内容
 * @FilePath: /commerce_egg/app/schedule/getAccessToken.js
 */
module.exports = {
  schedule: {
    interval: '6840000', // 1.9小时执行一次
    immediate: true,
    type: 'all', // 指定所有的 worker 都需要执行
  },
  async task(ctx) {
    const url = 'https://api.weixin.qq.com/cgi-bin/token';
    const data = {
      grant_type: 'client_credential',
      appid: 'wxf9b3e05e674469ac',
      secret: '0ff35a933665f3b48d80a109ddb34e24',
    };
    try {
      const result = await ctx.curl(url, {
        data,
        dataType: 'json',
      });
      if (result.data.access_token) {
        const row = {
          id: 1,
          access_token: result.data.access_token,
        };
        ctx.app.mysql.update('token', row);
      }
    } catch {
      ctx.logger.err('1.9小时获取token失败了');
    }
  },
};
