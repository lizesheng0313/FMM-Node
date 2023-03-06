/*
 * @Author: lizesheng
 * @Date: 2023-03-06 10:09:19
 * @LastEditors: lizesheng
 * @LastEditTime: 2023-03-06 10:14:26
 * @important: 重要提醒
 * @Description: 备注内容
 * @FilePath: /commerce_egg/const/index.js
 */
const PAYSTATUS = {
  0: '待支付',
  1: '已支付',
  2: '已取消',
}

const ORDERSTATUS = {
  0: '待发货',
  1: '已发货',
  2: '已收货',
  3: '已完成'
}

module.exports = {
  PAYSTATUS, ORDERSTATUS
}