/*
 * @Author: lizesheng
 * @Date: 2023-02-23 14:08:48
 * @LastEditors: lizesheng
 * @LastEditTime: 2023-03-04 21:03:04
 * @important: 重要提醒
 * @Description: 备注内容
 * @FilePath: /commerce_egg/app/router.js
 */
'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller, middleware } = app;
  const jwtErr = middleware.jwtErr(app.config.jwt);
  // 权限操作
  router.post('/api/manage/menu/add', jwtErr, controller.menu.add);
  router.post('/api/manage/menu/update', jwtErr, controller.menu.update);
  router.get('/api/manage/get/menu', jwtErr, controller.menu.get);
  // 商品操作
  router.get('/api/manage/getGoods', jwtErr, controller.goods.get);
  router.post('/api/manage/addGoods', jwtErr, controller.goods.add);
  router.post('/api/manage/updateGoods', jwtErr, controller.goods.update);
  router.post('/api/manage/deleteGoods', jwtErr, controller.goods.deleteGoodsInfo);
  router.get('/api/manage/getDetails', jwtErr, controller.goods.getDetails);

  // 分类获取 
  router.get('/api/getClassiFication', jwtErr, controller.constant.getClassiFication);

  // 登录
  router.post('/api/user/login', controller.adminLogin.login)
};
