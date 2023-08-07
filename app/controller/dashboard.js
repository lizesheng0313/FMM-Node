"use strict";
const { successMsg } = require("../../utils/utils");
const { Controller } = require("egg");
const moment = require("moment");

class DashBoardController extends Controller {
  // ... 其他函数 ...

  async getOrderCounts() {
    const { ctx } = this;
    const eid = ctx.user.eid; // 从 ctx.user 中获取 eid
    try {
      // 查询今天所有的订单数量
      const todayOrdersCountQuery = `
        SELECT COUNT(*) AS count
        FROM goods_order
        WHERE eid = ? AND create_time >= ? AND create_time <= ?
      `;
      const todayOrdersCountParams = [
        eid,
        moment().startOf("day").unix(),
        moment().endOf("day").unix(),
      ];
      const todayOrdersCountResult = await ctx.app.mysql.query(
        todayOrdersCountQuery,
        todayOrdersCountParams
      );
      const todayOrdersCount = todayOrdersCountResult[0].count; // 今天所有的订单数量

      // 查询已支付并且待发货订单数量
      const paidAndUnshippedOrdersCountQuery = `
        SELECT COUNT(*) AS count
        FROM goods_order
        WHERE eid = ? AND pay_status = ? AND order_status = ?
      `;
      const paidAndUnshippedOrdersCountParams = [eid, 1, 10];
      const paidAndUnshippedOrdersCountResult = await ctx.app.mysql.query(
        paidAndUnshippedOrdersCountQuery,
        paidAndUnshippedOrdersCountParams
      );
      const paidAndUnshippedOrdersCount =
        paidAndUnshippedOrdersCountResult[0].count; // 已支付并且待发货订单数量

      // 查询今天已支付并且待发货的订单列表
      const todayPaidOrdersQuery = `
        SELECT *
        FROM goods_order
        WHERE eid = ? AND create_time >= ? AND create_time <= ? AND pay_status = ? AND order_status = ?
      `;
      const todayPaidOrdersParams = [
        eid,
        moment().startOf("day").unix(),
        moment().endOf("day").unix(),
        1,
        10,
      ];
      const todayPaidOrders = await ctx.app.mysql.query(
        todayPaidOrdersQuery,
        todayPaidOrdersParams
      ); // 今天已支付并且待发货的订单列表

      // 计算营业额和利润
      let todayRevenue = 0;
      let todayProfit = 0;

      todayPaidOrders.forEach((order) => {
        todayRevenue += parseFloat(order.act_price);
        todayProfit += parseFloat(order.cost_price);
      });

      // 查询待退货的订单数量
      const pendingReturnOrdersCountQuery = `
        SELECT COUNT(*) AS count
        FROM goods_order_return
        WHERE eid = ? AND status = ?
      `;
      const pendingReturnOrdersCountParams = [eid, 1];
      const pendingReturnOrdersCountResult = await ctx.app.mysql.query(
        pendingReturnOrdersCountQuery,
        pendingReturnOrdersCountParams
      );
      const pendingReturnOrdersCount = pendingReturnOrdersCountResult[0].count; // 待退货的订单数量

      ctx.body = successMsg({
        todayRevenue: todayRevenue.toFixed(2), // 今天的营业额
        todayProfit: todayProfit.toFixed(2), // 今天的利润
        todayOrdersCount, // 今天所有的订单数量
        paidAndUnshippedOrdersCount, // 已支付并且待发货订单数量
        pendingReturnOrdersCount, // 待退货的订单数量
      });
    } catch (error) {
      ctx.body = {
        code: -1,
        message: "获取订单数量失败",
        error,
      };
    }
  }
}

module.exports = DashBoardController;

module.exports = DashBoardController;
