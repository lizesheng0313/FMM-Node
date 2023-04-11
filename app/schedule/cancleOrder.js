/*
 * @Author: lizesheng
 * @Date: 2023-03-24 16:58:09
 * @LastEditors: lizesheng
 * @LastEditTime: 2023-04-06 10:16:09
 * @important: 重要提醒
 * @Description: 取消订单
 * @FilePath: /commerce_egg/app/schedule/cancleOrder.js
 */

'use strict';
module.exports = {
  schedule: {
    interval: '1m', // 1分钟间隔
    immediate: true, // 是否立即执行一次
    type: 'all', // 指定所有的 worker 都需要执行
  },
  async task(ctx) {
    const { mysql } = ctx.app
    // 查找未支付订单
    const currentTime = Date.now(); // 获取当前时间戳
    const cancelTime = currentTime - 30 * 60 * 1000; // 取消时间为当前时间减去30分钟
    const sql = `SELECT * FROM goods_order WHERE pay_status = 0 AND order_status != 60 AND create_time <= ${cancelTime}`;
    const orders = await mysql.query(sql);
    if (orders && orders.length > 0) {
      for (const order of orders) {
        ctx.logger.info(`取消订单${order.id},取消时间为${Date.now()}`);
        // 取消订单的逻辑
        await mysql.update('goods_order', {
          id: order.id,
          order_status: '60',
          cancle_time: Date.now()
        });
        // 恢复库存的逻辑
        const orderItems = await mysql.select('goods_order', {
          where: {
            id: order.id,
          },
        });
        for (const item of orderItems) {
          await mysql.query(
            'UPDATE sku_goods SET skuStock = skuStock + ? WHERE goodsId = ? AND skuId = ?',
            [item.quantity, item.goods_id, item.sku_id]
          );
        }
      }
    }
  },
};