'use strict';
const { successMsg } = require('../../utils/utils');
const { Controller } = require('egg');
const moment = require('moment');

class DashBoardController extends Controller {
  async getOrderCounts() {
    const { ctx } = this;
    const eid = ctx.user.eid;

    try {
      // 获取当天开始和结束的时间戳
      const startOfDay = moment().startOf('day').valueOf();
      const endOfDay = moment().endOf('day').valueOf();

      // 辅助函数，用于获取订单数量
      const getOrdersCount = async (query, params) => {
        const result = await ctx.app.mysql.query(query, params);
        return result[0].count;
      };

      // 查询今天所有的订单数量
      const todayOrdersCount = await getOrdersCount(
        `
        SELECT COUNT(*) AS count
        FROM goods_order
        WHERE eid = ? AND create_time >= ? AND create_time <= ?
      `,
        [eid, startOfDay, endOfDay]
      );

      // 查询已支付并且待发货订单数量
      const paidAndUnshippedOrdersCount = await getOrdersCount(
        `
        SELECT COUNT(*) AS count
        FROM goods_order
        WHERE eid = ? AND pay_status = ? AND order_status = ?
      `,
        [eid, 1, 10]
      );

      // 查询今天已支付并且待发货的订单列表
      const todayPaidOrders = await ctx.app.mysql.query(
        `
        SELECT *
        FROM goods_order
        WHERE eid = ? AND create_time >= ? AND create_time <= ? AND pay_status = ? AND order_status = ?
      `,
        [eid, startOfDay, endOfDay, 1, 10]
      );

      // 计算今天的营业额和总成本
      let todayRevenue = 0;
      let totalCost = 0;

      todayPaidOrders.forEach((order) => {
        todayRevenue += parseFloat(order.response_price);
        totalCost += parseFloat(order.cost_price);
      });

      // 计算今天的利润
      const todayProfit = todayRevenue - totalCost;

      // 查询待退货的订单数量
      const pendingReturnOrdersCount = await getOrdersCount(
        `
        SELECT COUNT(*) AS count
        FROM goods_order_return
        WHERE eid = ? AND status = ?
      `,
        [eid, 1]
      );

      // 返回数据
      ctx.body = successMsg({
        todayRevenue: todayRevenue.toFixed(2),
        todayProfit: todayProfit.toFixed(2),
        todayOrdersCount,
        paidAndUnshippedOrdersCount,
        pendingReturnOrdersCount,
      });
    } catch (error) {
      ctx.body = {
        code: -1,
        message: '获取订单数量失败',
        error,
      };
    }
  }
  async getCharts() {
    const { ctx, service } = this;
    const result = await service.dashboard.fetchCharts();
    ctx.body = result;
  }
}

module.exports = DashBoardController;
