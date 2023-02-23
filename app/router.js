/*
 * @Author: lizesheng
 * @Date: 2023-02-23 14:08:48
 * @LastEditors: lizesheng
 * @LastEditTime: 2023-02-23 15:07:21
 * @important: 重要提醒
 * @Description: 备注内容
 * @FilePath: /commerce_egg/app/router.js
 */
'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.get('/get/user', controller.home.index);
};
