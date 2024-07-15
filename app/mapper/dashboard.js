module.exports = {
  // 获取总销售额
  fetchTurnover: 'SELECT SUM(total_price) AS total_price FROM goods_order WHERE eid = ? AND pay_status = 1 AND order_status != 90;',

  // 获取每日的销售额
  fetchDailyTurnover: `SELECT FROM_UNIXTIME(create_time / 1000, '%Y-%m-%d') AS date, SUM(total_price) AS total_price FROM goods_order WHERE eid = ? AND pay_status = 1 AND order_status != 90 AND FROM_UNIXTIME(create_time / 1000, '%Y') = YEAR(CURDATE()) GROUP BY date;`,

  // 获取今天的销售额
  fetchTodayTurnover: 'SELECT COALESCE(SUM(total_price), 0) AS total_price FROM goods_order WHERE eid = ? AND pay_status = 1 AND order_status != 90 AND create_time BETWEEN ? AND ?;',

  // 获取总订单数
  fetchTotalOrder: 'SELECT COUNT(*) AS total_order FROM goods_order WHERE eid = ?;',

  // 获取每日的订单数
  fetchDailyOrder: `SELECT FROM_UNIXTIME(create_time / 1000, '%Y-%m-%d') AS date, COUNT(*) AS total_order FROM goods_order WHERE eid = ? AND FROM_UNIXTIME(create_time / 1000, '%Y') = YEAR(CURDATE()) GROUP BY date;`,

  // 获取今天的订单数
  fetchTodayOrder: 'SELECT COUNT(*) AS total_order FROM goods_order WHERE eid = ? AND create_time BETWEEN ? AND ?;',

  // 获取总用户数
  fetchTotalUser: 'SELECT COUNT(*) AS total_user FROM program_user WHERE eid = ?;',

  // 获取每日的用户数
  fetchDailyUser: `SELECT FROM_UNIXTIME(create_time / 1000, '%Y-%m-%d') AS date, COUNT(*) AS total_user FROM program_user WHERE eid = ? AND FROM_UNIXTIME(create_time / 1000, '%Y') = YEAR(CURDATE()) GROUP BY date;`,

  // 获取今天的用户数
  fetchTodayUser: 'SELECT COUNT(*) AS total_user FROM program_user WHERE eid = ? AND create_time BETWEEN ? AND ?;',

  // 获取不同eid今年（按月）的销售对比
  fetchMonthlyTurnoverWithTitle: `SELECT go.eid, bc.title, DATE_FORMAT(FROM_UNIXTIME(go.create_time / 1000), '%Y-%m') AS month, SUM(go.total_price) AS total_price FROM goods_order go JOIN basic_config bc ON go.eid = bc.eid WHERE YEAR(FROM_UNIXTIME(go.create_time / 1000)) = YEAR(CURDATE()) AND go.pay_status = 1 AND go.order_status != 90 GROUP BY go.eid, bc.title, month ORDER BY go.eid, month ASC;`,

  // 获取不同eid今年（按月）的新增用户对比
  fetchMonthlyNewUserWithTitle: `SELECT pu.eid, bc.title, DATE_FORMAT(FROM_UNIXTIME(pu.create_time / 1000), '%Y-%m') AS month, COUNT(pu.user_id) AS total_user FROM program_user pu JOIN basic_config bc ON pu.eid = bc.eid WHERE YEAR(FROM_UNIXTIME(pu.create_time / 1000)) = YEAR(CURDATE()) GROUP BY pu.eid, bc.title, month ORDER BY pu.eid, month ASC;`,

  // 获取不同eid今年（按月）的订单对比
  fetchMonthlyOrderWithTitle: `SELECT go.eid, bc.title, DATE_FORMAT(FROM_UNIXTIME(go.create_time / 1000), '%Y-%m') AS month, COUNT(go.id) AS total_order FROM goods_order go JOIN basic_config bc ON go.eid = bc.eid WHERE YEAR(FROM_UNIXTIME(go.create_time / 1000)) = YEAR(CURDATE()) GROUP BY go.eid, bc.title, month ORDER BY go.eid, month ASC;`,

  // 获取所有的商品
  fetchAllGoods: 'SELECT COUNT(*) AS total_goods FROM goods;',

  // 今天新增商品
  fetchTodayGoods: 'SELECT COUNT(*) AS total_goods FROM goods WHERE createTime BETWEEN ? AND ?;',
};
