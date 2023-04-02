/*
 * @Author: lizesheng
 * @Date: 2023-03-06 10:09:19
 * @LastEditors: lizesheng
 * @LastEditTime: 2023-04-02 21:51:04
 * @important: 重要提醒
 * @Description: 备注内容
 * @FilePath: /commerce_egg/const/index.js
 */
const PAYSTATUS = {
  0: '待支付',
  1: '已支付',
}

const ORDERSTATUS = {
  0: '待发货',
  1: '已发货',
  2: '已收货',
  3: '已完成',
  4: '退货中',
  5: '已取消',
  60: '待评价'
}

// 退货状态

const RETURNSTATUS = {
  1: '待审核',
  2: '待退货',
  3: '已拒绝',
  4: '退货中',
  5: '已退款',

}

module.exports = {
  PAYSTATUS, ORDERSTATUS, RETURNSTATUS
}