'use strict';

const Service = require('egg').Service;
const {
  fetchTurnover,
  fetchDailyTurnover,
  fetchTodayTurnover,
  fetchTotalOrder,
  fetchDailyOrder,
  fetchTodayOrder,
  fetchTotalUser,
  fetchDailyUser,
  fetchTodayUser,
  fetchMonthlyTurnoverWithTitle,
  fetchMonthlyOrderWithTitle,
  fetchAllGoods,
  fetchTodayGoods,
} = require('../mapper/dashboard');
const { successMsg, getTodayTimestamps } = require('../../utils/utils');

class DashboardService extends Service {
  // 获取基本信息
  async fetchCharts() {
    const { ctx } = this;
    const eid = ctx.user.eid;
    const { start, end } = getTodayTimestamps();
    const turnover = await ctx.app.mysql.query(fetchTurnover, [eid]); // 获取总销售额
    const dailyTurnover = await ctx.app.mysql.query(fetchDailyTurnover, [eid]); // 获取每日的销售额
    const todayTurnover = await ctx.app.mysql.query(fetchTodayTurnover, [eid, start, end]); // 获取今天的销售额
    const totalOrder = await ctx.app.mysql.query(fetchTotalOrder, [eid]); // 获取总订单数
    const dailyOrder = await ctx.app.mysql.query(fetchDailyOrder, [eid]); // 获取每日的订单数
    const todayOrder = await ctx.app.mysql.query(fetchTodayOrder, [eid, start, end]); // 获取今天的订单数
    const totalUser = await ctx.app.mysql.query(fetchTotalUser, [eid]); // 获取总用户数
    const dailyUser = await ctx.app.mysql.query(fetchDailyUser, [eid]); // 获取每日的用户数
    const todayUser = await ctx.app.mysql.query(fetchTodayUser, [eid, start, end]); // 获取今天的用户数
    const monthlyTurnoverResult = await ctx.app.mysql.query(fetchMonthlyTurnoverWithTitle, [eid]); // 获取不同eid今年（按月）的销售对比
    const monthlyOrderResult = await ctx.app.mysql.query(fetchMonthlyOrderWithTitle, [eid]); // 获取不同eid今年（按月）的订单对比
    const allGoods = await ctx.app.mysql.query(fetchAllGoods); // 获取所有的商品
    const todayGoods = await ctx.app.mysql.query(fetchTodayGoods, [start, end]); // 获取今天新增的商品
    const groupedData = monthlyTurnoverResult.reduce((acc, item) => {
      const { eid, title, month, total_price } = item;
      if (!acc[eid]) {
        acc[eid] = { eid, title, monthly_data: Array(12).fill(0) };
      }
      const monthIndex = parseInt(month.split('-')[1], 10) - 1; // 获取月份索引（0-11）
      acc[eid].monthly_data[monthIndex] = total_price;
      return acc;
    }, {});

    const monthlyTurnover = Object.values(groupedData);

    const groupedOrderData = monthlyOrderResult.reduce((acc, item) => {
      const { eid, title, month, total_order } = item;
      if (!acc[eid]) {
        acc[eid] = { eid, title, monthly_data: Array(12).fill(0) };
      }
      const monthIndex = parseInt(month.split('-')[1], 10) - 1; // 获取月份索引（0-11）
      acc[eid].monthly_data[monthIndex] = total_order;
      return acc;
    }, {});

    const monthlyOrder = Object.values(groupedOrderData);

    return successMsg({
      turnover: turnover[0].total_price, // 总销售额
      dailyTurnover, // 每日的销售额
      todayTurnover: todayTurnover[0].total_price, // 今天的销售额
      totalOrder: totalOrder[0].total_order, // 总订单数
      dailyOrder, // 每日的订单数
      todayOrder: todayOrder[0].total_order, // 今天的订单数
      totalUser: totalUser[0].total_user, // 总用户数
      todayUser: todayUser[0].total_user, // 今天的用户数
      dailyUser, // 每日的用户数
      monthlyTurnover, // 不同eid今年（按月）的销售对比
      monthlyOrder, // 不同eid今年（按月）的订单对比
      totalGoods: allGoods[0].total_goods, // 总商品数
      todayGoods: todayGoods[0].total_goods, // 今天新增的商品数
    });
  }
}

module.exports = DashboardService;
