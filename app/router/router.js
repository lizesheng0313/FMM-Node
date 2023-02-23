/*
 * @Author: lizesheng
 * @Date: 2023-02-23 14:08:48
 * @LastEditors: lizesheng
 * @LastEditTime: 2023-02-23 15:31:18
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
  router.post('/api/manage/addMenu', controller.menu.add);
  router.post('/api/manage/updateMenu', controller.menu.update);
  router.get('/api/manage/getMenu', controller.menu.get);
};
