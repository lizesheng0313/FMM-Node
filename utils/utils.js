/*
 * @Author: lizesheng
 * @Date: 2023-02-23 15:21:17
 * @LastEditors: lizesheng
 * @LastEditTime: 2023-02-23 15:21:41
 * @important: 重要提醒
 * @Description: 备注内容
 * @FilePath: /commerce_egg/utils/utils.js
 */
module.exports = {
  successMsg: (data) => {
    return {
      code: 0,
      message: '',
      data: data || null,
    };
  }
}