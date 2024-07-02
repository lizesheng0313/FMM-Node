module.exports = {
  schedule: {
    interval: '6840000', // 1.9小时执行一次
    immediate: true,
    type: 'all', // 指定所有的 worker 都需要执行
  },
  async task(ctx) {
    try {
      const programSecrets = await ctx.app.mysql.select('program_secret');
      for (const programSecret of programSecrets) {
        const url = 'https://api.weixin.qq.com/cgi-bin/token';
        const data = {
          grant_type: 'client_credential',
          appid: programSecret.appid,
          secret: programSecret.secret,
        };
        const result = await ctx.curl(url, {
          data,
          dataType: 'json',
        });

        if (result.data.access_token) {
          await ctx.app.mysql.update('token', { access_token: result.data.access_token }, { where: { eid: programSecret.appid } });
        }
      }
    } catch (error) {
      ctx.logger.error('1.9小时获取token失败了', error);
    }
  },
};
