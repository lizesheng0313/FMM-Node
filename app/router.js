/*
 * @Author: lizesheng
 * @Date: 2023-02-23 14:08:48
 * @LastEditors: lizesheng
 * @LastEditTime: 2023-04-01 23:59:26
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
  router.post('/api/manage/deleteGoods', jwtErr, controller.goods.delete);
  router.get('/api/manage/getDetails', jwtErr, controller.goods.getDetails);

  // 分类获取 
  router.get('/api/getClassiFication', jwtErr, controller.constant.getClassiFication);

  // 订单
  router.get('/api/order/list', jwtErr, controller.order.getOrder);
  router.get('/api/order/returnList', jwtErr, controller.order.getReturnOrder)
  router.post('/api/order/shipGoods', jwtErr, controller.order.shipGoods);
  router.post('/api/order/agreen', jwtErr, controller.order.goodsAgreenOperation);
  router.post('/api/order/refuse', jwtErr, controller.order.goodsRefuseOperation);

  // 登录
  router.post('/api/user/login', controller.user.login)

  // 小程序

  // 登录注册
  router.get('/api/home/getBanner', controller.programHome.getBanner)

  // 首页
  router.get('/api/home/getBanner', controller.programHome.getBanner)
  router.get('/api/home/getClassifcation', controller.programHome.getClassifcation)
  router.get('/api/home/getHomeGoods', controller.programHome.getHomeGoods)
  router.get('/api/home/getClassGoods', controller.programHome.getClassGoods)
  router.get('/api/searchGoods', controller.programHome.searchGoods)
  router.get('/api/goods/getDetails', controller.programGoods.getDetails);

  // 收件人
  router.post('/api/address/add', controller.programAddress.add)
  router.post('/api/address/update', controller.programAddress.update)
  router.post('/api/address/delete', controller.programAddress.delete)
  router.get('/api/address/get', controller.programAddress.get)

  // 订单
  router.post('/api/order/createOrder', controller.programOrder.createOrder)
  router.get('/api/order/getOrderStatusCount', controller.programOrder.getOrderStatusCount)

};
