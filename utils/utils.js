/*
 * @Author: lizesheng
 * @Date: 2023-02-23 15:21:17
 * @LastEditors: lizesheng
 * @LastEditTime: 2023-02-26 21:03:49
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
  },
  getCurrentDate: () => {
    const date = new Date()
    const year = date.getFullYear()
    let month = date.getMonth() + 1
    if (month < 10) {
      month = '0' + month
    }
    let day = date.getDate()
    if (day < 10) {
      day = '0' + day
    }
    const hours = date.getHours()
    const min = date.getMinutes()
    const seconds = date.getSeconds()
    return `${year}-${month}-${day} ${hours}:${min}:${seconds}`
  },
  getCurrentDay: () => {
    const date = new Date()
    const year = date.getFullYear()
    let month = date.getMonth() + 1
    if (month < 10) {
      month = '0' + month
    }
    let day = date.getDate()
    if (day < 10) {
      day = '0' + day
    }
    return `${year}-${month}-${day}`
  }
}