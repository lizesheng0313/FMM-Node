/*
 * @Author: lizesheng
 * @Date: 2023-02-23 14:08:48
 * @LastEditors: lizesheng
 * @LastEditTime: 2023-02-23 16:13:44
 * @important: 重要提醒
 * @Description: 备注内容
 * @FilePath: /commerce_egg/app/router/router.js
 */
'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.post('/api/management/menu/add', controller.menu.add);
  router.post('/api/management/menu/update', controller.menu.update);
  router.get('/api/management/menu/get', controller.menu.get);
};
