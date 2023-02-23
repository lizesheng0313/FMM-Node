/*
 * @Author: lizesheng
 * @Date: 2023-02-23 14:08:48
 * @LastEditors: lizesheng
 * @LastEditTime: 2023-02-23 16:06:55
 * @important: 重要提醒
 * @Description: 备注内容
 * @FilePath: /commerce_egg/config/config.default.js
 */
/* eslint valid-jsdoc: "off" */

'use strict';

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = exports = {};
  config.mysql = {
    // 单数据库信息配置
    client: {
      // host
      host: '192.168.64.203',
      // 端口号
      port: '3306',
      // 用户名
      user: 'root',
      // 密码
      password: '@lizesheng123@',
      // 数据库名
      database: 'e_commerce',
    },
    // 是否加载到 app 上，默认开启
    app: true,
    // 是否加载到 agent 上，默认关闭
    agent: false,
  };
  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1677132511139_1119';

  // add your middleware config here
  config.middleware = ['errorHandler'];
  // add your user config here
  const userConfig = {
    // myAppName: 'egg',
  };

  return {
    ...config,
    ...userConfig,
  };
};
