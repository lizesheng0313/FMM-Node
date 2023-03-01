/*
 * @Author: lizesheng
 * @Date: 2023-02-23 14:08:48
 * @LastEditors: lizesheng
 * @LastEditTime: 2023-02-26 21:22:25
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
  // 权限操作
  router.post('/api/manage/menu/add', controller.menu.add);
  router.post('/api/manage/menu/update', controller.menu.update);
  router.get('/api/manage/get/menu', controller.menu.get);
  // 商品操作
  router.get('/api/manage/getGoods', controller.goods.get);
  router.post('/api/manage/addGoods', controller.goods.add);
  router.post('/api/manage/updateGoods', controller.goods.update);
  router.post('/api/manage/deleteGoods', controller.goods.deleteGoodsInfo);
  router.get('/api/manage/getDetails', controller.goods.getDetails);

  // 分类获取 
  router.get('/api/getClassiFication', controller.constant.getClassiFication);
};
