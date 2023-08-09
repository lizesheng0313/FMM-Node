"use strict";
/**
 * @param {Egg.Application} app - egg application
 */
module.exports = (app) => {
  const { router, controller, middleware } = app;
  const jwtErr = middleware.jwtErr(app.config.jwt);
  // 控制台
  router.get(
    "/api/admin/getOrderCounts",
    jwtErr,
    controller.dashboard.getOrderCounts
  );
  // 权限操作
  router.post("/api/admin/manage/menu/add", jwtErr, controller.menu.add);
  router.post("/api/admin/manage/menu/update", jwtErr, controller.menu.update);
  router.get("/api/admin/manage/get/menu", jwtErr, controller.menu.get);
  router.get(
    "/api/admin/getUserList",
    jwtErr,
    controller.permission.getUserList
  );
  // 上传分类
  router.post(
    "/api/admin/uploadTypeImage",
    jwtErr,
    controller.upload.uploadTypeImage
  );
  // 商品操作
  router.get("/api/admin/manage/getGoods", jwtErr, controller.goods.get);
  router.post("/api/admin/manage/addGoods", jwtErr, controller.goods.add);
  router.post("/api/admin/manage/updateGoods", jwtErr, controller.goods.update);
  router.post("/api/admin/manage/deleteGoods", jwtErr, controller.goods.delete);
  router.get(
    "/api/admin/manage/getDetails",
    jwtErr,
    controller.goods.getDetails
  );

  // 分类相关接口
  router.get(
    "/api/admin/getClassiFication",
    jwtErr,
    controller.constant.getClassiFication
  );
  router.post(
    "/api/admin/category/add",
    jwtErr,
    controller.category.addCategory
  );
  router.post(
    "/api/admin/category/edit",
    jwtErr,
    controller.category.editCategory
  );
  router.post(
    "/api/admin/category/delete",
    jwtErr,
    controller.category.deleteCategory
  );

  // 订单
  router.get("/api/admin/order/list", jwtErr, controller.order.getOrder);
  router.get(
    "/api/admin/order/returnList",
    jwtErr,
    controller.order.getReturnOrder
  );
  router.post("/api/admin/order/shipGoods", jwtErr, controller.order.shipGoods);
  router.post(
    "/api/admin/order/agreen",
    jwtErr,
    controller.order.goodsAgreenOperation
  );
  router.post(
    "/api/admin/order/refuse",
    jwtErr,
    controller.order.goodsRefuseOperation
  );
  router.post(
    "/api/admin/order/approveRefund",
    jwtErr,
    controller.order.approveRefund
  );
  router.post(
    "/api/admin/order/receivedGoods",
    jwtErr,
    controller.order.receivedGoods
  );
  router.post(
    "/api/admin/order/getLogList",
    jwtErr,
    controller.order.getLogList
  );
  router.get(
    "/api/admin/order/getExpressList",
    jwtErr,
    controller.order.getExpressList
  );
  // 登录
  router.post("/api/admin/user/login", controller.user.login);
  // 爬虫
  router.get("/api/admin/manage/getTargetInfo", controller.spider.scrapeData);

  // 小程序
  // 用户
  router.get("/api/program/user/login", controller.programUser.login);
  router.post(
    "/api/program/user/update",
    jwtErr,
    controller.programUser.update
  );

  // 获取token
  router.get("/api/program/getToken", controller.programUser.getToken);

  // 首页
  router.get("/api/home/getBanner", controller.programHome.getBanner);
  router.get(
    "/api/home/getClassifcation",
    controller.programHome.getClassifcation
  );
  router.get("/api/home/getHomeGoods", controller.programHome.getHomeGoods);
  router.get("/api/home/getClassGoods", controller.programHome.getClassGoods);
  router.get("/api/searchGoods", controller.programHome.searchGoods);

  // 收件人
  router.post("/api/address/add", jwtErr, controller.programAddress.add);
  router.post("/api/address/update", jwtErr, controller.programAddress.update);
  router.post("/api/address/delete", jwtErr, controller.programAddress.delete);
  router.get("/api/address/get", jwtErr, controller.programAddress.get);

  // 订单
  router.post(
    "/api/order/createOrder",
    jwtErr,
    controller.programOrder.createOrder
  );
  router.get(
    "/api/order/getOrderStatusCount",
    jwtErr,
    controller.programOrder.getOrderStatusCount
  );
  router.get(
    "/api/order/getListStatus",
    jwtErr,
    controller.programOrder.getListStatus
  );
  router.post(
    "/api/order/cancleOrder",
    jwtErr,
    controller.programOrder.cancelOrder
  );
  router.post(
    "/api/order/confirmReceipt",
    jwtErr,
    controller.programOrder.confirmReceipt
  );
  router.get(
    "/api/order/getOrderDetails",
    jwtErr,
    controller.programOrder.getOrderDetails
  );
  router.post(
    "/api/order/deleteOrder",
    jwtErr,
    controller.programOrder.deleteOrder
  );
  router.get(
    "/api/order/getReturnOrder",
    jwtErr,
    controller.programOrder.getReturnOrder
  );
  router.get(
    "/api/order/getReturnDetails",
    jwtErr,
    controller.programOrder.getReturnDetails
  );
  router.post(
    "/api/order/returnGoods",
    jwtErr,
    controller.programOrder.returnGoods
  );
  router.post(
    "/api/order/getLogistics",
    jwtErr,
    controller.programOrder.getLogistics
  );
  router.post(
    "/api/order/postReturnLogistic",
    jwtErr,
    controller.programOrder.postReturnLogistic
  );
  router.post("/api/order/payNotify", controller.programOrder.payNotify);
  router.post("/api/order/payment", jwtErr, controller.programOrder.payment);
  router.post(
    "/api/order/applyRefund",
    jwtErr,
    controller.programOrder.applyRefund
  );
  // 商品
  router.get("/api/goods/getDetails", controller.programGoods.getDetails);
  // 分类
  router.get(
    "/api/goods/getClassiFication",
    controller.programGoods.getClassiFication
  );

  // 上传
  router.post("/api/uploadImage", jwtErr, controller.upload.uploadImage);

  // 埋点
  router.post("/api/events", controller.programTrack.add);
};
