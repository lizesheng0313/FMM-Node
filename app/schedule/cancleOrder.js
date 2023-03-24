/*
 * @Author: lizesheng
 * @Date: 2023-03-24 16:58:09
 * @LastEditors: lizesheng
 * @LastEditTime: 2023-03-24 17:34:10
 * @important: 重要提醒
 * @Description: 备注内容
 * @FilePath: /commerce_egg/app/schedule/cancleOrder.js
 */

'use strict';
module.exports = {
  schedule: {
    interval: '5m', // 5 分钟间隔
    immediate: true, // 是否立即执行一次
    type: 'all', // 指定所有的 worker 都需要执行
  },
  async subscribe(ctx) {
    // 查找未支付订单
    const now = new Date();
    const thirtyMinutesAgo = new Date(now - 30 * 60 * 1000);
    const orders = await ctx.app.mysql.select('goods_order', {
      where: {
        pay_status: '0',
        create_time: {
          '<': thirtyMinutesAgo,
        },
      },
    });

    if (orders && orders.length > 0) {
      for (const order of orders) {
        // 取消订单的逻辑
        await mysql.update('goods_order', {
          id: order.id,
          order_status: '5',
        });
        // 恢复库存的逻辑
        const orderItems = await mysql.select('goods_order', {
          where: {
            id: order.id,
          },
        });
        for (const item of orderItems) {
          await mysql.query(
            'UPDATE sku_goods SET skuStock = skuStock + ? WHERE id = ? AND skuId = ?',
            [item.quantity, item.id, item.sku_id]
          );
        }
      }
    }
  },
};
