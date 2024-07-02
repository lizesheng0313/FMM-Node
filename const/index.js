/*
 * @Author: lizesheng
 * @Date: 2023-03-06 10:09:19
 * @LastEditors: lizesheng
 * @LastEditTime: 2023-04-28 18:31:18
 * @important: 重要提醒
 * @Description: 备注内容
 * @FilePath: /commerce_egg/const/index.js
 */
const PAYSTATUS = {
  0: '待支付',
  1: '已支付',
};

const ORDERSTATUS = {
  10: '待发货',
  20: '已发货',
  21: '待揽件',
  30: '已收货',
  40: '已完成',
  50: '退货中',
  60: '已取消',
  70: '待评价',
  80: '退款中',
  90: '已退款',
};

// 退货状态
const RETURNSTATUS = {
  1: '待审核',
  2: '待退货',
  3: '已拒绝',
  4: '退货中',
  5: '已退款',
  6: '已退货',
  20: '待退款',
};

module.exports = {
  PAYSTATUS,
  ORDERSTATUS,
  RETURNSTATUS,
};
