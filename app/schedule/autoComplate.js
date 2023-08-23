module.exports = {
  schedule: {
    interval: "1d", // 每天执行一次
    immediate: true, // 是否立即执行一次
    type: "worker", // 指定一个 worker 执行
  },
  async task(ctx) {
    const { mysql } = ctx.app;
    const daysThreshold = 10; // 设置阈值为10天

    // 查询需要自动收货的订单
    const sql = `
      UPDATE goods_order
      SET order_status = 40
      WHERE order_status = 20 AND delivery_time IS NOT NULL
        AND TIMESTAMPDIFF(DAY, FROM_UNIXTIME(delivery_time / 1000), NOW()) >= ?
    `;
    const result = await mysql.query(sql, [daysThreshold]);
    if (result.affectedRows > 0) {
      ctx.logger.info(`${result.affectedRows} orders auto-received.`);
    } else {
      ctx.logger.info(`No orders auto-received.`);
    }
  },
};
